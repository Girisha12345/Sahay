import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, CircleHelp, MessageCircle, CreditCard, RefreshCcw, BadgeCheck, CalendarClock, ShieldCheck, UserCog, Search, Wallet, Clock3, RotateCcw, Banknote, Fingerprint, Eye, Shield, Globe, Settings2, PackageOpen, Truck, Headphones, FileText } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

const faqs = [
  ["How do I book a service?", "Choose a category, review providers, select the slot you want, and confirm the booking through Sahāy."],
  ["How are providers verified?", "Providers are reviewed for profile accuracy, document quality, service relevance, and trust indicators before they are fully visible."],
  ["What payment methods are accepted?", "UPI, credit cards, debit cards, net banking, and selected wallets are supported."],
  ["Can I cancel a booking?", "Yes. Cancellation depends on timing, provider status, and whether work has already started."],
  ["How do refunds work?", "Refunds depend on eligibility, partial completion, cancellation stage, and gateway timelines."],
  ["Is my personal data safe?", "Sahāy uses access controls, secure handling, and operational safeguards to protect user data."],
  ["Can I reschedule a service?", "Where the provider agrees, the booking can be rescheduled rather than cancelled."],
  ["What if the provider is late?", "You can use in-app chat or support to confirm delays and seek a resolution."],
  ["Can I raise a dispute after completion?", "Yes, if there is a valid issue such as quality, billing, or behavior concerns."],
  ["Do you support urgent same-day bookings?", "Some categories and providers are available for urgent or same-day slots."],
  ["How do I update my address?", "Open your profile or saved addresses and update the location before the next booking."],
  ["What if a payment fails?", "Check your bank or wallet, retry, or use a different supported method."],
  ["Can providers see my phone number?", "Only when required for booking coordination or platform communication policy."],
  ["How do provider ratings work?", "Ratings reflect completed jobs, punctuality, service quality, and customer feedback."],
  ["What if a service is incomplete?", "Use support or disputes so the team can review the case and recommend correction or refund."],
  ["Can I book for someone else?", "Yes, if you can provide the required details and approve the booking terms."],
  ["How do I contact support?", "Use customer care, email support, or the dispute page depending on the issue."],
  ["Are taxes included in the price?", "Taxes or fees may be shown separately depending on the service and checkout flow."],
  ["Can I trust the provider reviews?", "Reviews are linked to completed service experiences and help with decision making."],
  ["What if I cannot be at home?", "Inform the provider early and use booking notes to avoid no-show confusion."],
  ["Do you support business bookings?", "Yes, for relevant categories and where the provider accepts the request."],
  ["How long does support take?", "Simple issues can be quick, while disputes may require a more detailed review."],
];

export const metadata: Metadata = {
  title: "FAQs",
  description: "Twenty-plus realistic FAQ answers for Sahāy covering bookings, payments, cancellations, support, and provider verification.",
};

export default function FaqPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-6 py-10 text-white shadow-soft sm:px-10 sm:py-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
            <CircleHelp className="h-4 w-4" /> FAQs
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Browse the most common questions customers ask about Sahāy, its bookings, and its support process.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"><Search className="h-4 w-4 text-sky-600" /> Search or browse</div>
        <input className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500" placeholder="Search questions about booking, payments, refunds, and support" />
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-slate-900">
              <span>{q}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <p className="mt-4 text-sm leading-7 text-slate-600">{a}</p>
          </details>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Still need help?</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Use customer care or raise a dispute if your issue needs a human review.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/customer-care" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Customer Care</Link>
          <Link href="/raise-a-dispute" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">Raise a Dispute</Link>
        </div>
      </section>
    </div>
  );
}
