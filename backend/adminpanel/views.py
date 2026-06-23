from django.db.models import Count, Sum, F, Q, Value, DecimalField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear, Concat, Coalesce
from django.utils import timezone
from datetime import timedelta
import datetime
from decimal import Decimal
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse

from accounts.models import ProviderProfile, User
from accounts.permissions import IsAdminRole
from accounts.serializers import ProviderProfileSerializer
from adminpanel.serializers import FlaggedMessageLogSerializer, ApproveProviderSerializer
from bookings.models import Booking
from chat.models import FlaggedMessageLog
from payments.models import Payment
from services.models import Category
from adminpanel.reports import export_csv, export_excel, export_pdf


def get_date_range(request):
    range_param = request.query_params.get("range", "30days")
    now = timezone.now()
    start_date = None
    end_date = now

    if range_param == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif range_param == "7days":
        start_date = now - timedelta(days=7)
    elif range_param == "30days":
        start_date = now - timedelta(days=30)
    elif range_param == "6months":
        start_date = now - timedelta(days=180)
    elif range_param == "1year":
        start_date = now - timedelta(days=365)
    elif range_param == "custom":
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        if start_date_str:
            try:
                start_date = timezone.make_aware(datetime.datetime.strptime(start_date_str, "%Y-%m-%d"))
            except ValueError:
                pass
        if end_date_str:
            try:
                end_date = timezone.make_aware(datetime.datetime.strptime(end_date_str, "%Y-%m-%d"))
                end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            except ValueError:
                pass
    if start_date is None:
        start_date = now - timedelta(days=30)
    return start_date, end_date


class RevenueAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        # Kept for backward compatibility
        total_revenue = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID).aggregate(total=Sum("amount"))["total"] or 0
        total_bookings = Booking.objects.count()
        completed_bookings = Booking.objects.filter(status=Booking.Status.COMPLETED).count()
        cancelled_bookings = Booking.objects.filter(status=Booking.Status.CANCELLED).count()
        pending_bookings = Booking.objects.filter(status=Booking.Status.PENDING).count()

        monthly_qs = (
            Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(revenue=Sum("amount"))
            .order_by("month")
        )
        monthly_revenue = [
            {
                "month": item["month"].strftime("%b %Y") if item["month"] else "",
                "revenue": float(item["revenue"]),
            }
            for item in monthly_qs
        ]

        return Response({
            "total_revenue": float(total_revenue),
            "total_bookings": total_bookings,
            "completed_bookings": completed_bookings,
            "cancelled_bookings": cancelled_bookings,
            "pending_bookings": pending_bookings,
            "monthly_revenue": monthly_revenue,
        })


class PendingProvidersView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        providers = ProviderProfile.objects.filter(verification_status=ProviderProfile.VerificationStatus.PENDING)
        return Response(ProviderProfileSerializer(providers, many=True).data)


class ApproveProviderView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request):
        serializer = ApproveProviderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        provider = User.objects.filter(id=serializer.validated_data["provider_id"], role=User.Role.PROVIDER).first()
        if not provider:
            return Response({"detail": "Provider not found."}, status=404)

        provider.is_verified_provider = True
        provider.save(update_fields=["is_verified_provider"])
        profile = getattr(provider, "provider_profile", None)
        if profile:
            profile.verification_status = ProviderProfile.VerificationStatus.APPROVED
            profile.save(update_fields=["verification_status"])
        return Response({"detail": "Provider approved."}, status=status.HTTP_200_OK)


class RejectProviderView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request):
        serializer = ApproveProviderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        provider = User.objects.filter(id=serializer.validated_data["provider_id"], role=User.Role.PROVIDER).first()
        if not provider:
            return Response({"detail": "Provider not found."}, status=404)
        profile = getattr(provider, "provider_profile", None)
        if profile:
            profile.verification_status = ProviderProfile.VerificationStatus.REJECTED
            profile.save(update_fields=["verification_status"])
        provider.is_verified_provider = False
        provider.save(update_fields=["is_verified_provider"])
        return Response({"detail": "Provider application rejected."})


class FlaggedChatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        logs = FlaggedMessageLog.objects.select_related("sender", "booking").order_by("-flagged_at")
        return Response(FlaggedMessageLogSerializer(logs, many=True).data)


class ResolveFlaggedChatView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        log = FlaggedMessageLog.objects.filter(pk=pk).first()
        if not log:
            return Response({"detail": "Flagged message log not found."}, status=404)

        action = request.data.get("action")
        if action == "resolve":
            log.status = FlaggedMessageLog.Status.RESOLVED
        elif action == "dismiss":
            log.status = FlaggedMessageLog.Status.DISMISSED
        else:
            return Response({"detail": "Invalid action. Must be 'resolve' or 'dismiss'."}, status=400)

        log.save(update_fields=["status"])
        return Response(FlaggedMessageLogSerializer(log).data)


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Revenue
        total_revenue = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_date, end_date)).aggregate(total=Sum("amount"))["total"] or Decimal(0)

        # Bookings counts
        total_bookings = Booking.objects.filter(created_at__range=(start_date, end_date)).count()
        completed_bookings = Booking.objects.filter(status=Booking.Status.COMPLETED, created_at__range=(start_date, end_date)).count()
        cancelled_bookings = Booking.objects.filter(status=Booking.Status.CANCELLED, created_at__range=(start_date, end_date)).count()
        pending_bookings = Booking.objects.filter(status=Booking.Status.PENDING, created_at__range=(start_date, end_date)).count()

        # Users counts
        active_providers = User.objects.filter(role=User.Role.PROVIDER, is_active=True, is_verified_provider=True).count()
        active_customers = User.objects.filter(role=User.Role.CUSTOMER, is_active=True).count()

        # Growth Rate calculation
        now = timezone.now()
        start_of_current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_prev_month = (start_of_current_month - timedelta(days=1)).replace(day=1)
        end_of_prev_month = start_of_current_month - timedelta(microseconds=1)

        curr_month_rev = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__gte=start_of_current_month).aggregate(total=Sum("amount"))["total"] or Decimal(0)
        prev_month_rev = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_of_prev_month, end_of_prev_month)).aggregate(total=Sum("amount"))["total"] or Decimal(0)

        growth_percent = 0.0
        if prev_month_rev > 0:
            growth_percent = round(float((curr_month_rev - prev_month_rev) / prev_month_rev * 100), 2)
        else:
            growth_percent = 100.0 if curr_month_rev > 0 else 0.0

        return Response({
            "total_revenue": float(total_revenue),
            "total_bookings": total_bookings,
            "completed_bookings": completed_bookings,
            "cancelled_bookings": cancelled_bookings,
            "pending_bookings": pending_bookings,
            "active_providers": active_providers,
            "active_customers": active_customers,
            "monthly_growth_percent": growth_percent,
        })


class AdminRevenueAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Revenue Trends (Daily/Weekly/Monthly/Yearly)
        daily_qs = (
            Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_date, end_date))
            .annotate(day=TruncDay("created_at"))
            .values("day")
            .annotate(revenue=Sum("amount"))
            .order_by("day")
        )
        daily_trend = [
            {"date": item["day"].strftime("%Y-%m-%d") if item["day"] else "", "revenue": float(item["revenue"])}
            for item in daily_qs
        ]

        weekly_qs = (
            Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_date, end_date))
            .annotate(week=TruncWeek("created_at"))
            .values("week")
            .annotate(revenue=Sum("amount"))
            .order_by("week")
        )
        weekly_trend = [
            {"week": item["week"].strftime("W%W %Y") if item["week"] else "", "revenue": float(item["revenue"])}
            for item in weekly_qs
        ]

        monthly_qs = (
            Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_date, end_date))
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(revenue=Sum("amount"))
            .order_by("month")
        )
        monthly_trend = [
            {"month": item["month"].strftime("%b %Y") if item["month"] else "", "revenue": float(item["revenue"])}
            for item in monthly_qs
        ]

        yearly_qs = (
            Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_date, end_date))
            .annotate(year=TruncYear("created_at"))
            .values("year")
            .annotate(revenue=Sum("amount"))
            .order_by("year")
        )
        yearly_trend = [
            {"year": item["year"].strftime("%Y") if item["year"] else "", "revenue": float(item["revenue"])}
            for item in yearly_qs
        ]

        # Category Breakdown
        category_qs = (
            Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_date, end_date))
            .values(name=F("booking__service__category__name"))
            .annotate(value=Sum("amount"))
            .order_by("-value")
        )
        category_breakdown = [
            {"name": item["name"] or "Uncategorized", "value": float(item["value"])}
            for item in category_qs
        ]

        # Month and Year Comparison
        now = timezone.now()
        start_of_current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_prev_month = (start_of_current_month - timedelta(days=1)).replace(day=1)
        end_of_prev_month = start_of_current_month - timedelta(microseconds=1)

        curr_month_rev = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__gte=start_of_current_month).aggregate(total=Sum("amount"))["total"] or Decimal(0)
        prev_month_rev = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__range=(start_of_prev_month, end_of_prev_month)).aggregate(total=Sum("amount"))["total"] or Decimal(0)

        curr_year_rev = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__year=now.year).aggregate(total=Sum("amount"))["total"] or Decimal(0)
        prev_year_rev = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID, created_at__year=now.year - 1).aggregate(total=Sum("amount"))["total"] or Decimal(0)

        comparison = {
            "monthly": [
                {"name": "Previous Month", "revenue": float(prev_month_rev)},
                {"name": "Current Month", "revenue": float(curr_month_rev)},
            ],
            "yearly": [
                {"name": "Previous Year", "revenue": float(prev_year_rev)},
                {"name": "Current Year", "revenue": float(curr_year_rev)},
            ]
        }

        return Response({
            "daily_trend": daily_trend,
            "weekly_trend": weekly_trend,
            "monthly_trend": monthly_trend,
            "yearly_trend": yearly_trend,
            "category_breakdown": category_breakdown,
            "comparison": comparison,
        })


class AdminBookingAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Status distribution
        status_qs = (
            Booking.objects.filter(created_at__range=(start_date, end_date))
            .values("status")
            .annotate(count=Count("id"))
        )
        status_distribution = [
            {"name": item["status"], "value": item["count"]}
            for item in status_qs
        ]

        # Daily Booking count trend
        daily_qs = (
            Booking.objects.filter(created_at__range=(start_date, end_date))
            .annotate(day=TruncDay("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        daily_trend = [
            {"date": item["day"].strftime("%Y-%m-%d") if item["day"] else "", "bookings": item["count"]}
            for item in daily_qs
        ]

        weekly_qs = (
            Booking.objects.filter(created_at__range=(start_date, end_date))
            .annotate(week=TruncWeek("created_at"))
            .values("week")
            .annotate(count=Count("id"))
            .order_by("week")
        )
        weekly_trend = [
            {"week": item["week"].strftime("W%W %Y") if item["week"] else "", "bookings": item["count"]}
            for item in weekly_qs
        ]

        monthly_qs = (
            Booking.objects.filter(created_at__range=(start_date, end_date))
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        monthly_trend = [
            {"month": item["month"].strftime("%b %Y") if item["month"] else "", "bookings": item["count"]}
            for item in monthly_qs
        ]

        return Response({
            "status_distribution": status_distribution,
            "daily_trend": daily_trend,
            "weekly_trend": weekly_trend,
            "monthly_trend": monthly_trend,
        })


class AdminProviderAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Top Providers by completed jobs revenue
        top_providers_qs = (
            ProviderProfile.objects.annotate(
                provider_name=Concat(F("user__first_name"), Value(" "), F("user__last_name")),
                email=F("user__email"),
                completed_jobs=Count("user__provider_bookings", filter=Q(user__provider_bookings__status=Booking.Status.COMPLETED, user__provider_bookings__created_at__range=(start_date, end_date))),
                revenue_generated=Coalesce(Sum("user__provider_bookings__total_price", filter=Q(user__provider_bookings__status=Booking.Status.COMPLETED, user__provider_bookings__created_at__range=(start_date, end_date))), Decimal(0), output_field=DecimalField())
            )
            .order_by("-revenue_generated")[:10]
        )

        providers_data = []
        for p in top_providers_qs:
            providers_data.append({
                "name": p.provider_name or p.email,
                "email": p.email,
                "services": p.skills or [],
                "rating": float(p.rating),
                "completed_jobs": p.completed_jobs,
                "revenue": float(p.revenue_generated),
            })

        return Response(providers_data)


class AdminCustomerAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Customer Growth Trend (Registrations)
        reg_qs = (
            User.objects.filter(role=User.Role.CUSTOMER, created_at__range=(start_date, end_date))
            .annotate(day=TruncDay("created_at"))
            .values("day")
            .annotate(registrations=Count("id"))
            .order_by("day")
        )

        # Build list of active / returning customer metrics per day
        # To make it simple and performant, calculate registration daily stats, active customers (placed booking), returning (placed > 1)
        growth_data = []
        for item in reg_qs:
            day_val = item["day"]
            day_str = day_val.strftime("%Y-%m-%d") if day_val else ""
            
            # Active/returning on this day
            active_count = Booking.objects.filter(created_at__date=day_val.date()).values("customer").distinct().count()
            # returning: customers with > 1 booking total up to this day
            returning_count = (
                Booking.objects.filter(created_at__date=day_val.date())
                .values("customer")
                .annotate(cnt=Count("id"))
                .filter(cnt__gt=1)
                .count()
            )

            growth_data.append({
                "date": day_str,
                "new_registrations": item["registrations"],
                "active_customers": active_count,
                "returning_customers": returning_count,
            })

        # Top Customers Table
        top_customers_qs = (
            User.objects.filter(role=User.Role.CUSTOMER)
            .annotate(
                customer_name=Concat(F("first_name"), Value(" "), F("last_name")),
                total_bookings=Count("customer_bookings", filter=Q(customer_bookings__created_at__range=(start_date, end_date))),
                total_spend=Coalesce(Sum("customer_bookings__total_price", filter=Q(customer_bookings__status=Booking.Status.COMPLETED, customer_bookings__created_at__range=(start_date, end_date))), Decimal(0), output_field=DecimalField())
            )
            .order_by("-total_spend")[:10]
        )

        customers_data = [
            {
                "name": c.customer_name or c.email,
                "email": c.email,
                "total_bookings": c.total_bookings,
                "total_spend": float(c.total_spend),
            }
            for c in top_customers_qs
        ]

        return Response({
            "growth_trend": growth_data,
            "top_customers": customers_data,
        })


class AdminPaymentAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Payment Methods Share
        method_qs = (
            Payment.objects.filter(created_at__range=(start_date, end_date))
            .values("payment_method")
            .annotate(count=Count("id"))
        )
        methods_data = [
            {"name": item["payment_method"].upper(), "value": item["count"]}
            for item in method_qs
        ]

        # Payment Status counts
        status_qs = (
            Payment.objects.filter(created_at__range=(start_date, end_date))
            .values("payment_status")
            .annotate(count=Count("id"))
        )
        status_data = [
            {"name": item["payment_status"], "count": item["count"]}
            for item in status_qs
        ]

        return Response({
            "methods_share": methods_data,
            "status_trends": status_data,
        })


class AdminChatAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Chats flags and reviews counts
        flagged_qs = (
            FlaggedMessageLog.objects.filter(flagged_at__range=(start_date, end_date))
            .annotate(day=TruncDay("flagged_at"))
            .values("day")
            .annotate(
                total=Count("id"),
                resolved=Count("id", filter=Q(status=FlaggedMessageLog.Status.RESOLVED)),
                pending=Count("id", filter=Q(status=FlaggedMessageLog.Status.PENDING)),
            )
            .order_by("day")
        )

        trend_data = [
            {
                "date": item["day"].strftime("%Y-%m-%d") if item["day"] else "",
                "flagged": item["total"],
                "resolved": item["resolved"],
                "pending": item["pending"],
            }
            for item in flagged_qs
        ]

        return Response(trend_data)


class AdminServiceAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        # Count bookings per category
        categories = (
            Category.objects.annotate(
                bookings_count=Count("services__bookings", filter=Q(services__bookings__created_at__range=(start_date, end_date)))
            )
            .values("name", "bookings_count")
            .order_by("-bookings_count")
        )

        categories_data = [
            {"name": item["name"], "bookings": item["bookings_count"]}
            for item in categories
        ]

        return Response(categories_data)


class AdminReportDownloadView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        report_type = request.query_params.get("report_type")
        export_format = request.query_params.get("format", "csv").lower()
        start_date, end_date = get_date_range(request)

        if not report_type:
            return Response({"detail": "report_type query param is required (revenue, booking, provider, customer, payment)."}, status=400)

        # Aggregate data based on report type
        headers = []
        rows = []
        filename = f"report_{report_type}_{timezone.now().strftime('%Y%m%d%H%M%S')}"

        if report_type == "revenue":
            headers = ["Month/Day", "Total Bookings", "Completed Jobs", "Total Revenue (₹)", "Commission (₹)"]
            # Group by day
            qs = (
                Booking.objects.filter(created_at__range=(start_date, end_date))
                .annotate(day=TruncDay("created_at"))
                .values("day")
                .annotate(
                    bookings=Count("id"),
                    completed=Count("id", filter=Q(status=Booking.Status.COMPLETED)),
                    revenue=Coalesce(Sum("total_price", filter=Q(status=Booking.Status.COMPLETED)), Decimal(0), output_field=DecimalField()),
                    commission=Coalesce(Sum("commission_amount", filter=Q(status=Booking.Status.COMPLETED)), Decimal(0), output_field=DecimalField()),
                )
                .order_by("-day")
            )
            rows = [
                [
                    item["day"].strftime("%Y-%m-%d") if item["day"] else "",
                    item["bookings"],
                    item["completed"],
                    float(item["revenue"]),
                    float(item["commission"])
                ]
                for item in qs
            ]

        elif report_type == "booking":
            headers = ["Booking ID", "Customer", "Provider", "Service", "Price (₹)", "Scheduled Date", "Status"]
            qs = Booking.objects.filter(created_at__range=(start_date, end_date)).select_related("customer", "provider", "service").order_by("-created_at")
            rows = [
                [
                    b.id,
                    b.customer.email,
                    b.provider.email,
                    b.service.title,
                    float(b.total_price),
                    b.scheduled_date.strftime("%Y-%m-%d") if b.scheduled_date else "",
                    b.status
                ]
                for b in qs
            ]

        elif report_type == "provider":
            headers = ["Name", "Email", "Skills", "City", "Rating", "Completed Jobs", "Revenue Generated (₹)"]
            qs = ProviderProfile.objects.annotate(
                provider_name=Concat(F("user__first_name"), Value(" "), F("user__last_name")),
                email=F("user__email"),
                completed_jobs=Count("user__provider_bookings", filter=Q(user__provider_bookings__status=Booking.Status.COMPLETED, user__provider_bookings__created_at__range=(start_date, end_date))),
                revenue_generated=Coalesce(Sum("user__provider_bookings__total_price", filter=Q(user__provider_bookings__status=Booking.Status.COMPLETED, user__provider_bookings__created_at__range=(start_date, end_date))), Decimal(0), output_field=DecimalField())
            ).order_by("-revenue_generated")
            rows = [
                [
                    p.provider_name or p.email,
                    p.email,
                    ", ".join(p.skills) if p.skills else "",
                    p.city,
                    float(p.rating),
                    p.completed_jobs,
                    float(p.revenue_generated)
                ]
                for p in qs
            ]

        elif report_type == "customer":
            headers = ["Name", "Email", "Phone", "Joined Date", "Total Bookings", "Total Spend (₹)"]
            qs = User.objects.filter(role=User.Role.CUSTOMER).annotate(
                customer_name=Concat(F("first_name"), Value(" "), F("last_name")),
                total_bookings=Count("customer_bookings", filter=Q(customer_bookings__created_at__range=(start_date, end_date))),
                total_spend=Coalesce(Sum("customer_bookings__total_price", filter=Q(customer_bookings__status=Booking.Status.COMPLETED, customer_bookings__created_at__range=(start_date, end_date))), Decimal(0), output_field=DecimalField())
            ).order_by("-total_spend")
            rows = [
                [
                    c.customer_name or c.email,
                    c.email,
                    c.phone_number,
                    c.created_at.strftime("%Y-%m-%d") if c.created_at else "",
                    c.total_bookings,
                    float(c.total_spend)
                ]
                for c in qs
            ]

        elif report_type == "payment":
            headers = ["Payment ID", "Booking ID", "Amount (₹)", "Commission (₹)", "Method", "Status", "Transaction ID", "Created At"]
            qs = Payment.objects.filter(created_at__range=(start_date, end_date)).select_related("booking").order_by("-created_at")
            rows = [
                [
                    p.id,
                    p.booking_id,
                    float(p.amount),
                    float(p.commission),
                    p.payment_method,
                    p.payment_status,
                    p.transaction_id,
                    p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else ""
                ]
                for p in qs
            ]
        else:
            return Response({"detail": "Invalid report_type. Use revenue, booking, provider, customer, payment."}, status=400)

        # Export in requested format
        if export_format == "excel":
            content = export_excel(headers, rows, sheet_name=report_type.capitalize())
            response = HttpResponse(content, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            response["Content-Disposition"] = f"attachment; filename={filename}.xlsx"
            return response

        elif export_format == "pdf":
            title = f"Sahāy {report_type.capitalize()} Report"
            content = export_pdf(headers, rows, title=title)
            response = HttpResponse(content, content_type="application/pdf")
            response["Content-Disposition"] = f"attachment; filename={filename}.pdf"
            return response

        else:  # Default to CSV
            content = export_csv(headers, rows)
            response = HttpResponse(content, content_type="text/csv")
            response["Content-Disposition"] = f"attachment; filename={filename}.csv"
            return response
