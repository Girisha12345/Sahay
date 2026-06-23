import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  ShieldCheck,
  CircleHelp,
  LifeBuoy,
  RotateCcw,
  Scale,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  ChevronDown,
  Building,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

type Section = {
  title: string;
  content: string;
  items?: string[];
};

type PageContent = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  sections: Section[];
};

const PAGES_DATA: Record<string, PageContent> = {
  about: {
    title: "About Sahāy",
    subtitle: "Connecting communities with trusted local services, delivered with speed and safety.",
    icon: Building,
    gradient: "from-sky-700 via-cyan-600 to-teal-500",
    sections: [
      {
        title: "Our Mission",
        content: "At Sahāy, we believe that finding reliable local help should not be a stressful chore. Our mission is to bridge the gap between skilled local service professionals and household customers, creating a safe, transparent, and mutually beneficial ecosystem.",
      },
      {
        title: "Our Core Values",
        content: "Every decision we make is guided by our four core pillars:",
        items: [
          "Trust: Verification of all service providers so you can book with confidence.",
          "Quality: Ensuring top-tier service delivery through customer ratings, reviews, and ongoing support.",
          "Safety: Implementing escrow payments and background screening protocols to protect all users.",
          "Fairness: Supporting service providers with competitive commissions and customers with fair prices.",
        ],
      },
      {
        title: "How We Work",
        content: "Sahāy operates as an escrow-based commission platform. When you book a service, your payment is held securely in escrow. It is only released to the service provider once the job is fully completed and you have verified the results. This guarantees quality work and absolute peace of mind.",
      },
    ],
  },
  careers: {
    title: "Careers at Sahāy",
    subtitle: "Shape the future of local services. Join us in building the digital backbone for local work.",
    icon: BriefcaseBusiness,
    gradient: "from-purple-700 via-indigo-600 to-blue-500",
    sections: [
      {
        title: "Why Join Us?",
        content: "Sahāy is a fast-growing tech startup dedicated to transforming the on-demand home services economy. We offer competitive salaries, flexible work hours, remote-friendly options, and a mission-driven team environment.",
      },
    ],
  },
  help: {
    title: "Help Center",
    subtitle: "How can we assist you today? Find guides and resources to help you use the Sahāy platform.",
    icon: CircleHelp,
    gradient: "from-teal-700 via-emerald-600 to-green-500",
    sections: [
      {
        title: "Popular Help Topics",
        content: "Select a category below to browse articles and troubleshooting steps:",
        items: [
          "Account Creation & Verification",
          "Booking a Service Provider",
          "Payment Methods and Secure Escrow",
          "Canceling a Booking",
          "Reviewing and Rating Providers",
        ],
      },
    ],
  },
  faqs: {
    title: "Frequently Asked Questions",
    subtitle: "Quick answers to common questions about booking, payments, cancellations, and accounts.",
    icon: FileText,
    gradient: "from-sky-700 via-blue-600 to-indigo-500",
    sections: [],
  },
  "customer-care": {
    title: "Customer Care",
    subtitle: "Reach out to our dedicated support channels. We are here to resolve any queries 24/7.",
    icon: LifeBuoy,
    gradient: "from-emerald-700 via-teal-600 to-cyan-500",
    sections: [
      {
        title: "Direct Support Channels",
        content: "We provide multiple avenues to get the assistance you need as quickly as possible. You can write to us, raise a dispute directly from your dashboard, or submit a request to support.",
      },
    ],
  },
  dispute: {
    title: "Raise a Dispute",
    subtitle: "Fair, prompt resolution for service and payment disagreements.",
    icon: RotateCcw,
    gradient: "from-rose-700 via-orange-600 to-amber-500",
    sections: [
      {
        title: "Dispute Resolution Process",
        content: "We strive to ensure both customers and providers are treated fairly. Our resolution process consists of three main steps:",
        items: [
          "Step 1: Submission - Submit a dispute ticket with booking details, description, and supporting photos/evidence.",
          "Step 2: Mediation - Our support team reviews the case and details from both parties.",
          "Step 3: Resolution - A fair decision is reached (e.g. escrow release, full/partial refund, or rework) within 3-5 business days.",
        ],
      },
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    subtitle: "Clear rules and timelines for cancellations, refunds, and escrow payments.",
    icon: Scale,
    gradient: "from-blue-700 via-indigo-600 to-violet-500",
    sections: [
      {
        title: "Escrow and Refunds",
        content: "Since payments are held securely in escrow, refunds are straightforward if a service is cancelled or not delivered according to terms:",
        items: [
          "Cancellations by Customer: Full refunds are issued if canceled at least 24 hours prior to the service schedule.",
          "Cancellations by Provider: Always eligible for a 100% full refund to the customer's wallet or payment card.",
          "Quality Disputes: Checked by our mediation team; partial or full refunds are credited based on mediation results.",
        ],
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "Your privacy is our priority. Read about how we gather, protect, and use your data.",
    icon: ShieldCheck,
    gradient: "from-slate-800 via-slate-700 to-slate-600",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We collect personal information that you provide to us (e.g., name, email, phone number, physical addresses, identity details for verification) and automatic usage information.",
      },
      {
        title: "2. How We Use Your Information",
        content: "To facilitate bookings, complete secure escrow payments, communicate notifications, authenticate chat services, and detect/prevent fraud.",
      },
      {
        title: "3. Data Sharing & Security",
        content: "We never sell your data. We share details only with selected partners (like payment gateways) to complete transactions, or as required by law.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "Please read these Terms of Service carefully before using the Sahāy platform.",
    icon: ShieldCheck,
    gradient: "from-slate-800 via-slate-700 to-slate-600",
    sections: [
      {
        title: "1. User Agreement",
        content: "By creating an account on Sahāy as a Customer, Provider, or Support Agent, you agree to comply with our code of conduct, safety policies, and payment terms.",
      },
      {
        title: "2. Payment and Escrow Agreement",
        content: "Customers pay upfront for bookings; funds are held securely in escrow and released to the provider upon completion. Support mediation decisions are final and binding.",
      },
    ],
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    subtitle: "Know your options for modifying or canceling bookings on Sahāy.",
    icon: ShieldCheck,
    gradient: "from-slate-800 via-slate-700 to-slate-600",
    sections: [
      {
        title: "Guidelines",
        content: "Cancellations impact service providers' schedules and customers' plans. Please cancel bookings as early as possible. Cancellations made within 2 hours of the scheduled time may attract a fee to compensate the provider's travel/effort.",
      },
    ],
  },
  "security-policy": {
    title: "Security Policy",
    subtitle: "How we maintain system integrity, transaction safety, and account protection.",
    icon: ShieldCheck,
    gradient: "from-slate-800 via-slate-700 to-slate-600",
    sections: [
      {
        title: "Transaction Security",
        content: "We use HTTPS encryption for all traffic, secure JWT tokens for authentication, and PCI-DSS compliant partner gateways for processing payments. Customer credentials and passwords are hashed using industry-standard hashing algorithms.",
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    subtitle: "Information about how we use cookies to provide and customize our services.",
    icon: ShieldCheck,
    gradient: "from-slate-800 via-slate-700 to-slate-600",
    sections: [
      {
        title: "What are cookies?",
        content: "Cookies are small text files stored on your device that help our website recognize you. We use essential cookies to maintain your logged-in session, and optional analytics cookies to understand site performance.",
      },
    ],
  },
};

const FAQ_LIST = [
  {
    q: "How does the payment escrow system work?",
    a: "When you book a service, you pay upfront. Sahāy holds this money in a secure escrow account. The funds are only transferred to the service provider after the job is completed and you confirm it via your dashboard.",
  },
  {
    q: "What if the service provider does not show up?",
    a: "If the provider fails to show up, you can cancel the booking directly from your customer dashboard and request a full refund, or contact customer care to reschedule.",
  },
  {
    q: "Are the service providers verified?",
    a: "Yes. All service providers on Sahāy undergo a rigorous identity and background document verification process. Providers are only allowed to accept bookings once their onboarding is approved by our compliance team.",
  },
  {
    q: "How do I resolve a disagreement with a provider?",
    a: "You can navigate to the 'Raise a Dispute' page or click the support link in your customer dashboard to raise a support ticket. Our dispute mediation team will review the chat logs and job details to issue a fair resolution.",
  },
];

const JOB_LIST = [
  { title: "Senior React Engineer", team: "Engineering", type: "Full-Time / Remote", location: "Bangalore, IN" },
  { title: "UI/UX Product Designer", team: "Design", type: "Full-Time", location: "Bangalore, IN" },
  { title: "Operations Associate", team: "Support & Ops", type: "Full-Time", location: "Mumbai, IN" },
];

export function StaticPage({ pageKey }: { pageKey: string }) {
  const navigate = useNavigate();
  const data = PAGES_DATA[pageKey] || PAGES_DATA.about;
  const PageIcon = data.icon;

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Hero Section */}
      <section className={`rounded-3xl bg-gradient-to-r ${data.gradient} p-8 text-white shadow-lg md:p-12`}>
        <div className="flex items-center gap-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
            <PageIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black md:text-4xl">{data.title}</h1>
            <p className="mt-2 text-sky-100 max-w-2xl text-sm leading-relaxed">{data.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Dynamic Render based on Key */}
      {pageKey === "faqs" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_LIST.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="border-b border-slate-150 pb-4 last:border-0 last:pb-0">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between py-2 text-left font-semibold text-slate-800 hover:text-sky-600 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {pageKey === "careers" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Life at Sahāy</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              We are a remote-first, energetic team focused on empowering millions of service professionals in India.
              We believe in deep technical ownership, beautiful design aesthetics, and a collaborative work culture.
            </p>
          </Card>
          
          <h2 className="text-xl font-bold text-slate-900">Current Openings</h2>
          <div className="grid gap-4">
            {JOB_LIST.map((job, idx) => (
              <Card key={idx} className="p-5 hover:shadow-md transition">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full">{job.team}</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full">{job.type}</span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full">{job.location}</span>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => alert("Application system simulated. Please email careers@sahay.app")}>
                    Apply Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pageKey === "customer-care" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-600" /> Support Tickets
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Submit a support ticket from your profile dashboard. Customers can open direct chats with support agents to resolve any operational booking issues instantly.
            </p>
            <Button className="w-full" onClick={() => navigate("/customer/support")}>
              Go to Support Page
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-sky-600" /> Hotlines
            </h2>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Customer Hotline:</span>
                <span className="font-semibold text-slate-900">+91 98765 43210</span>
              </div>
              <div className="flex justify-between">
                <span>Provider Assistance:</span>
                <span className="font-semibold text-slate-900">+91 98765 43211</span>
              </div>
              <div className="flex justify-between">
                <span>Support Hours:</span>
                <span className="font-semibold text-slate-900">24 / 7 Live Support</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Default Sections rendering for Policies / General Pages */}
      {data.sections.length > 0 && (
        <div className="space-y-6">
          {data.sections.map((section, idx) => (
            <Card key={idx} className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{section.content}</p>
              {section.items && (
                <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-slate-600">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
