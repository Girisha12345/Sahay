import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import { sitePages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Sahāy for support, partnerships, or general marketplace inquiries.",
};

export default function ContactUsPage() {
  return <GenericContentPage data={sitePages.contact} breadcrumbLabel="Contact Us" />;
}
