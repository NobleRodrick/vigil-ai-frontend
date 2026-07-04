import { Link } from "react-router-dom";
import { ShieldHalf } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper-50 px-6 text-center">
      <ShieldHalf className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
      <p className="font-mono text-5xl font-bold text-slate-200">404</p>
      <p className="text-sm text-slate-500">Page not found</p>
      <Link to="/" className="text-sm font-medium text-navy-600 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
