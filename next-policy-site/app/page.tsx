import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import { sitePages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Sahāy Local Service Marketplace",
  description: "Trusted local services marketplace for households and businesses with bookings, support, and policy clarity.",
};

export default function HomePage() {
  return <GenericContentPage data={sitePages.home} breadcrumbLabel="Home" />;
}