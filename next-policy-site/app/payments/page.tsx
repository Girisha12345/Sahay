import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import { sitePages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Payments",
  description: "Secure payments page for Sahāy covering UPI, cards, net banking, wallets, escrow handling, and refund support.",
};

export default function PaymentsPage() {
  return <GenericContentPage data={sitePages.payments} breadcrumbLabel="Payments" />;
}
