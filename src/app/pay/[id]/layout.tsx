export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f9fc] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}
