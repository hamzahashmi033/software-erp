import { Zap } from "lucide-react";

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-xl">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {process.env.FROM_NAME ?? "Invoice"}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
