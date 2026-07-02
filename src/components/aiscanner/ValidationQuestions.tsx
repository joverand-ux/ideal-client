import { HelpCircle } from "lucide-react";

export function ValidationQuestions({ questions }: { questions: string[] }) {
  return (
    <ol className="space-y-3">
      {questions.map((q, i) => (
        <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3.5">
          <HelpCircle size={16} className="mt-0.5 shrink-0 text-blue-400" />
          <span className="text-sm text-slate-700">{q}</span>
        </li>
      ))}
    </ol>
  );
}
