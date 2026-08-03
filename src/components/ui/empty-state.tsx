import { FileX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-[#FFEDD5] p-4 text-[#EA580C]">
        {icon ?? <FileX className="h-8 w-8" />}
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
