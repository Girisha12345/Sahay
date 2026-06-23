import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { policyPages } from "@/lib/policy-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Detailed privacy policy for Sahāy covering information collection, use, storage, security, and user rights.",
};

export default function PrivacyPolicyPage() {
  return <PolicyPage data={policyPages.privacy} />;
}