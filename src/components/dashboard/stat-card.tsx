import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
  color?: "purple" | "green" | "amber" | "blue";
}

const colorMap = {
  purple: "bg-[#DCC9F7] text-[#4027C1]",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  color = "purple",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#DCC9F7] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={["rounded-lg p-2.5", colorMap[color]].join(" ")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
