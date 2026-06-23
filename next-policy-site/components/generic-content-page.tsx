import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import type { ContentPage } from "@/lib/site-page-data";

export function GenericContentPage({ data, breadcrumbLabel }: { data: ContentPage; breadcrumbLabel: string }) {
  const HeroIcon = data.heroIcon;

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: breadcrumbLabel }]} />

      <section className="overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-6 py-8 text-white shadow-soft sm:px-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="animate-fadeUp space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
              <HeroIcon className="h-4 w-4" />
              Sahāy Marketplace
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{data.title}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">{data.subtitle}</p>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">{data.heroDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={data.ctaPrimary.href} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">
                {data.ctaPrimary.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={data.ctaSecondary.href} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                {data.ctaSecondary.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {data.stats?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {data.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm leading-7 text-slate-200">{data.sections[0]?.paragraphs[0]}</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              <CalendarDays className="h-4 w-4 text-sky-600" />
              Overview
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">Scroll through the sections below to read the full page content.</p>
            <div className="mt-6 space-y-2">
              {data.sections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <a key={section.id} href={`#${section.id}`} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700">
                    <SectionIcon className="h-4 w-4 text-sky-600" />
                    {section.title}
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          {data.sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <article key={section.id} id={section.id} className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <SectionIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
                    <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-sky-600 to-cyan-400" />
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.id}-${index}`}>{paragraph}</p>
                  ))}
                </div>

                {section.bullets?.length ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.cards?.length ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {section.cards.map((card) => {
                      const CardIcon = card.icon;
                      return (
                        <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                            <CardIcon className="h-4 w-4" />
                          </div>
                          <h3 className="mt-3 text-base font-bold text-slate-900">{card.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Need help?</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Contact the Sahāy team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Reach the relevant support channel if you need clarification on this page or want to report an issue.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="mailto:support@sahay.app" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              <Mail className="h-4 w-4" />
              support@sahay.app
            </a>
            <a href="mailto:legal@sahay.app" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-500 hover:text-sky-700">
              <Mail className="h-4 w-4" />
              legal@sahay.app
            </a>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-100 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Presentation ready</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            This layout is designed for clean mobile responsiveness, strong visual hierarchy, and professional project demos.
          </p>
        </div>
      </section>
    </div>
  );
}