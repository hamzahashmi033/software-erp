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
        "rounded-xl border border-[#DCC9F7] bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, step, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-[#ece8f8] px-6 py-4">
      <div className="flex items-center gap-3">
        {step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4027C1] to-[#2D1879] text-xs font-bold text-white shadow-sm">
            {step}
          </span>
        )}
        {icon && !step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F3FC] text-[#4027C1]">
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
