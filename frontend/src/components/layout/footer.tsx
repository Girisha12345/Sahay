export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 py-10 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold">Sahāy</h3>
          <p className="mt-2 text-sm text-slate-400">Trusted local services, delivered with speed and safety.</p>
        </div>
        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Support</h4>
          <p className="mt-2 text-sm text-slate-400">support@sahay.app</p>
        </div>
      </div>
    </footer>
  );
}
