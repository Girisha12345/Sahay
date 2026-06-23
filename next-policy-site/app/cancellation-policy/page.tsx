import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { policyPages } from "@/lib/policy-data";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "Clear cancellation policy for Sahāy including customer and provider rules, refund conditions, and no-show handling.",
};

export default function CancellationPolicyPage() {
  return <PolicyPage data={policyPages.cancellation} />;
}