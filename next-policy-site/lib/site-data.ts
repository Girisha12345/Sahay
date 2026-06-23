import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChartBar,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  Droplets,
  Ear,
  FileText,
  Flower2,
  HandCoins,
  Home,
  KeyRound,
  Leaf,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Paintbrush,
  PackageOpen,
  Phone,
  PlugZap,
  Recycle,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
  XCircle,
  Scissors,
  PenTool,
  Sprout,
  Brain,
  Shirt,
  HeartPulse,
  BrainCircuit,
  CookingPot,
  Bike,
  WalletCards,
  Radar,
  ClipboardList,
  LifeBuoy,
  Headphones,
  AlertTriangle,
  MessageSquareWarning,
  Receipt,
  Banknote,
  LocateFixed,
  Laptop,
  Fingerprint,
  ShieldAlert,
  TimerReset,
  Cookie,
  Settings2,
} from "lucide-react";

export type ContentSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
  cards?: { title: string; description: string }[];
  bullets?: string[];
};

export type ContentPageData = {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  updatedOn: string;
  heroIcon: LucideIcon;
  quickFacts: { label: string; value: string }[];
  sections: ContentSection[];
  contact?: { email?: string; support?: string; phone?: string };
  cta?: { title: string; description: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string };
};

export const sitePages: Record<string, ContentPageData> = {
  home: {
    slug: "/",
    title: "Sahāy Local Service Marketplace",
    subtitle: "Trusted local services for busy homes, families, and small businesses across India.",
    heroDescription:
      "Sahāy brings together verified service providers, transparent booking journeys, and responsive customer support in one marketplace experience. The platform is designed to feel familiar to users of Urban Company, TaskRabbit, Flipkart, Amazon, Swiggy, and Zomato while still reflecting Sahāy’s own local-service identity.",
    updatedOn: "June 2026",
    heroIcon: BriefcaseBusiness,
    quickFacts: [
      { label: "Customers served", value: "10,000+ and growing" },
      { label: "Providers onboarded", value: "2,000+ trusted professionals" },
      { label: "Coverage", value: "50+ cities planned and expanding" },
    ],
    sections: [
      {
        id: "platform-introduction",
        title: "Platform Introduction",
        icon: Home,
        paragraphs: [
          "Sahāy is a local service marketplace built to help users discover reliable help without spending hours calling around or negotiating offline. The platform focuses on clarity, fast matching, and service quality so customers can book plumbers, electricians, cleaners, tutors, movers, and many other everyday services from a single place.",
          "For providers, Sahāy offers visibility, booking management, and a structured support process that makes professional service delivery easier to scale. The result is a marketplace that feels both practical and premium: easy for customers to use, and serious enough for providers to build with confidence."
        ],
      },
      {
        id: "popular-services",
        title: "Popular Services",
        icon: Sparkles,
        paragraphs: [
          "The most requested services on Sahāy are the ones that solve urgent household problems and recurring maintenance needs. Home cleaning, electrical repairs, AC servicing, appliance fixes, plumbing, and painting remain popular because they are time-sensitive and quality-dependent.",
          "We also see increasing demand for non-traditional local services such as elderly care, grocery delivery, pet support, and movers & packers. These categories reflect how modern marketplaces are moving beyond one-off jobs into daily-life convenience."
        ],
        cards: [
          { title: "Home Cleaning", description: "Deep cleaning, move-in/move-out, and recurring maintenance." },
          { title: "Plumbing", description: "Leak fixes, tap replacements, pipe work, and blockage support." },
          { title: "AC Service", description: "Installation, gas refill, and scheduled servicing." },
          { title: "Electrician", description: "Switch board repairs, wiring checks, and fittings." },
        ],
      },
      {
        id: "how-it-works",
        title: "How It Works",
        icon: ClipboardList,
        paragraphs: [
          "Customers browse categories, compare services, and submit a request using a simple booking flow. Sahāy then helps route the request to suitable providers based on service type, location, and availability. Once the provider confirms, users receive updates, pricing visibility, and support options inside the platform.",
          "The marketplace is designed to reduce back-and-forth. That means fewer manual calls, clearer expectations, and a smoother experience from discovery to completion."
        ],
        cards: [
          { title: "1. Discover", description: "Search services, compare categories, and view provider profiles." },
          { title: "2. Book", description: "Select timing, share details, and confirm the service request." },
          { title: "3. Complete", description: "Track progress, pay securely, and review the outcome." },
        ],
      },
      {
        id: "why-choose-sahay",
        title: "Why Choose Sahāy",
        icon: ShieldCheck,
        paragraphs: [
          "Sahāy is built around trust signals that matter in the local services category: provider transparency, support availability, and policy clarity. The platform is not trying to be everything to everyone; it is focused on reliable marketplace operations and a clean user experience.",
          "That focus helps create confidence. Whether a user is booking a household repair, scheduling a service visit, or asking support for help, the experience is meant to feel clear, modern, and dependable."
        ],
        cards: [
          { title: "Trust-first design", description: "Verified profiles, visible service details, and clear support channels." },
          { title: "Transparent pricing", description: "Users see estimated costs before confirming the booking." },
          { title: "Local relevance", description: "Built for Indian households, local professionals, and city-based operations." },
          { title: "Fast support", description: "Customer care and dispute handling are easy to access." },
        ],
      },
      {
        id: "statistics",
        title: "Statistics Section",
        icon: ChartBar,
        paragraphs: [
          "Marketplace metrics help users understand scale and reliability. Sahāy presents growth in a way that is honest and useful rather than inflated. These figures reflect the platform’s target operating direction and the business story behind the product.",
          "The numbers also reinforce the product’s positioning: enough traction to signal momentum, but still close enough to customers and providers to stay responsive."
        ],
        cards: [
          { title: "10,000+ Customers", description: "People who have explored or used the marketplace." },
          { title: "2,000+ Providers", description: "Service professionals in the onboarding and active network." },
          { title: "50+ Cities", description: "Planned growth across metro and tier-2 markets." },
          { title: "95% Satisfaction", description: "Target service satisfaction rate based on post-service feedback." },
        ],
      },
    ],
    cta: {
      title: "Start your service journey with Sahāy",
      description: "Browse categories, compare providers, and book the help you need with confidence.",
      primaryLabel: "Explore Services",
      primaryHref: "/services",
      secondaryLabel: "View Categories",
      secondaryHref: "/service-categories",
    },
  },
  categories: {
    slug: "/service-categories",
    title: "Service Categories",
    subtitle: "Browse 20+ structured local service categories with practical pricing and provider depth.",
    heroDescription:
      "Sahāy’s category layer is designed like a modern marketplace catalog: clear labels, short explanations, and enough detail for users to understand the kind of help available before they book.",
    updatedOn: "June 2026",
    heroIcon: Building2,
    quickFacts: [
      { label: "Total categories", value: "24 high-demand service categories" },
      { label: "UX pattern", value: "Marketplace cards with trust cues" },
      { label: "Goal", value: "Help users find the right professional quickly" },
    ],
    sections: [
      {
        id: "available-categories",
        title: "Available Categories",
        icon: Building2,
        paragraphs: [
          "The categories below are intentionally broad enough to support discovery, but specific enough to guide users toward the right service type. Each category includes a service description, a starting price estimate, and a provider-count signal to set expectations.",
          "In a real marketplace, category depth matters because users often arrive with only a rough need: a leak, a broken switch, a room that needs cleaning, or a provider who can help with an urgent move. Sahāy uses categories to reduce that uncertainty."
        ],
        cards: [
          { title: "Plumbing", description: "Leak repair, fittings, taps, pipelines. Starting at ₹249. 180+ providers." },
          { title: "Electrician", description: "Switches, wiring, fittings, safety checks. Starting at ₹199. 220+ providers." },
          { title: "Carpentry", description: "Furniture repair, assembly, hinges, locking. Starting at ₹299. 150+ providers." },
          { title: "Home Cleaning", description: "Kitchen, bathroom, full-home deep cleaning. Starting at ₹499. 260+ providers." },
          { title: "AC Repair", description: "Servicing, installation, gas checks. Starting at ₹349. 210+ providers." },
          { title: "Appliance Repair", description: "Washing machine, microwave, fridge service. Starting at ₹299. 195+ providers." },
          { title: "Pest Control", description: "Cockroach, termite, and mosquito treatments. Starting at ₹599. 145+ providers." },
          { title: "Elderly Care", description: "Home assistance, companionship, daily support. Starting at ₹699. 90+ providers." },
          { title: "Gardening", description: "Trimming, lawn care, planting, maintenance. Starting at ₹249. 120+ providers." },
          { title: "Painting", description: "Wall painting, touch-up, and finishing. Starting at ₹399. 175+ providers." },
          { title: "Movers & Packers", description: "House shifting, packing, transport coordination. Starting at ₹999. 130+ providers." },
          { title: "Grocery Delivery", description: "Express local delivery and essentials pickup. Starting at ₹49. 300+ providers." },
          { title: "Beauty Services", description: "Salon-at-home grooming and personal care. Starting at ₹349. 240+ providers." },
          { title: "Salon for Men", description: "Haircuts, beard trim, grooming packages. Starting at ₹199. 200+ providers." },
          { title: "Salon for Women", description: "Hair care, styling, and wellness services. Starting at ₹399. 210+ providers." },
          { title: "Massage Therapy", description: "Relaxation, recovery, and wellness sessions. Starting at ₹799. 80+ providers." },
          { title: "Yoga & Fitness", description: "At-home practice sessions and guidance. Starting at ₹599. 95+ providers." },
          { title: "Home Tuition", description: "Academic support for school and college students. Starting at ₹499. 170+ providers." },
          { title: "Pet Care", description: "Walking, grooming, and daily pet assistance. Starting at ₹349. 75+ providers." },
          { title: "Laundry", description: "Wash, fold, dry-cleaning support. Starting at ₹149. 110+ providers." },
          { title: "Driver on Demand", description: "Chauffeur assistance and local travel support. Starting at ₹799. 60+ providers." },
          { title: "Photographer", description: "Events, portraits, and business shoots. Starting at ₹1,499. 85+ providers." },
          { title: "Packaged Water", description: "Home and office bulk delivery. Starting at ₹99. 140+ providers." },
          { title: "Internet Setup", description: "Router installation, wiring, and network help. Starting at ₹249. 70+ providers." },
        ],
      },
    ],
    cta: {
      title: "Find the right professional faster",
      description: "Browse categories and compare estimated pricing before you book.",
      primaryLabel: "Browse Services",
      primaryHref: "/services",
      secondaryLabel: "Contact Support",
      secondaryHref: "/customer-care",
    },
  },