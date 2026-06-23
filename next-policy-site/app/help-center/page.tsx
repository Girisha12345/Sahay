import type { Metadata } from "next";
import Link from "next/link";
import { Search, LayoutGrid, CalendarClock, CreditCard, RefreshCcw, BadgeCheck, UserCog, LifeBuoy } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

const topics = [
  { title: "Booking Issues", description: "Troubleshoot confirmation delays, slot changes, and provider acceptance.", icon: CalendarClock },
  { title: "Payment Issues", description: "Review failed payments, holds, duplicates, and pending transactions.", icon: CreditCard },
  { title: "Refund Requests", description: "Understand how to request a refund and what records help speed it up.", icon: RefreshCcw },
  { title: "Provider Verification", description: "Learn how Sahāy reviews profiles, documents, and service history.", icon: BadgeCheck },
  { title: "Account Management", description: "Manage login, profile data, addresses, and security settings.", icon: UserCog },
];

export const metadata: Metadata = {
  title: "Help Center",
  description: "Search-first help center with support topics for bookings, payments, refunds, provider verification, and account management.",
};

export default function HelpCenterPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Help Center" }]} />
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-6 py-10 text-white shadow-soft sm:px-10 sm:py-12">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
            <LifeBuoy className="h-4 w-4" /> Help Center
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">How can we help you today?</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Search the support knowledge base or jump directly into the most common issue categories.</p>
          <div className="flex max-w-2xl items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-lg">
            <Search className="h-5 w-5 text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="How can we help you today?" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"><LayoutGrid className="h-4 w-4 text-sky-600" /> Popular Topics</div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <article key={topic.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Icon className="h-5 w-5" /></div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">{topic.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{topic.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Need more direct help?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Use the support team, customer care, or dispute pages if the help article does not resolve your issue.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/customer-care" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Customer Care</Link>
          <Link href="/faqs" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">View FAQs</Link>
        </div>
      </section>
    </div>
  );
}
