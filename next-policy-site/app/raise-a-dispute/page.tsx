import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { FileWarning, Upload, ClipboardList, Search, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Raise a Dispute",
  description: "Submit booking disputes on Sahāy with issue type, description, and evidence upload support.",
};

export default function RaiseDisputePage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Raise a Dispute" }]} />
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-6 py-10 text-white shadow-soft sm:px-10 sm:py-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100"><FileWarning className="h-4 w-4" /> Dispute Resolution</div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Report service issues with a clear evidence trail</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Use the form below to record the booking ID, issue type, and supporting evidence so the team can investigate fairly.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Booking ID</span>
              <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="BK-2026-00124" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Issue Type</span>
              <select className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500">
                <option>Service quality</option><option>Provider no-show</option><option>Payment dispute</option><option>Safety concern</option><option>Other</option>
              </select>
            </label>
          </div>
          <label className="mt-5 block space-y-2 text-sm font-medium text-slate-700">
            <span>Description</span>
            <textarea className="min-h-40 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Explain what happened, when it happened, and how it affected the booking." />
          </label>
          <label className="mt-5 block space-y-2 text-sm font-medium text-slate-700">
            <span>Evidence Upload</span>
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              <Upload className="mx-auto mb-3 h-6 w-6 text-sky-600" />
              Add screenshots, photos, or payment proof here.
            </div>
          </label>
          <button className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">Submit Complaint</button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"><ClipboardList className="h-4 w-4 text-sky-600" /> Resolution Process</div>
          <div className="mt-5 space-y-4">
            {[
              [1, "Submit Complaint", "The issue enters the queue with booking details and evidence."],
              [2, "Investigation", "Support reviews chat logs, timestamps, and service records."],
              [3, "Resolution", "The team decides on corrective action, refund, or closure."],
            ].map(([step, title, text]) => (
              <div key={title as string} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">{step as number}</div>
                <h2 className="mt-3 text-lg font-bold text-slate-900">{title as string}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm leading-7 text-slate-700">
            Share evidence promptly so the investigation can stay accurate and fair.
          </div>
        </section>
      </section>
    </div>
  );
}
