import type { LucideIcon } from "lucide-react";

import {
  BriefcaseBusiness,
  Camera,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  FileText,
  CircleHelp,
  LifeBuoy,
  RotateCcw,
  Scale,
  Share2,
  Link2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const linkClassName =
  "group inline-flex items-center gap-2 text-sm text-slate-300 transition-all duration-300 hover:translate-x-1 hover:text-white";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Service Categories", to: "/categories" },
  { label: "Services", to: "/services" },
  { label: "Payments", to: "/payments" },
  { label: "About Us", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact Us", to: "mailto:sahayserviceshub@gmail.com" },
];

const supportLinks = [
  { label: "Help Center", to: "/help", icon: CircleHelp },
  { label: "FAQs", to: "/faqs", icon: FileText },
  { label: "Customer Care", to: "/customer-care", icon: LifeBuoy },
  { label: "Raise a Dispute", to: "/dispute", icon: RotateCcw },
  { label: "Refund Policy", to: "/refund-policy", icon: Scale },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Cancellation Policy", to: "/cancellation-policy" },
  { label: "Security Policy", to: "/security-policy" },
  { label: "Cookie Policy", to: "/cookie-policy" },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com", icon: Share2 },
  { label: "Instagram", href: "https://www.instagram.com", icon: Camera },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Link2 },
  { label: "Twitter/X", href: "https://x.com", icon: X },
];

function FooterLink({ label, to }: { label: string; to: string }) {
  const isMailLink = to.startsWith("mailto:");

  if (isMailLink) {
    return (
      <a href={to} className={linkClassName}>
        <ChevronRight className="h-3.5 w-3.5 text-sky-400 transition-transform duration-300 group-hover:translate-x-1" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <Link to={to} className={linkClassName}>
      <ChevronRight className="h-3.5 w-3.5 text-sky-400 transition-transform duration-300 group-hover:translate-x-1" />
      <span>{label}</span>
    </Link>
  );
}

function ExternalLink({ label, href, icon: Icon }: { label: string; href: string; icon: LucideIcon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-sky-500/15 hover:text-sky-300 hover:shadow-lg hover:shadow-sky-500/10"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-slate-950 text-slate-200">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <section className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-white">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 ring-1 ring-inset ring-sky-400/20">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <span>Sahay-Local Service Market Place</span>
            </Link>

            <p className="max-w-xs text-sm leading-6 text-slate-400">
              Trusted local services, delivered with speed and safety.
            </p>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" />
                <span>Bangalore, India</span>
              </div>
              <a href="mailto:sahayserviceshub@gmail.com" className={linkClassName}>
                <Mail className="h-4 w-4 text-sky-400" />
                <span>sahayserviceshub@gmail.com</span>
              </a>
              <a href="tel:+919019738720" className={linkClassName}>
                <Phone className="h-4 w-4 text-sky-400" />
                <span>+91 9019738720</span>
              </a>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <ExternalLink key={social.label} {...social} />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Quick Links</h3>
            <div className="grid gap-3">
              {quickLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} to={link.to} />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Support</h3>
            <div className="grid gap-3">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                const isMailLink = link.to.startsWith("mailto:");

                return isMailLink ? (
                  <a key={link.label} href={link.to} className={linkClassName}>
                    <Icon className="h-3.5 w-3.5 text-sky-400" />
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <Link key={link.label} to={link.to} className={linkClassName}>
                    <Icon className="h-3.5 w-3.5 text-sky-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <a href="mailto:support@sahay.app" className={linkClassName}>
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span>support@sahay.app</span>
              </a>
            </div>
          </section>

          <section className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Legal</h3>
            <div className="grid gap-3">
              {legalLinks.map((link) => (
                <Link key={link.label} to={link.to} className={linkClassName}>
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Sahāy. All Rights Reserved.</p>
            <p>Made with <span className="text-rose-400">♥</span> in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
