const fromName = process.env.FROM_NAME ?? "Invoice";

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#FED7AA] px-6 py-4 sticky top-0 z-10">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-v2-1.png"
              alt={fromName}
              className="h-12 w-auto object-contain"
            />
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Secured by Stripe
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        {children}
      </main>

      <footer className="py-8 text-center">
        <p className="text-xs text-[#9b8ec4]">
          {fromName} &nbsp;·&nbsp; Payments powered by{" "}
          <span className="font-medium text-[#EA580C]">Stripe</span>
          &nbsp;·&nbsp; Your payment is secure and encrypted
        </p>
      </footer>
    </div>
  );
}
