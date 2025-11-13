import * as React from "react";
export function Checkbox({ className="", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={`h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 ${className}`} {...props} />;
}
