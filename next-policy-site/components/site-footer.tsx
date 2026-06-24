import Link from "next/link";
import { Camera, Link2, Share2, X } from "lucide-react";

export function SiteFooter() {
  const quickLinks = [
    ["Home", "/"],
    ["Service Categories", "/service-categories"],
    ["Services", "/services"],
    ["Payments", "/payments"],
    ["About Us", "/about-us"],
    ["Careers", "/careers"],
    ["Contact Us", "/contact-us"],
  ] as const;

  const supportLinks = [
    ["Help Center", "/help-center"],
    ["FAQs", "/faqs"],
    ["Customer Care", "/customer-care"],
    ["Raise a Dispute", "/raise-a-dispute"],
    ["Refund Policy", "/refund-policy"],
  ] as const;

  const legalLinks = [
    ["Privacy Policy", "/privacy-policy"],
    ["Terms & Conditions", "/terms-conditions"],
    ["Cancellation Policy", "/cancellation-policy"],
    ["Security Policy", "/security-policy"],
    ["Cookie Policy", "/cookie-policy"],
  ] as const;

  return (
    <footer className="mt-16 border-t border-slate-800/10 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <section>
            <h3 className="text-2xl font-black text-white">Sahay-Local Service Market Place</h3>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">Trusted local services, delivered with speed and safety.</p>
            <p className="mt-4 text-sm text-slate-300">Bangalore, India</p>
            <a href="mailto:sahayserviceshub@gmail.com" className="mt-2 block text-sm text-slate-300 hover:text-white">sahayserviceshub@gmail.com</a>
            <a href="tel:+919019738720" className="mt-2 block text-sm text-slate-300 hover:text-white">+91 9019738720</a>
            <div className="mt-5 flex items-center gap-3">
              {[
                [Share2, "Facebook"],
                [Camera, "Instagram"],
                [Link2, "LinkedIn"],
                [X, "Twitter/X"],
              ].map(([Icon, label]) => (
                <a key={label as string} href="#" aria-label={label as string} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:bg-white/10 hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Quick Links</h4>
            <div className="mt-4 grid gap-3 text-sm">
              {quickLinks.map(([label, href]) => <Link key={label} href={href} className="text-slate-300 hover:translate-x-1 hover:text-white">{label}</Link>)}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Support</h4>
            <div className="mt-4 grid gap-3 text-sm">
              {supportLinks.map(([label, href]) => <Link key={label} href={href} className="text-slate-300 hover:translate-x-1 hover:text-white">{label}</Link>)}
              <a href="mailto:support@sahay.app" className="text-slate-300 hover:text-white">support@sahay.app</a>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Legal</h4>
            <div className="mt-4 grid gap-3 text-sm">
              {legalLinks.map(([label, href]) => <Link key={label} href={href} className="text-slate-300 hover:translate-x-1 hover:text-white">{label}</Link>)}
            </div>
          </section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex sm:items-center sm:justify-between">
          <p>© 2026 Sahāy. All Rights Reserved.</p>
          <p>Made with <span className="text-rose-400">♥</span> in India</p>
        </div>
      </div>
    </footer>
  );
}