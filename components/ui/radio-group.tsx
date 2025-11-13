import * as React from "react";
type RGProps = { value: string, onValueChange: (v:string)=>void, className?: string, children: React.ReactNode };
export function RadioGroup({ value, onValueChange, className="", children }: RGProps) {
  return <div className={className} role="radiogroup">{React.Children.map(children as any, (child: any) => {
    if (!child || !child.props) return child;
    const v = child.props.value;
    const selected = v === value;
    const onClick = ()=> onValueChange(v);
    return React.cloneElement(child, { selected, onClick });
  })}</div>;
}
export function RadioGroupItem({ value, selected, onClick, className="" }: any) {
  return <div onClick={onClick} className={`h-4 w-4 rounded-full border ${selected ? "bg-sky-600 border-sky-600" : "border-slate-400"} ${className}`} role="radio" aria-checked={selected} />;
}
