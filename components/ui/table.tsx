import * as React from "react";
export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) { return <table className="w-full text-sm" {...props}/>; }
export function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead className="bg-slate-50" {...props}/>; }
export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props}/>; }
export function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) { return <tr className="border-b last:border-b-0" {...props}/>; }
export function TableHead(props: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th className="px-3 py-2 text-left font-medium text-slate-600" {...props}/>; }
export function TableCell(props: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className="px-3 py-2 align-top" {...props}/>; }
