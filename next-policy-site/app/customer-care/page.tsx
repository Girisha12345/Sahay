import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { Headphones, MessageCircle, Mail, Phone, FileText, CheckCircle2, Clock3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Care",
  description: "Customer care page for Sahāy with live chat, email, phone support, ticket tracking, and escalation process.",
};

export default function CustomerCarePage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Customer Care" }]} />
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-6 py-10 text-white shadow-soft sm:px-10 sm:py-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
            <Headphones className="h-4 w-4" /> Customer Care
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Support that is easy to reach and easy to track</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Use the right channel for the issue, then track your case with a structured resolution process.</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          [MessageCircle, "Live Chat", "Use chat for quick booking, timing, or payment questions."],
          [Mail, "Email Support", "Best for formal records, attachments, and follow-up replies."],
          [Phone, "Phone Support", "Best for urgent situations that need real-time assistance."],
        ].map(([Icon, title, text]) => (
          <article key={title as string} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{title as string}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{text as string}</p>
          </article>
        ))}
      </section>

      <section id="ticket-tracker" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"><FileText className="h-4 w-4 text-sky-600" /> Ticket Status Tracker</div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            "Received",
            "Under Review",
            "Awaiting Information",
            "Resolved",
          ].map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">{index + 1}</div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"><CheckCircle2 className="h-4 w-4 text-sky-600" /> Escalation Process</div>
        <ol className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
          <li><strong className="text-slate-900">Step 1:</strong> The user raises the issue through a support channel.</li>
          <li><strong className="text-slate-900">Step 2:</strong> Support reviews the case and gathers missing information if needed.</li>
          <li><strong className="text-slate-900">Step 3:</strong> The case is resolved or escalated to a senior reviewer where necessary.</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/help-center" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Help Center</Link>
          <Link href="/raise-a-dispute" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">Raise a Dispute</Link>
        </div>
      </section>
    </div>
  );
}
