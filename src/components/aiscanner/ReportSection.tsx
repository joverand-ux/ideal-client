import type { LucideIcon } from "lucide-react";

interface ReportSectionProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ReportSection({ title, icon: Icon, description, children, className }: ReportSectionProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className ?? ""}`}>
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
