import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <h1 className="text-5xl font-black text-slate-900">404</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
      <Link to="/">
        <Button className="mt-6">Go Home</Button>
      </Link>
    </div>
  );
}
