import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { policyPages } from "@/lib/policy-data";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Sahāy marketplace terms covering user eligibility, account registration, bookings, payments, refunds, and liability.",
};

export default function TermsConditionsPage() {
  return <PolicyPage data={policyPages.terms} />;
}