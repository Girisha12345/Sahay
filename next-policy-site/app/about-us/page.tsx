import type { Metadata } from "next";
import { GenericContentPage } from "@/components/generic-content-page";
import { sitePages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn Sahāy’s company story, mission, vision, values, and marketplace growth metrics.",
};

export default function AboutUsPage() {
  return <GenericContentPage data={sitePages.about} breadcrumbLabel="About Us" />;
}
