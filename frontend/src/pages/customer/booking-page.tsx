import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { bookingService } from "../../services/bookingService";
import { serviceService } from "../../services/serviceService";
import { useAuthStore } from "../../store/authStore";
import { currency } from "../../utils/format";
import { useServiceStore } from "../../store/serviceStore";
import type { ServiceItem } from "../../types";

const bookingSchema = z.object({
  fullName: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  area: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit PIN code required"),
  date: z.string().min(1, "Service date is required"),
  time: z.string().min(1, "Service time is required"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["upi", "phonepe", "googlepay", "razorpay", "cash"]),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services } = useServiceStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serviceDetail, setServiceDetail] = useState<ServiceItem | null>(null);
  const [isServiceLoading, setIsServiceLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const service = useMemo(() => {
    if (!id) return null;
    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) return null;
    return services.find((item) => item.id === parsedId) ?? serviceDetail;
  }, [services, serviceDetail, id]);

  useEffect(() => {
    let isMounted = true;

    const loadServiceById = async () => {
      if (!id) {
        if (isMounted) setIsServiceLoading(false);
        return;
      }

      const parsedId = Number(id);
      if (!Number.isFinite(parsedId)) {
        if (isMounted) setIsServiceLoading(false);
        return;
      }

      const fromStore = services.find((item) => item.id === parsedId);
      if (fromStore) {
        if (isMounted) {
          setServiceDetail(fromStore);
          setIsServiceLoading(false);
        }
        return;
      }

      if (isMounted) setIsServiceLoading(true);
      try {
        const { data } = await serviceService.serviceById(parsedId);
        if (isMounted) {
          setServiceDetail(data);
        }
      } catch {
        if (isMounted) {
          setServiceDetail(null);
        }
      } finally {
        if (isMounted) {
          setIsServiceLoading(false);
        }
      }
    };

    void loadServiceById();

    return () => {
      isMounted = false;
    };
  }, [services, id]);

  if (isServiceLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner />
            <p className="text-sm text-slate-500">Loading service details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <div className="space-y-3">
            <p className="text-red-600">Service not found.</p>
            <Button onClick={() => navigate("/services")}>Back to Services</Button>
          </div>
        </Card>
      </div>
    );
  }

  const platformFee = Number((Number(service.base_price) * 0.1).toFixed(2));
  const totalPrice = Number(service.base_price) + platformFee;

  const handlePayment = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (user?.role !== "CUSTOMER") {
        throw new Error("Please login with a customer account to complete booking.");
      }

      const bookingResponse = await bookingService.create({
        service_id: service.id,
        service_date: values.date,
        service_time: values.time,
        full_name: values.fullName || user?.first_name || user?.email.split("@")[0] || "",
        phone: values.mobile || "",
        address_line: values.address,
        area: values.area || "",
        city: values.city || "",
        address: [values.address, values.area, values.locality, values.city].filter(Boolean).join(", "),
        locality: values.locality || values.area || values.city || "General",
        pincode: values.pincode,
        notes: values.notes,
        payment_method: values.paymentMethod,
        total_price: totalPrice,
      });

      const bookingId = bookingResponse?.data?.id;
      if (!bookingId) {
        throw new Error("Booking failed. Please try again.");
      }

      navigate(`/payment/${bookingId}`, {
        state: {
          bookingId,
          serviceId: service.id,
          paymentMethod: values.paymentMethod,
        },
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: BookingFormValues) => {
    await handlePayment(values);
  };

  const onInvalid = () => {
    setErrorMessage("Please fill required fields: Address, PIN Code, Service Date, Service Time, and Payment Method.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <BackButton 
        fallback="/services"
        label="← Back to Services"
      />

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl font-bold">Book {service.title}</h1>
              <p className="mt-1 text-sm text-slate-500">Enter your details and choose payment method</p>
              {errorMessage && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Personal Information */}
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Full Name</label>
                    <Input placeholder="John Doe" {...register("fullName")} />
                    {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Mobile Number</label>
                    <Input placeholder="9876543210" {...register("mobile")} />
                    {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile.message}</p>}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold">Address</h2>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Address Line</label>
                  <Input placeholder="123 Main Street" {...register("address")} />
                  {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Area</label>
                    <Input placeholder="Indiranagar" {...register("area")} />
                    {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Locality</label>
                    <Input placeholder="Locality" {...register("locality")} />
                    {errors.locality && <p className="mt-1 text-xs text-red-600">{errors.locality.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">City</label>
                    <Input placeholder="Bengaluru" {...register("city")} />
                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">PIN Code</label>
                    <Input placeholder="560038" {...register("pincode")} />
                    {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode.message}</p>}
                  </div>
                </div>
              </div>

              {/* Service Schedule */}
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold">Service Schedule</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Service Date</label>
                    <Input type="date" {...register("date")} />
                    {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Service Time</label>
                    <Input type="time" {...register("time")} />
                    {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Additional Notes (Optional)</label>
                  <textarea
                    placeholder="Any special instructions for the service provider..."
                    className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    {...register("notes")}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: "upi", label: "UPI", icon: "💳" },
                    { value: "phonepe", label: "PhonePe", icon: "📱" },
                    { value: "googlepay", label: "Google Pay", icon: "🔵" },
                    { value: "razorpay", label: "Razorpay", icon: "💰" },
                    { value: "cash", label: "Cash on Service", icon: "💵" },
                  ].map((method) => (
                    <label key={method.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-sky-50">
                      <input
                        type="radio"
                        value={method.value}
                        {...register("paymentMethod")}
                        className="h-4 w-4"
                      />
                      <span className="text-lg">{method.icon}</span>
                      <span className="font-medium text-slate-900">{method.label}</span>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="text-xs text-red-600">{errors.paymentMethod.message}</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div>
            <Card className="sticky top-4 h-fit">
              <h2 className="text-lg font-semibold">Price Summary</h2>

              <div className="mt-4 space-y-3 border-b border-slate-200 pb-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">{service.title}</span>
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Service Price:</span>
                  <span className="font-medium">{currency(Number(service.base_price))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Platform Fee (10%):</span>
                  <span className="font-medium">{currency(platformFee)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-lg font-bold text-slate-900">Total Price:</span>
                <span className="text-xl font-bold text-sky-600">{currency(totalPrice)}</span>
              </div>

              <Button
                className="mt-6 w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Proceeding...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>

              {user?.role !== "CUSTOMER" && (
                <p className="mt-3 text-center text-xs text-amber-700">
                  Please login with a customer account to complete payment.
                </p>
              )}

              <p className="mt-3 text-center text-xs text-slate-500">
                By booking, you agree to our Terms of Service
              </p>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
