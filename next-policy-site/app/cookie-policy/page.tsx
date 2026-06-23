import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { policyPages } from "@/lib/policy-data";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Sahāy cookie policy explaining cookie usage, analytics, marketing preferences, and user controls.",
};

export default function CookiePolicyPage() {
  return <PolicyPage data={policyPages.cookies} />;
}