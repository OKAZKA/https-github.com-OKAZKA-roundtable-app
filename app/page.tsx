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

const EMAIL_TO = process.env.NEXT_PUBLIC_EMAIL_TO || "your-email@example.com";
const ADMIN_PASSWORD = "doctor";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com/roundtable";

function downloadCSV(filename: string, rows: Record<string, string>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(rows.map((r) =>
      headers.map((h) => '"' + String(r[h] ?? '').replace(/"/g, '""') + '"').join(",")
    ))
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
  try {
    return JSON.parse(localStorage.getItem("registrations") || "[]");
  } catch {
    return [];
  }
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
  { id: "opt1", title: "Микс салат… + Бифстроганов", images: [images.mixSaladBeetPumpkin, images.beefStroganoff] },
  { id: "opt2", title: "Цезарь + Куырдак", images: [images.caesar, images.kuyrdak] },
  { id: "opt3", title: "Хрустящие баклажаны + Говяжье ребро", images: [images.eggplantCrispy, images.beefRibs] },
  { id: "opt4", title: "Микс салат со стручковой фасолью + Спагетти с сёмгой", images: [images.greenBeanSalad, images.salmonSpaghetti] },
  { id: "opt5", title: "Греческий салат + Плов", images: [images.greek, images.plov] },
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

  const canSubmit =
    fio.trim() && phone.trim() && clinic.trim() && menu && agree && !sending;

  async function sendEmail(payload: any) {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: EMAIL_TO,
          subject: "Заявка на круглый стол",
          payload,
        }),
      });

      if (!res.ok) throw new Error(String(res.status));
      return true;
    } catch (_e) {
      return true;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const chosen = menuOptions.find((m) => m.id === menu)?.title ?? "";
    const chosenDrinks = drinks
      .filter((d) => selectedDrinks.includes(d.id))
      .map((d) => d.label)
      .join("; ");

    const rec = {
      "Время": new Date().toLocaleString(),
      "ФИО": fio,
      "Телефон": phoneMasked,
      "Поликлиника": clinic,
      "Меню": chosen,
      "Напитки": chosenDrinks || "—",
    };

    setSending(true);
    const ok = await sendEmail(rec);
    setSending(false);

    if (ok) {
      saveLocal(rec);
      setData(loadLocal());
      setResultMsg("Заявка отправлена и сохранена.");
      setOpen(true);
      setFio("");
      setPhone("");
      setClinic("");
      setMenu("");
      setSelectedDrinks([]);
      setAgree(false);
    } else {
      setResultMsg("Ошибка отправки.");
      setOpen(true);
    }
  }

  const clinics = useMemo(() => {
    const set = new Set<string>(["Все"]);
    data.forEach((r) => set.add(r["Поликлиника"]));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    return filterClinic === "Все"
      ? data
      : data.filter((r) => r["Поликлиника"] === filterClinic);
  }, [data, filterClinic]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-white">

      {/* HEADER */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-extrabold">Круглый стол для врачей</h1>
          <p className="mt-2 text-lg md:text-xl">{lecture}</p>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8 px-4 pb-24">

        {/* FORM */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">

              <form onSubmit={onSubmit} className="space-y-4">

                {/* FIO */}
                <div>
                  <Label>ФИО</Label>
                  <Input value={fio} onChange={(e) => setFio(e.target.value)} required />
                </div>

                {/* PHONE */}
                <div>
                  <Label>Телефон</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                {/* POLICLINIC */}
                <div>
                  <Label>Поликлиника</Label>
                  <Input value={clinic} onChange={(e) => setClinic(e.target.value)} required />
                </div>

                {/* MENU */}
                <div className="pt-2">
                  <h3 className="font-semibold text-lg">Выбор меню</h3>

                  <RadioGroup value={menu} onValueChange={(value) => setMenu(value)}>

                    {menuOptions.map((opt) => {
                      const selected = menu === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`flex gap-3 p-3 rounded-2xl border bg-white
                          ${selected ? "border-blue-600 ring-2 ring-blue-300" : "border-slate-300"}
                        `}
                        >
                          <RadioGroupItem value={opt.id} id={opt.id} />

                          <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{opt.title}</div>
                          </Label>
                        </div>
                      );
                    })}

                  </RadioGroup>
                </div>

                {/* DRINKS */}
                <div className="pt-2">
                  <h3 className="font-semibold text-lg">Напитки</h3>

                  <div className="grid sm:grid-cols-3 gap-2">

                    {drinks.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer">

                        <Checkbox
                          checked={selectedDrinks.includes(d.id)}
                          onCheckedChange={(checked) => {
                            const isChecked = !!checked;
                            setSelectedDrinks((prev) =>
                              isChecked
                                ? [...prev, d.id]
                                : prev.filter((x) => x !== d.id)
                            );
                          }}
                        />

                        <span>{d.label}</span>
                      </label>
                    ))}

                  </div>
                </div>

                {/* PERSONAL DATA AGREEMENT */}
                <label className="flex gap-2 text-sm">
                  <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
                  Я даю согласие на обработку данных…
                </label>

                {/* BUTTONS */}
                <div className="pt-4 flex gap-3">
                  <Button disabled={!canSubmit} type="submit">
                    {sending ? "Отправка..." : "Отправить заявку"}
                  </Button>

                  <Button variant="secondary" type="button" onClick={() => {
                    setFio(""); setPhone(""); setClinic(""); setMenu(""); setSelectedDrinks([]); setAgree(false);
                  }}>
                    Очистить
                  </Button>
                </div>

              </form>

            </CardContent>
          </Card>
        </motion.section>

        {/* ADMIN TABLE */}
        {admin && (
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Заявки</h2>
            <div className="overflow-auto">

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Поликлиника</TableHead>
                    <TableHead>Меню</TableHead>
                    <TableHead>Напитки</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r["Время"]}</TableCell>
                      <TableCell>{r["ФИО"]}</TableCell>
                      <TableCell>{r["Телефон"]}</TableCell>
                      <TableCell>{r["Поликлиника"]}</TableCell>
                      <TableCell>{r["Меню"]}</TableCell>
                      <TableCell>{r["Напитки"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </div>
          </Card>
        )}

      </main>

      {/* ADMIN BUTTON */}
      {!admin && (
        <div className="fixed bottom-4 right-4">
          <Button
            variant="secondary"
            onClick={() => {
              const pass = prompt("Пароль админа:");
              if (pass === ADMIN_PASSWORD) setAdmin(true);
              else alert("Неверный пароль");
            }}
          >
            Админ
          </Button>
        </div>
      )}

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сообщение</DialogTitle>
            <DialogDescription>{resultMsg}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setOpen(false)}>Ок</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
