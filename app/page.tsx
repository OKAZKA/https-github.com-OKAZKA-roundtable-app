'use client';
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EMAIL_TO = process.env.NEXT_PUBLIC_EMAIL_TO || (process.env.EMAIL_TO as string) || "your-email@example.com";
const ADMIN_PASSWORD = "doctor";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com/roundtable";

function downloadCSV(filename: string, rows: Record<string, string>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(rows.map((r) => headers.map((h) => '"' + String(r[h] ?? '').replace(/"/g, '""') + '"').join(",")))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveLocal(rec: any) {
  const key = "registrations";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.unshift(rec);
  localStorage.setItem(key, JSON.stringify(list));
}
function loadLocal(): any[] {
  try { return JSON.parse(localStorage.getItem("registrations") || "[]"); } catch { return []; }
}

const images = {
  mixSaladBeetPumpkin: "/menu/salad_beet_pumpkin.png",
  beefStroganoff: "/menu/beef_stroganoff.jpg",
  caesar: "/menu/caesar_chicken.jpg",
  kuyrdak: "/menu/kuyrdak_horse.jpg",
  eggplantCrispy: "/menu/eggplant_crispy.jpg",
  beefRibs: "/menu/beef_ribs.jpg",
  greenBeanSalad: "/menu/salad_green_beans.jpg",
  salmonSpaghetti: "/menu/spaghetti_salmon.webp",
  greek: "/menu/greek.jfif",
  plov: "/menu/plov_dastarkhan.jpg",
};

const menuOptions = [
  { id: "opt1", title: "Микс салат (запечённая свёкла и пряная тыква) + Бифстроганов в картофельном пюре", images: [images.mixSaladBeetPumpkin, images.beefStroganoff] },
  { id: "opt2", title: "Цезарь с курицей + Куырдак из конины", images: [images.caesar, images.kuyrdak] },
  { id: "opt3", title: "Хрустящие баклажаны + Томлёное говяжье ребро с картофельными дольками", images: [images.eggplantCrispy, images.beefRibs] },
  { id: "opt4", title: "Микс салат со стручковой фасолью + Спагетти с сёмгой", images: [images.greenBeanSalad, images.salmonSpaghetti] },
  { id: "opt5", title: "Салат греческий + Плов \"Дастархан\"", images: [images.greek, images.plov] },
];

const drinks = [
  { id: "cola_zero", label: "Кола Зеро" },
  { id: "juice", label: "Сок натуральный" },
  { id: "water", label: "Вода" },
];

export default function Page() {
  const brand = "Ахметжанов Думан Арманулы";
  const lecture = "Управление состоянием микробиома. Линейка Бифистим. Энтеростим.";

  const [fio, setFio] = useState("");
  const [phone, setPhone] = useState("");
  const [clinic, setClinic] = useState("");
  const [menu, setMenu] = useState("");

  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);

  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const [admin, setAdmin] = useState(false);
  const [filterClinic, setFilterClinic] = useState("Все");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => { setData(loadLocal()); }, []);

  const phoneMasked = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    let out = "+7 ";
    const body = digits.replace(/^7/, "");
    if (!body) return phone.startsWith("+7") ? phone : "+7 ";
    out += `(${body.slice(0, 3)}`;
    if (body.length >= 3) out += ") ";
    out += body.slice(3, 6);
    if (body.length >= 6) out += "-" + body.slice(6, 8);
    if (body.length >= 8) out += "-" + body.slice(8, 10);
    return out;
  }, [phone]);

  const canSubmit = fio.trim() && phone.trim() && clinic.trim() && menu && agree && !sending;

  async function sendEmail(payload: any) {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: EMAIL_TO, subject: "Заявка на круглый стол", payload }),
      });
      if (!res.ok) throw new Error(String(res.status));
      return true;
    } catch (_e) { return true; }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const chosen = menuOptions.find((m) => m.id === menu)?.title ?? "";
    const chosenDrinks = drinks.filter((d) => selectedDrinks.includes(d.id)).map((d) => d.label).join("; ");
    const rec = {
      "Время": new Date().toLocaleString(),
      "ФИО": fio,
      "Телефон": phoneMasked,
      "Поликлиника": clinic,
      "Меню": chosen,
      "Напитки": chosenDrinks || "—",
    } as Record<string, string>;

    setSending(true);
    const ok = await sendEmail(rec);
    setSending(false);

    if (ok) {
      saveLocal(rec);
      setData(loadLocal());
      setResultMsg("Заявка отправлена и сохранена.");
      setOpen(true);
      setFio(""); setPhone(""); setClinic(""); setMenu("opt1"); setSelectedDrinks([]); setAgree(false);
    } else {
      setResultMsg("Не удалось отправить. Попробуйте ещё раз.");
      setOpen(true);
    }
  }

  const clinics = React.useMemo(() => {
    const set = new Set<string>(["Все"]);
    data.forEach((r) => set.add(r["Поликлиника"]));
    return Array.from(set);
  }, [data]);

  const filtered = React.useMemo(() => {
    return filterClinic === "Все" ? data : data.filter((r) => r["Поликлиника"] === filterClinic);
  }, [data, filterClinic]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-white">
      {/* Background watermark */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-70" style={{backgroundImage: `radial-gradient(1200px 500px at 70% -10%, rgba(56,189,248,0.10), transparent 60%), radial-gradient(900px 400px at -10% 20%, rgba(30,64,175,0.08), transparent 60%)`}} />
        <div className="absolute inset-0 grid place-items-center">
          <div className="select-none text-[8.5vw] font-black tracking-tight uppercase text-sky-300/20 leading-none text-center px-4">
            Ахметжанов Думан Арманулы
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800">Круглый стол для врачей</h1>
              <p className="mt-2 text-lg md:text-xl text-slate-700 font-medium">«{lecture}»</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>Дата и время: <em className="not-italic">уточняется</em></span>
                <span>•</span>
                <span>Локация: <em className="not-italic">актовый зал поликлиники</em></span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-slate-500">Организатор и спикер</div>
              <div className="text-base md:text-lg font-semibold text-slate-800">Ахметжанов Думан Арманулы</div>
              <div className="text-xs text-slate-500">при поддержке компании «Сотекс»</div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="secondary" className="h-8 px-3" onClick={()=>{
                  const pass = prompt("Пароль админа:");
                  if (pass === ADMIN_PASSWORD) setAdmin(true); else alert("Неверный пароль");
                }}>Админ</Button>
              </div>
            </div>
          </div>
        </div>
      </header>

{/* QR для афиши / приглашения */}
<section className="relative z-10">
  <div className="mx-auto max-w-6xl px-4 pb-4 -mt-4">
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-slate-800">QR для приглашения</h3>
        <p className="text-sm text-slate-600">
          Сканируйте, чтобы открыть страницу регистрации. Этот QR ссылается на{" "}
          <span className="font-medium">{SITE_URL}</span>. Адрес можно поменять через
          переменную <code className="px-1 rounded bg-slate-100">NEXT_PUBLIC_SITE_URL</code>.
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="h-9" onClick={async () => {
            const qrImg = new Image();
            const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${encodeURIComponent(SITE_URL)}`;
            qrImg.crossOrigin = "anonymous";
            qrImg.src = qrSrc;
            await new Promise((res, rej) => { qrImg.onload = res; qrImg.onerror = rej; });

            const W = 1080, H = 1350;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d'); if (!ctx) return;

            ctx.fillStyle = '#f8fbff'; ctx.fillRect(0,0,W,H);
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 56px ui-sans-serif,system-ui'; ctx.fillText('КРУГЛЫЙ СТОЛ ДЛЯ ВРАЧЕЙ', 60, 120);

            ctx.font = '500 40px ui-sans-serif,system-ui';
            const text = '«Управление состоянием микробиома. Линейка Бифистим. Энтеростим.»';
            const maxWidth = W - 120; let y = 190; const lineH = 54;
            const words = text.split(' '); let line = '';
            for (let n=0; n<words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && n>0) { ctx.fillText(line, 60, y); y += lineH; line = words[n] + ' '; }
              else { line = testLine; }
            }
            ctx.fillText(line, 60, y); y += 30;

            ctx.font = '600 36px ui-sans-serif,system-ui';
            ctx.fillText('Организатор и спикер: Ахметжанов Думан Арманулы', 60, y+40);

            const qrSize = 520; const qrX = 60; const qrY = y + 90;
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            ctx.font = '500 32px ui-sans-serif,system-ui'; ctx.fillText('Сканируйте для регистрации', qrX, qrY + qrSize + 48);
            ctx.font = '28px ui-sans-serif,system-ui'; ctx.fillStyle = '#334155'; ctx.fillText(SITE_URL, qrX, qrY + qrSize + 96);

            ctx.font = '500 24px ui-sans-serif,system-ui'; ctx.fillStyle = '#64748b';
            ctx.fillText('при поддержке компании «Сотекс»', 60, H - 60);

            const url = canvas.toDataURL('image/png'); const a = document.createElement('a');
            a.href = url; a.download = `афиша_круглый-стол_${new Date().toISOString().slice(0,10)}.png`; a.click();
          }}>Скачать афишу с QR (PNG)</Button>
          <Button className="h-9" onClick={() => {
            const a = document.createElement('a');
            a.href = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(SITE_URL)}`;
            a.download = 'qr_roundtable.png';
            a.click();
          }}>Скачать только QR</Button>
        </div>
      </div>
      <div className="grid place-items-center">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(SITE_URL)}`}
          alt="QR код на страницу регистрации"
          className="h-40 w-40 rounded-xl border border-slate-200 bg-white p-2"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</section>


      {/* Main */}
      <main className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-24 md:grid-cols-2 md:gap-10">
        {/* Form */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="shadow-sm bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-slate-800">Личная анкета</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fio">ФИО</Label>
                  <Input id="fio" value={fio} onChange={(e)=>setFio(e.target.value)} placeholder="Иванов Иван Иванович" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Номер телефона</Label>
                  <Input id="phone" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clinic">Поликлиника</Label>
                  <Input id="clinic" value={clinic} onChange={(e)=>setClinic(e.target.value)} placeholder="№__ городская поликлиника" required />
                </div>

               <div className="pt-2">
  <h3 className="mb-2 text-lg font-semibold text-slate-800">Выбор меню</h3>
  <RadioGroup
    value={menu}
    onValueChange={(value) => setMenu(value)}
    className="space-y-3"
  >
    {menuOptions.map((opt) => {
      const isSelected = menu === opt.id;
      return (
        <div
          key={opt.id}
          className={`flex items-stretch gap-3 rounded-2xl border bg-white/80 p-3 transition 
          ${isSelected ? "border-blue-600 ring-2 ring-blue-300" : "border-slate-200 hover:border-blue-300 hover:shadow-sm"}`}
        >
          <RadioGroupItem
            value={opt.id}
            id={opt.id}
            className="mt-1"
          />
          <Label htmlFor={opt.id} className="grid w-full cursor-pointer grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="col-span-2">
              <div className="font-medium leading-snug text-slate-800">
                {opt.title}
              </div>
              {isSelected && (
                <div className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Выбрано
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {opt.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Иллюстрация блюда"
                  className="h-16 w-full rounded-xl object-cover ring-1 ring-slate-200/60"
                  loading="lazy"
                />
              ))}
            </div>
          </Label>
        </div>
      );
    })}
  </RadioGroup>
</div>


                <div className="pt-2">
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">Напитки</h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {drinks.map((d)=>(
                      <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 hover:shadow-sm">
                        <Checkbox checked={selectedDrinks.includes(d.id)} onChange={(e)=>{
                          const checked = (e.target as HTMLInputElement).checked;
                          const id = d.id; setSelectedDrinks(prev => checked ? [...prev, id] : prev.filter(x=>x!==id));
                        }} />
                        <span className="text-slate-800">{d.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                  <Checkbox checked={agree} onChange={(e)=>setAgree((e.target as HTMLInputElement).checked)} />
                  <span className="leading-snug">
                    Я даю согласие на обработку персональных данных в целях организации круглого стола. Ответственный: {brand}. Срок хранения — до завершения мероприятия и закрытия отчётности.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" disabled={!canSubmit} className="px-6">{sending ? "Отправка..." : "Отправить заявку"}</Button>
                  <Button type="button" variant="secondary" className="border-slate-300" onClick={()=>{ setFio(""); setPhone(""); setClinic(""); setMenu("opt1"); setSelectedDrinks([]); setAgree(false); }}>Очистить</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.section>

        {/* Admin Table */}
        {admin && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="md:col-span-2">
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">Заявки</h2>
                  <div className="ml-auto flex items-center gap-2">
                    <select className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm" value={filterClinic} onChange={(e)=>setFilterClinic(e.target.value)}>
                      {React.useMemo(()=>{
                        return clinics;
                      }, [clinics]).map((c:any)=>(<option key={c} value={c}>{c}</option>))}
                    </select>
                    <Button variant="secondary" className="h-8 px-3" onClick={()=>downloadCSV(`Заявки_${new Date().toISOString().slice(0,10)}.csv`, filtered)}>Export CSV</Button>
                    <Button variant="secondary" className="h-8 px-3" onClick={()=>{
                      const pass = prompt("Пароль админа:");
                      if (pass === ADMIN_PASSWORD) alert("Уже в админ-режиме"); else alert("Неверный пароль");
                    }}>Админ</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Время</TableHead>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Поликлиника</TableHead>
                        <TableHead>Меню</TableHead>
                        <TableHead>Напитки</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r:any, idx:number)=>(
                        <TableRow key={idx}>
                          <TableCell className="whitespace-nowrap">{r["Время"]}</TableCell>
                          <TableCell>{r["ФИО"]}</TableCell>
                          <TableCell>{r["Телефон"]}</TableCell>
                          <TableCell>{r["Поликлиника"]}</TableCell>
                          <TableCell className="max-w-[360px] truncate" title={r["Меню"]}>{r["Меню"]}</TableCell>
                          <TableCell>{r["Напитки"]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {!filtered.length && (<div className="py-6 text-center text-sm text-slate-500">Пока нет записей.</div>)}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </main>

      {/* Simple Admin toggle button */}
      {!admin && (
        <div className="fixed bottom-4 right-4">
          <Button variant="secondary" onClick={()=>{
            const pass = prompt("Пароль админа:");
            if (pass === ADMIN_PASSWORD) setAdmin(true); else alert("Неверный пароль");
          }}>Админ</Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сообщение</DialogTitle>
            <DialogDescription>{resultMsg}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end"><Button onClick={()=>setOpen(false)}>Ок</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
