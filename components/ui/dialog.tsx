import * as React from "react";
type Props = { open: boolean, onOpenChange: (v:boolean)=>void, children: React.ReactNode };
export function Dialog({ open, onOpenChange, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={()=>onOpenChange(false)}>
      <div className="mx-4 max-w-md rounded-2xl bg-white p-4" onClick={(e)=>e.stopPropagation()}>{children}</div>
    </div>
  );
}
export function DialogContent({ className="", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) { return <div className="mb-2" {...props}/>; }
export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className="text-lg font-semibold" {...props}/>; }
export function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) { return <p className="text-sm text-slate-600" {...props}/>; }
