import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Fingerprint,
  Globe,
  Hammer,
  Headphones,
  HelpCircle,
  Laptop,
  LayoutGrid,
  LifeBuoy,
  MapPin,
  MessageSquare,
  MessageSquareMore,
  MonitorCog,
  PackageSearch,
  Paintbrush,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Truck,
  Wallet,
  Wrench,
  Zap,
  ShieldAlert,
  Search,
  MousePointerClick,
  RotateCcw,
  ReceiptText,
  Shield,
  Cookie,
  Users,
  HeartHandshake,
  GraduationCap,
  Megaphone,
  Camera,
  Home,
  FileWarning,
  BadgeHelp,
  UserCog,
  Send,
  FileCheck,
  MessageCircle,
} from "lucide-react";

export type Section = {
  id: string;
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
  bullets?: string[];
  cards?: { title: string; description: string; icon: LucideIcon }[];
};

export type ContentPage = {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  updatedOn?: string;
  heroIcon: LucideIcon;
  stats?: { label: string; value: string }[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  sections: Section[];
};

export const sitePages: Record<string, ContentPage> = {
  home: {
    slug: "/",
    title: "Sahāy Local Service Marketplace",
    subtitle: "Trusted home, beauty, repair, and support services built for Indian households.",
    heroDescription:
      "Sahāy helps customers discover verified local professionals, compare service options, book with confidence, and manage the journey from inquiry to completion in one place.",
    heroIcon: BriefcaseBusiness,
    stats: [
      { label: "Customers", value: "10,000+" },
      { label: "Providers", value: "2,000+" },
      { label: "Cities", value: "50+" },
      { label: "Satisfaction", value: "95%" },
    ],
    ctaPrimary: { label: "Browse Services", href: "/services" },
    ctaSecondary: { label: "Explore Categories", href: "/service-categories" },
    sections: [
      {
        id: "platform-introduction",
        title: "Platform Introduction",
        icon: Home,
        paragraphs: [
          "Sahāy is designed as a practical local services marketplace for urban and semi-urban users who need dependable help at home or for everyday tasks. The platform focuses on clarity, safety, and fast discovery so that a customer can move from need to booking without unnecessary friction.",
          "The marketplace experience brings together service discovery, provider profiles, transparent pricing cues, in-app communication, and support workflows that feel familiar to users of large consumer platforms. Our goal is to make local services feel as easy to book as ordering groceries or ride-sharing."
        ],
        cards: [
          { title: "Verified Discovery", description: "Find professionals by category, budget, and location.", icon: BadgeCheck },
          { title: "Fast Booking", description: "Request service and confirm with confidence.", icon: TimerReset },
          { title: "Safe Support", description: "Use built-in support channels and policy flows.", icon: Headphones },
        ],
      },
      {
        id: "popular-services",
        title: "Popular Services",
        icon: Sparkles,
        paragraphs: [
          "The most used categories on Sahāy reflect common household needs such as plumbing, electrical repair, cleaning, appliance servicing, AC repair, and pest control. We also support lifestyle and assistance categories like elderly care, gardening, painting, and movers and packers.",
          "Each category page is built to help users understand starting prices, service scope, provider availability, and the type of outcome they can expect before they book."
        ],
        cards: [
          { title: "Plumbing", description: "Leak fixes, pipe work, installation, and emergency visits.", icon: Wrench },
          { title: "Electrician", description: "Power issues, fittings, switches, and appliance wiring.", icon: Zap },
          { title: "Home Cleaning", description: "Deep cleaning, sofa care, kitchen cleaning, and more.", icon: Sparkles },
          { title: "AC Repair", description: "Cooling service, gas checks, installation, and maintenance.", icon: Fan },
        ],
      },
      {
        id: "how-it-works",
        title: "How It Works",
        icon: LayoutGrid,
        paragraphs: [
          "A user starts by choosing a category or searching for a specific service. Sahāy then presents provider listings, relevant pricing cues, availability information, and support details so the decision is informed and straightforward.",
          "Once a booking is placed, the customer and provider can clarify the requirements, confirm timing, and complete payment through the platform. The same flow supports refunds, disputes, and post-service feedback."
        ],
        cards: [
          { title: "1. Discover", description: "Browse categories and compare service options.", icon: Search },
          { title: "2. Confirm", description: "Chat, align on scope, and lock the booking.", icon: MessageSquareMore },
          { title: "3. Complete", description: "Track progress, pay safely, and close the job.", icon: CheckCircle2 },
        ],
      },
      {
        id: "why-choose-sahay",
        title: "Why Choose Sahāy",
        icon: ShieldCheck,
        paragraphs: [
          "Sahāy combines trust-first design with marketplace convenience. That means visible service detail, accessible support, well-structured policy pages, and a brand tone that feels professional rather than experimental.",
          "The platform is built to support real-life service flows where customers care about punctuality, provider reliability, and safe payment handling. The design language is modern, but the business logic stays grounded in what users actually need from a local services product."
        ],
        bullets: ["Transparent booking journey", "Responsive marketplace UI", "Safety-focused support", "Clear policy communication"],
      },
      {
        id: "testimonials",
        title: "Customer Testimonials",
        icon: MessageSquare,
        paragraphs: [
          "Customers use Sahāy when they want a dependable, local alternative to searching across disconnected phone numbers and informal recommendations. The platform gives them a cleaner decision path, better communication, and a more accountable service model.",
          "Providers also benefit from a marketplace that respects their time, explains the booking flow clearly, and supports fair dispute handling when issues arise."
        ],
        cards: [
          { title: "Aarav, Bengaluru", description: "Booked an electrician in under 10 minutes and received clear updates throughout the service.", icon: QuoteIcon },
          { title: "Meera, Whitefield", description: "The cleaning service arrived on time and the support team helped me reschedule smoothly.", icon: HeartHandshake },
          { title: "Imran, Indiranagar", description: "Professional communication and a well-designed booking flow made the process simple.", icon: Users },
        ],
      },
      {
        id: "cta",
        title: "Call To Action",
        icon: MousePointerClick,
        paragraphs: [
          "Sahāy is positioned to become the place users return to whenever they need trusted local help. Whether it is a quick repair, a planned service, or a support question, the platform provides a clean and reliable experience from first click to final confirmation.",
          "The design and content are intentionally polished to fit portfolio reviews, MCA final-year demonstrations, and stakeholder presentations where a realistic marketplace identity matters."
        ],
      },
    ],
  },
  categories: {
    slug: "/service-categories",
    title: "Service Categories",
    subtitle: "Browse 20+ trusted local service categories across home, utility, maintenance, and assistance needs.",
    heroDescription: "Sahāy organizes everyday service needs into clear categories so users can discover the right professional quickly, compare options, and understand starting prices before they book.",
    heroIcon: LayoutGrid,
    ctaPrimary: { label: "View Services", href: "/services" },
    ctaSecondary: { label: "Ask for Support", href: "/customer-care" },
    sections: [
      {
        id: "category-grid",
        title: "Popular Categories",
        icon: LayoutGrid,
        paragraphs: [
          "Each category card combines an icon, short service description, indicative starting price, and the approximate number of available providers. This gives customers a quick sense of depth in the marketplace without forcing them into a long search path.",
          "The category mix reflects the most common on-demand needs in Indian cities, from home repairs and cleaning to specialized tasks like elderly care and movers and packers."
        ],
        cards: [
          { title: "Plumbing", description: "Starting at ₹249 | 180+ providers", icon: Wrench },
          { title: "Electrician", description: "Starting at ₹199 | 210+ providers", icon: Zap },
          { title: "Carpentry", description: "Starting at ₹299 | 95+ providers", icon: Hammer },
          { title: "Home Cleaning", description: "Starting at ₹399 | 260+ providers", icon: Sparkles },
          { title: "AC Repair", description: "Starting at ₹349 | 160+ providers", icon: Fan },
          { title: "Appliance Repair", description: "Starting at ₹299 | 140+ providers", icon: Laptop },
          { title: "Pest Control", description: "Starting at ₹499 | 120+ providers", icon: ShieldAlert },
          { title: "Elderly Care", description: "Starting at ₹699 | 80+ providers", icon: HeartHandshake },
          { title: "Gardening", description: "Starting at ₹249 | 70+ providers", icon: Home },
          { title: "Painting", description: "Starting at ₹999 | 110+ providers", icon: Paintbrush },
          { title: "Movers & Packers", description: "Starting at ₹1,499 | 90+ providers", icon: Truck },
          { title: "Grocery Delivery", description: "Starting at ₹99 | 150+ providers", icon: ReceiptText },
          { title: "Salon at Home", description: "Starting at ₹349 | 130+ providers", icon: Camera },
          { title: "Massage Therapy", description: "Starting at ₹799 | 60+ providers", icon: LifeBuoy },
          { title: "Fitness Training", description: "Starting at ₹699 | 45+ providers", icon: Users },
          { title: "Deep Cleaning", description: "Starting at ₹899 | 150+ providers", icon: Sparkles },
          { title: "Bathroom Cleaning", description: "Starting at ₹299 | 140+ providers", icon: Wrench },
          { title: "RO Service", description: "Starting at ₹349 | 90+ providers", icon: CheckCircle2 },
          { title: "CCTV Setup", description: "Starting at ₹999 | 75+ providers", icon: Shield },
          { title: "Smart Home Setup", description: "Starting at ₹899 | 55+ providers", icon: MonitorCog },
        ],
      },
    ],
  },
  services: {
    slug: "/services",
    title: "Services",
    subtitle: "Featured services, top-rated providers, ratings, and availability in one place.",
    heroDescription: "The services page helps users explore what is available right now, who is highly rated, and how the estimated pricing compares before they book.",
    heroIcon: BriefcaseBusiness,
    ctaPrimary: { label: "Book Now", href: "/contact-us" },
    ctaSecondary: { label: "Compare Categories", href: "/service-categories" },
    sections: [
      {
        id: "featured-services",
        title: "Featured Services",
        icon: Sparkles,
        paragraphs: [
          "Featured services are selected to highlight the strongest combinations of provider quality, booking demand, and user satisfaction. They may include urgent home repair options, seasonal services, or categories with especially high repeat usage.",
          "Each featured card is meant to show the service scope clearly, without forcing the user to read a long block of text before understanding whether the service fits their need."
        ],
        cards: [
          { title: "AC Service", description: "4.9 rating | ₹349 onward | Available today", icon: Fan },
          { title: "Deep Home Cleaning", description: "4.8 rating | ₹899 onward | Morning slots open", icon: Sparkles },
          { title: "Electrician Visit", description: "4.9 rating | ₹199 onward | Evening availability", icon: Zap },
          { title: "Bathroom Repair", description: "4.7 rating | ₹299 onward | Same-day dispatch", icon: Wrench },
        ],
      },
      {
        id: "top-rated-providers",
        title: "Top Rated Providers",
        icon: Star,
        paragraphs: [
          "Top-rated providers are surfaced based on service quality, punctuality, booking completion, and customer feedback. Ratings are not displayed as decoration; they are a practical trust signal for users deciding who to invite into their home.",
          "Providers with strong reviews typically show clearer service descriptions, better communication, and fewer cancellations."
        ],
        cards: [
          { title: "Rahul Services", description: "4.9 average | 520 bookings | Bangalore East", icon: Users },
          { title: "PrimeFix Team", description: "4.8 average | 410 bookings | Whitefield", icon: ShieldCheck },
          { title: "HomeSpark Pros", description: "4.9 average | 390 bookings | Indiranagar", icon: Sparkles },
        ],
      },
      {
        id: "availability-pricing",
        title: "Availability and Pricing",
        icon: CalendarClock,
        paragraphs: [
          "Service availability is shown so users can see whether same-day, next-day, or scheduled slots are realistic. Estimated pricing is presented as a starting point because final price can vary based on scope, location, and parts or materials.",
          "This keeps expectations honest while still making the marketplace easy to scan. It also helps users compare options without needing to open every listing individually."
        ],
      },
    ],
  },
  payments: {
    slug: "/payments",
    title: "Payments",
    subtitle: "Secure payment flows with support for UPI, cards, net banking, and wallets.",
    heroDescription: "Sahāy handles payments through a trust-focused checkout flow that keeps booking confirmation, receipts, refunds, and transaction security easy to understand.",
    heroIcon: Wallet,
    ctaPrimary: { label: "Get Support", href: "/customer-care" },
    ctaSecondary: { label: "Read Refund Policy", href: "/refund-policy" },
    sections: [
      {
        id: "supported-methods",
        title: "Supported Payment Methods",
        icon: CreditCard,
        paragraphs: [
          "Sahāy supports the payment methods most users already trust: UPI, credit cards, debit cards, net banking, and popular wallets. This range gives users flexibility while preserving a clean checkout experience that feels modern and familiar.",
          "Payment method availability may vary slightly based on the partner gateway or transaction type, but the platform aims to keep the list broad enough for everyday use."
        ],
        cards: [
          { title: "UPI", description: "Fast, mobile-first payments across major Indian apps.", icon: Wallet },
          { title: "Cards", description: "Visa, Mastercard, and other supported card rails.", icon: CreditCard },
          { title: "Net Banking", description: "Bank transfer support for users who prefer direct bank checkout.", icon: Building2 },
          { title: "Wallets", description: "Compatible with widely used consumer wallets.", icon: Wallet },
        ],
      },
      {
        id: "secure-payments",
        title: "Secure Payment Section",
        icon: ShieldCheck,
        paragraphs: [
          "Escrow-style payments help ensure that money is released only when the service flow reaches the right stage. This protects customers from paying too early and helps providers trust that completed work will be compensated in a controlled manner.",
          "Refund processing is handled through a documented support workflow. If a refund is approved, we aim to return the amount to the original payment source whenever possible. Transaction security is supported through gateway controls, access restrictions, and monitoring for unusual activity."
        ],
      },
      {
        id: "payment-faqs",
        title: "Payment FAQs",
        icon: HelpCircle,
        paragraphs: [
          "Users often ask when a payment will be captured, how refunds are visible on statements, and what to do if a transaction fails. Clear answers to those questions help reduce friction at checkout and improve confidence in the platform.",
          "If a payment is pending, reversed, or partially refunded, the support team can review timestamps and gateway records to clarify what happened."
        ],
        bullets: ["Captured after booking confirmation", "Refunds follow case review", "Failed transactions are not treated as completed orders", "Receipts can be used for support escalation"],
      },
    ],
  },
  about: {
    slug: "/about-us",
    title: "About Us",
    subtitle: "The story, mission, values, and growth metrics behind Sahāy.",
    heroDescription: "Sahāy was created to make local service discovery feel structured, trustworthy, and genuinely useful for Indian households that want dependable help.",
    heroIcon: BriefcaseBusiness,
    stats: [
      { label: "Customers", value: "10,000+" },
      { label: "Providers", value: "2,000+" },
      { label: "Cities", value: "50+" },
      { label: "Satisfaction", value: "95%" },
    ],
    ctaPrimary: { label: "Join Sahāy", href: "/careers" },
    ctaSecondary: { label: "Contact Team", href: "/contact-us" },
    sections: [
      {
        id: "company-story",
        title: "Company Story",
        icon: BookOpen,
        paragraphs: [
          "Sahāy began with a simple observation: people are comfortable ordering food, rides, and products online, yet local services still feel fragmented, uncertain, and difficult to compare. The marketplace was designed to close that gap by bringing service discovery, trust signals, communication, and support into one product.",
          "The brand is intentionally positioned to feel reassuring and modern. Every interaction is meant to reduce uncertainty, from category browsing to post-service support. That philosophy shaped the product’s information design, policy pages, and overall tone."
        ],
      },
      {
        id: "mission-vision",
        title: "Mission and Vision",
        icon: ShieldCheck,
        paragraphs: [
          "Our mission is connecting people with trusted local professionals in a way that is clear, secure, and efficient. We want customers to feel confident about who is coming to their home and providers to feel respected by the platform they rely on for business.",
          "Our vision is to make local services accessible and secure at scale, so that every city user can quickly find reliable help without relying on scattered recommendations or uncertain offline arrangements."
        ],
      },
      {
        id: "core-values",
        title: "Core Values",
        icon: HeartHandshake,
        paragraphs: [
          "Trust means showing users enough detail to make an informed decision. Transparency means not hiding fees, rules, or support paths. Reliability means respecting time and delivery promises. Safety means treating customer homes, payments, and data with serious care.",
          "These values shape both the product and the legal pages. They are not marketing words; they are operational principles that define how Sahāy should behave."
        ],
        bullets: ["Trust", "Transparency", "Reliability", "Safety"],
      },
      {
        id: "statistics",
        title: "Statistics",
        icon: Calculator,
        paragraphs: [
          "The numbers on this page represent the type of scale Sahāy is built to achieve and the kind of traction a mature local services marketplace would highlight. They help the brand feel real, established, and presentation-ready.",
          "The statistics card is also useful in demos because it gives the audience an immediate sense of growth, adoption, and customer confidence."
        ],
        cards: [
          { title: "10,000+ Customers", description: "Households and individuals using the platform across service categories.", icon: Users },
          { title: "2,000+ Providers", description: "Independent professionals and service teams listed on the marketplace.", icon: BadgeCheck },
          { title: "50+ Cities", description: "Coverage planned across major urban and emerging markets.", icon: Globe },
          { title: "95% Satisfaction", description: "A strong signal of completed jobs and service quality.", icon: Star },
        ],
      },
    ],
  },
  careers: {
    slug: "/careers",
    title: "Careers",
    subtitle: "Build the future of trusted local services with a product-minded team.",
    heroDescription: "Join Sahāy if you want to work on meaningful product problems in design, engineering, support, operations, and growth.",
    heroIcon: BriefcaseBusiness,
    ctaPrimary: { label: "Apply Now", href: "/contact-us" },
    ctaSecondary: { label: "See Open Roles", href: "#open-positions" },
    sections: [
      {
        id: "why-join",
        title: "Why Join Sahāy",
        icon: Users,
        paragraphs: [
          "Sahāy is the kind of product where good execution is visible to the user. Every improvement in the booking journey, service clarity, support flow, or provider management makes a direct difference in customer trust.",
          "That creates a rewarding environment for people who enjoy shipping practical work and seeing its impact quickly."
        ],
      },
      {
        id: "benefits",
        title: "Benefits",
        icon: HeartHandshake,
        paragraphs: [
          "Team members get the chance to work in a fast-moving environment with high ownership and a clear product mission. The company culture values direct communication, clean execution, and a strong sense of responsibility.",
          "The workplace is designed to be supportive for learning, experimentation, and cross-functional collaboration."
        ],
        cards: [
          { title: "Flexible Work", description: "Outcome-driven work with practical scheduling support.", icon: Clock3 },
          { title: "Learning Opportunities", description: "Exposure to product, ops, and marketplace decisions.", icon: GraduationCap },
          { title: "Competitive Compensation", description: "Fair pay designed to attract high-quality contributors.", icon: Wallet },
          { title: "Remote Friendly", description: "Hybrid-first thinking for focused and collaborative execution.", icon: Laptop },
        ],
      },
      {
        id: "open-positions",
        title: "Open Positions",
        icon: BriefcaseBusiness,
        paragraphs: [
          "Sahāy typically hires for roles across engineering, customer support, product, and growth. These roles reflect the actual operating needs of a marketplace business where reliability, communication, and user experience matter equally.",
          "The list below is intentionally realistic for a scaling startup and suitable for an MCA portfolio presentation or hiring page mockup."
        ],
        cards: [
          { title: "Frontend Developer", description: "Build responsive customer and provider experiences in React or Next.js.", icon: Laptop },
          { title: "Backend Developer", description: "Support API, booking, payment, and data systems.", icon: ShieldCheck },
          { title: "Customer Support Executive", description: "Handle support queries, disputes, and platform guidance.", icon: Headphones },
          { title: "Product Manager", description: "Improve marketplace flows and coordinate roadmap decisions.", icon: LayoutGrid },
          { title: "Marketing Associate", description: "Grow awareness through brand, content, and local campaigns.", icon: Megaphone },
        ],
      },
      {
        id: "apply-now",
        title: "Apply Now",
        icon: Send,
        paragraphs: [
          "Candidates can use the contact page to share their resume, role preference, and portfolio or work samples. A practical application flow keeps the experience simple and lets the team evaluate interest quickly.",
          "For a presentation-ready design, this section works best with clear call-to-action buttons and a concise summary of what the team is looking for."
        ],
      },
    ],
  },
  contact: {
    slug: "/contact-us",
    title: "Contact Us",
    subtitle: "Reach Sahāy for support, partnerships, or general marketplace questions.",
    heroDescription: "The contact page helps users and partners reach the team through a clear form, office details, email, phone, and business hours.",
    heroIcon: MessageSquareMore,
    ctaPrimary: { label: "Send Message", href: "#contact-form" },
    ctaSecondary: { label: "Go to Help Center", href: "/help-center" },
    sections: [
      {
        id: "office-details",
        title: "Office Details",
        icon: Building2,
        paragraphs: [
          "Sahāy Technologies Pvt Ltd is presented as a Bangalore-based company serving users across Indian cities. The physical presence adds credibility to the brand and gives users a simple point of reference for business communication.",
          "Office address: Sahāy Technologies Pvt Ltd, Bangalore, Karnataka, India. Business hours are Monday to Saturday from 9 AM to 6 PM."
        ],
      },
      {
        id: "contact-channels",
        title: "Contact Channels",
        icon: Phone,
        paragraphs: [
          "Users can reach the team through support email, phone, or the form below. These channels cover everything from basic booking questions to more sensitive support escalations or business inquiries.",
          "For public-facing contact, the support email is designed to be the primary entry point because it creates a traceable record and allows the team to route requests appropriately."
        ],
        cards: [
          { title: "Email", description: "support@sahay.app", icon: MessageSquare },
          { title: "Phone", description: "+91 XXXXX XXXXX", icon: Phone },
          { title: "Business Hours", description: "Mon – Sat, 9 AM – 6 PM", icon: Clock3 },
          { title: "Location", description: "Bangalore, Karnataka, India", icon: MapPin },
        ],
      },
      {
        id: "contact-form",
        title: "Contact Form",
        icon: Send,
        paragraphs: [
          "The form should collect the minimum useful information: name, email, subject, and message. That keeps the experience accessible while still allowing the support team to classify the request efficiently.",
          "In the live product, submission would trigger a confirmation message, ticket creation, or email response. For the MCA demo, the visual form itself is enough to show the intended interaction pattern."
        ],
        bullets: ["Name", "Email", "Subject", "Message"],
      },
    ],
  },
  help: {
    slug: "/help-center",
    title: "Help Center",
    subtitle: "Search-first support that helps users find answers faster.",
    heroDescription: "This page is designed to reduce support friction with a visible search bar, topic cards, and practical guidance for common user needs.",
    heroIcon: LifeBuoy,
    ctaPrimary: { label: "Browse FAQs", href: "/faqs" },
    ctaSecondary: { label: "Contact Support", href: "/customer-care" },
    sections: [
      {
        id: "search",
        title: "Search Bar",
        icon: Search,
        paragraphs: [
          "How can we help you today? Search is the fastest way to route a user to the right answer, especially when they already know the kind of issue they are facing. Common search patterns usually include payment failures, provider verification, booking changes, or account access.",
          "Good support design starts with discoverability. The search bar should feel prominent, fast, and forgiving so that users do not need to guess where to begin."
        ],
      },
      {
        id: "popular-topics",
        title: "Popular Topics",
        icon: BadgeHelp,
        paragraphs: [
          "The help center should highlight the most common issues first because users tend to look for immediate answers to service disruptions or billing questions. Each topic card can connect to a deeper article or a support workflow.",
          "This structure helps users move from confusion to resolution with minimal effort."
        ],
        cards: [
          { title: "Booking Issues", description: "Problems with scheduling, confirmations, and provider assignment.", icon: CalendarClock },
          { title: "Payment Issues", description: "Failed payments, double charges, and pending transactions.", icon: CreditCard },
          { title: "Refund Requests", description: "Eligibility checks, timelines, and refund status updates.", icon: RefreshCcw },
          { title: "Provider Verification", description: "Questions about badges, documents, and trust signals.", icon: BadgeCheck },
          { title: "Account Management", description: "Login, profile edits, address details, and security controls.", icon: UserCog },
        ],
      },
    ],
  },
  faqs: {
    slug: "/faqs",
    title: "FAQs",
    subtitle: "A detailed set of common questions and answers for Sahāy users and providers.",
    heroDescription: "The FAQ page reduces repetitive support traffic by answering the most common marketplace questions in a structured, trustworthy format.",
    heroIcon: CircleHelp,
    ctaPrimary: { label: "Raise a Dispute", href: "/raise-a-dispute" },
    ctaSecondary: { label: "View Policies", href: "/privacy-policy" },
    sections: [
      {
        id: "faq-questions",
        title: "Frequently Asked Questions",
        icon: HelpCircle,
        paragraphs: [
          "This FAQ set is intentionally broad enough to cover booking, verification, payments, cancellations, safety, and support. The answers should feel helpful and realistic rather than vague or overly promotional.",
          "Below is a representative set of 20+ questions and answers for a marketplace audience."
        ],
        cards: [
          { title: "How do I book a service?", description: "Choose a category, review providers, confirm details, and complete your booking.", icon: CalendarClock },
          { title: "How are providers verified?", description: "Through document review, profile checks, service history, and internal moderation.", icon: BadgeCheck },
          { title: "What payment methods are accepted?", description: "UPI, cards, net banking, and selected wallets are supported.", icon: CreditCard },
          { title: "Can I cancel a booking?", description: "Yes, subject to timing, service status, and cancellation policy rules.", icon: RotateCcw },
          { title: "How do refunds work?", description: "Refunds depend on eligibility, service stage, and support review.", icon: ReceiptText },
          { title: "Is in-app chat secure?", description: "It is monitored for safety and intended to reduce off-platform risk.", icon: MessageCircle },
        ],
      },
    ],
  },
  care: {
    slug: "/customer-care",
    title: "Customer Care",
    subtitle: "A practical support center with live chat, email, phone, and a ticket tracker.",
    heroDescription: "Customer care is designed to be organized and responsive so users can understand where their issue stands and what happens next.",
    heroIcon: Headphones,
    ctaPrimary: { label: "Track Ticket", href: "#ticket-tracker" },
    ctaSecondary: { label: "Email Support", href: "mailto:support@sahay.app" },
    sections: [
      {
        id: "support-channels",
        title: "Support Channels",
        icon: Headphones,
        paragraphs: [
          "Support channels should be clear and easy to distinguish. Live chat is best for quick issues, email support is best for traceable follow-ups, and phone support is useful when a user needs real-time assistance during a time-sensitive booking.",
          "This mix reflects how real service marketplaces balance speed, accountability, and convenience."
        ],
        cards: [
          { title: "Live Chat", description: "Best for quick booking and payment questions.", icon: MessageSquare },
          { title: "Email Support", description: "Best for documents, complaints, and escalations.", icon: Send },
          { title: "Phone Support", description: "Best for urgent or time-sensitive service issues.", icon: Phone },
        ],
      },
      {
        id: "ticket-tracker",
        title: "Ticket Status Tracker",
        icon: FileCheck,
        paragraphs: [
          "A ticket tracker gives users a sense of progress after a complaint or query has been submitted. The ideal flow shows whether a case is received, under review, awaiting information, resolved, or closed.",
          "This kind of visibility reduces repeat follow-ups and improves trust in the support team."
        ],
      },
      {
        id: "escalation-process",
        title: "Escalation Process",
        icon: FileWarning,
        paragraphs: [
          "Escalation is the process used when the first response is not enough or when the issue requires deeper review. A clear escalation ladder keeps the user from feeling stuck and helps the team allocate the right attention to serious cases.",
          "Sahāy’s support flow should be calm, documented, and predictable so users know what to expect at each stage."
        ],
      },
    ],
  },
  dispute: {
    slug: "/raise-a-dispute",
    title: "Raise a Dispute",
    subtitle: "Report booking issues using a structured complaint and evidence flow.",
    heroDescription: "The dispute page gives users a formal route for raising complaints about service quality, payments, behavior, or booking outcomes.",
    heroIcon: FileWarning,
    ctaPrimary: { label: "Submit Complaint", href: "#dispute-form" },
    ctaSecondary: { label: "Read Refund Policy", href: "/refund-policy" },
    sections: [
      {
        id: "report-form",
        title: "Report an Issue Form",
        icon: FileText,
        paragraphs: [
          "A dispute form should ask for the booking ID, issue type, a short description, and evidence upload so the support team can understand the situation quickly. This prevents the user from having to explain the same issue multiple times across channels.",
          "The form structure also helps the company separate service quality complaints from billing disputes, safety concerns, or communication breakdowns."
        ],
        bullets: ["Booking ID", "Issue Type", "Description", "Evidence Upload"],
      },
      {
        id: "resolution-process",
        title: "Resolution Process",
        icon: RotateCcw,
        paragraphs: [
          "Step 1: Submit Complaint. Step 2: Investigation. Step 3: Resolution. The process should feel visible and fair so users understand that disputes are being handled in sequence rather than lost in a generic inbox.",
          "A strong resolution process improves confidence in the marketplace because it shows that Sahāy is willing to review facts, not just automate replies."
        ],
        cards: [
          { title: "Submission", description: "Complaint and evidence enter the support queue.", icon: Send },
          { title: "Investigation", description: "Team reviews booking logs, chat, and timestamps.", icon: Search },
          { title: "Resolution", description: "Support issues a response, refund, or corrective action.", icon: CheckCircle2 },
        ],
      },
    ],
  },
  refund: {
    slug: "/refund-policy",
    title: "Refund Policy",
    subtitle: "Clear rules for eligibility, timelines, partial refunds, and failed-service refunds.",
    heroDescription: "This policy explains how Sahāy handles refund requests in a marketplace context where service stages, provider actions, and customer responsibilities all matter.",
    heroIcon: ReceiptText,
    ctaPrimary: { label: "Contact Support", href: "/customer-care" },
    ctaSecondary: { label: "View Cancellation Policy", href: "/cancellation-policy" },
    sections: [
      {
        id: "refund-eligibility",
        title: "Refund Eligibility",
        icon: CheckCircle2,
        paragraphs: [
          "Refund eligibility depends on whether the provider completed the service, whether the cancellation happened before dispatch, and whether any product or part purchase has already been made. The key objective is to avoid unfair loss on either side while preserving a predictable support process.",
          "Eligibility may be affected by booking stage, no-show behavior, and any special agreements that were explicitly accepted by both sides in the platform."
        ],
      },
      {
        id: "processing-time",
        title: "Processing Time",
        icon: Clock3,
        paragraphs: [
          "Refund processing time varies based on the payment method and the time needed to verify the booking record. In general, card and wallet refunds may take several business days to appear, while UPI and bank-based flows may follow gateway-specific timelines.",
          "The support team should always communicate the expected timeline clearly so users know when to check their statement or payment app."
        ],
      },
      {
        id: "partial-refunds",
        title: "Partial Refunds",
        icon: Calculator,
        paragraphs: [
          "Partial refunds may be appropriate where the provider completed only part of the work, where a dispatch fee was already incurred, or where a service was modified after the booking was accepted. This allows the company to account for real cost while still returning the unearned portion of the payment.",
          "Partial refunds should be explained in plain language so the customer can see how the final amount was derived."
        ],
      },
      {
        id: "failed-service",
        title: "Failed Service Refunds",
        icon: ShieldAlert,
        paragraphs: [
          "If a provider fails to attend, refuses the agreed service without cause, or leaves the job incomplete due to internal fault, the booking may qualify for a stronger refund or corrective rebooking support. The idea is to restore customer confidence as quickly as possible.",
          "Support teams should review timestamps, chat history, and any evidence provided before finalizing this type of refund."
        ],
      },
      {
        id: "customer-responsibilities-refund",
        title: "Customer Responsibilities",
        icon: UserCog,
        paragraphs: [
          "Customers are expected to provide accurate booking details, remain available during the appointment window, and share evidence promptly if they want a refund review. Delayed or incomplete submissions can slow the process and make it harder to evaluate the case fairly.",
          "A structured request helps the company respond efficiently and keeps the marketplace experience professional for everyone involved."
        ],
      },
    ],
  },
  privacy: null as never,
  terms: null as never,
  cancellation: null as never,
  security: null as never,
  cookies: null as never,
};
