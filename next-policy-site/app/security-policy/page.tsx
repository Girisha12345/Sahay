import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { policyPages } from "@/lib/policy-data";

export const metadata: Metadata = {
  title: "Security Policy",
  description: "Sahāy security policy covering payments, encryption, authentication, fraud prevention, and incident response.",
};

export default function SecurityPolicyPage() {
  return <PolicyPage data={policyPages.security} />;
}