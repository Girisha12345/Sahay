import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import { sitePages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Sahāy across frontend, backend, support, product, and marketing roles.",
};

export default function CareersPage() {
  return <GenericContentPage data={sitePages.careers} breadcrumbLabel="Careers" />;
}
