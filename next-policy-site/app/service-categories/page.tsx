import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import { sitePages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Service Categories",
  description: "Browse 20+ local service categories on Sahāy with clear descriptions, starting prices, and provider counts.",
};

export default function ServiceCategoriesPage() {
  return <GenericContentPage data={sitePages.categories} breadcrumbLabel="Service Categories" />;
}
