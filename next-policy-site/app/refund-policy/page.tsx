import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import type { ContentPageData } from "@/lib/site-data";
import { Receipt, Clock3, CheckCircle2, ShieldAlert, UserCog, Wallet } from "lucide-react";

const data: ContentPageData = {
  slug: "/refund-policy",
  title: "Refund Policy",
  subtitle: "Clear refund eligibility, timelines, partial refund logic, and failed-service protection.",
  heroDescription: "Sahāy’s refund policy balances fair customer protection with real provider effort and marketplace accountability.",
  updatedOn: "June 2026",
  heroIcon: Receipt,
  quickFacts: [
    { label: "Eligibility", value: "Depends on service stage and verified issue details" },
    { label: "Timeline", value: "Gateway-specific processing windows apply" },
    { label: "Approach", value: "Fair, evidence-based, and support-led" },
  ],
  sections: [
    { id: "refund-eligibility", title: "Refund Eligibility", icon: CheckCircle2, paragraphs: ["Refunds may apply when a provider cancels late, a service is incomplete, or the booking is materially affected by platform-side issues. Eligibility depends on booking stage, evidence, and the scope of the actual work completed.", "Users should submit details quickly so the support team can review the request with accurate timestamps and booking records."], cards: [{ title: "Valid cases", description: "Late provider cancellation, failed service, incomplete work." }, { title: "Review inputs", description: "Booking record, chat, timestamp, and evidence upload." }] },
    { id: "processing-time", title: "Processing Time", icon: Clock3, paragraphs: ["Once approved, refund processing time depends on the original payment method and the payment gateway involved. Some refunds are reflected sooner than others, especially when banks need additional clearing time.", "The support team should always give users a realistic estimate rather than an overly optimistic promise."], cards: [{ title: "UPI", description: "Usually follows gateway reversal timing." }, { title: "Cards", description: "May take several business days to reflect." }, { title: "Wallets", description: "Depends on wallet provider settlement rules." }] },
    { id: "partial-refunds", title: "Partial Refunds", icon: Wallet, paragraphs: ["A partial refund is appropriate when part of the service has already been delivered or when an on-site visit created a real cost for the provider. This avoids treating a partially completed job as a fully failed one.", "Partial refund calculations should be explained clearly so the customer understands the final amount."], bullets: ["On-site effort already delivered", "Parts or materials already purchased", "Travel or dispatch costs incurred", "Mixed outcome bookings"] },
    { id: "failed-service", title: "Failed Service Refunds", icon: ShieldAlert, paragraphs: ["If the provider fails to attend, refuses the agreed service, or leaves the job incomplete without valid cause, the case may qualify for a stronger refund or a corrective rebooking option.", "Sahāy should review the facts and restore customer confidence quickly when the service failure is clear."], cards: [{ title: "No-show", description: "Provider fails to arrive or make reasonable contact." }, { title: "Incomplete work", description: "Part of the agreed service was not delivered." }, { title: "Incorrect job", description: "The provider could not perform the confirmed task." }] },
    { id: "customer-responsibilities", title: "Customer Responsibilities", icon: UserCog, paragraphs: ["Customers should provide truthful booking details, remain reachable when required, and submit proof quickly if they want a refund review. Delays or missing evidence can slow down the support process.", "Clear submissions help the team resolve cases fairly and efficiently." ] },
  ],
  cta: { title: "Need help with a refund?", description: "Contact customer care or review the cancellation policy for timing rules.", primaryLabel: "Customer Care", primaryHref: "/customer-care", secondaryLabel: "Cancellation Policy", secondaryHref: "/cancellation-policy" },
};

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Detailed refund policy for Sahāy with eligibility, processing time, partial refunds, failed-service refunds, and customer responsibilities.",
};

export default function RefundPolicyPage() {
  return <GenericContentPage data={data} breadcrumbLabel="Refund Policy" />;
}
