interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  step?: string;
  icon?: React.ReactNode;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-[#FED7AA] bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, step, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-[#FFEDD5] px-6 py-4">
      <div className="flex items-center gap-3">
        {step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#EA580C] to-[#7C2D12] text-xs font-bold text-white shadow-sm">
            {step}
          </span>
        )}
        {icon && !step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#EA580C]">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={["p-6", className].join(" ")}>{children}</div>;
}
