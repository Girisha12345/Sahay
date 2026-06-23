import type { Metadata } from "next";
import { BriefcaseBusiness, CalendarClock, CreditCard, ShieldCheck, Star, Sparkles, Users, Wallet, Wrench, Fan, Search, CheckCircle2 } from "lucide-react";
import { GenericContentPage } from "@/components/generic-content-page";
import type { ContentPageData } from "@/lib/site-data";

const data: ContentPageData = {
  slug: "/services",
  title: "Services",
  subtitle: "Featured services, top-rated providers, live availability, and estimated pricing.",
  heroDescription:
    "The services page helps customers compare what is available right now, who has the strongest ratings, and what the cost range may look like before they commit to a booking.",
  updatedOn: "June 2026",
  heroIcon: BriefcaseBusiness,
  quickFacts: [
    { label: "Featured services", value: "High-demand jobs with visible availability" },
    { label: "Provider signals", value: "Ratings, reviews, and booking volume" },
    { label: "Pricing", value: "Estimated starting price shown clearly" },
  ],
  sections: [
    {
      id: "featured-services",
      title: "Featured Services",
      icon: Sparkles,
      paragraphs: [
        "Featured services are selected based on demand, trust, and user relevance. These cards work best when the goal is to help a user choose quickly, especially for urgent or routine household jobs.",
        "A marketplace like Sahāy should always show the service scope plainly so the user knows whether the listing is an emergency repair, a routine visit, or a scheduled professional service."
      ],
      cards: [
        { title: "AC Service", description: "4.9 rating, ₹349 onward, same-day slots available." },
        { title: "Deep Cleaning", description: "4.8 rating, ₹899 onward, morning and evening slots." },
        { title: "Electrician Visit", description: "4.9 rating, ₹199 onward, trusted local providers." },
        { title: "Plumbing Check", description: "4.8 rating, ₹249 onward, quick dispatch available." },
      ],
    },
    {
      id: "top-rated-providers",
      title: "Top Rated Providers",
      icon: Star,
      paragraphs: [
        "Top-rated providers are surfaced because users want confidence before they invite someone into their home. Ratings are paired with booking volume, responsiveness, and quality feedback so the trust signal is not overly simplistic.",
        "The marketplace should reward providers who consistently deliver on time, communicate clearly, and complete jobs professionally."
      ],
      cards: [
        { title: "Apex Service Crew", description: "4.9 average, 500+ bookings, North Bangalore." },
        { title: "PrimeFix Experts", description: "4.8 average, 420+ bookings, Whitefield." },
        { title: "HomeSpark Team", description: "4.9 average, 390+ bookings, Indiranagar." },
      ],
    },
    {
      id: "availability-and-pricing",
      title: "Service Availability and Pricing",
      icon: CalendarClock,
      paragraphs: [
        "Availability is shown so customers can compare same-day, next-day, and scheduled service windows. This is especially useful in marketplaces where service urgency matters as much as price.",
        "Estimated pricing gives a useful starting point, but the final amount may change with scope, parts, or travel distance. That transparency keeps expectations realistic and avoids surprise at checkout."
      ],
      cards: [
        { title: "Same-day slots", description: "For urgent repairs and fast support requests." },
        { title: "Next-day bookings", description: "Ideal for planned household services." },
        { title: "Scheduled visits", description: "Useful when the user needs a specific time window." },
      ],
    },
  ],
  cta: { title: "Book a trusted service", description: "Compare listings and choose the right provider for the job.", primaryLabel: "Explore Categories", primaryHref: "/service-categories", secondaryLabel: "Contact Support", secondaryHref: "/customer-care" },
};

export const metadata: Metadata = {
  title: "Services",
  description: "Featured services, top-rated providers, estimated pricing, and availability on Sahāy.",
};

export default function ServicesPage() {
  return <GenericContentPage data={data} breadcrumbLabel="Services" />;
}
