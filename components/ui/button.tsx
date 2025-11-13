import * as React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "secondary" | "default" };
export function Button({ className="", variant="default", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring";
  const styles = variant === "secondary"
    ? "border bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
    : "bg-sky-600 hover:bg-sky-700 text-white";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
