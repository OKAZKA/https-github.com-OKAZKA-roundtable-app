import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, subject, payload } = await req.json();

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || user;

    if (!host || !user || !pass || !from) {
      console.log("SMTP is not configured. Logging payload instead:", { to, subject, payload });
      return NextResponse.json({ ok: true, mode: "log" });
    }

    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    const html = `<h2>${subject}</h2>
      <p><b>Время:</b> ${payload["Время"]}</p>
      <p><b>ФИО:</b> ${payload["ФИО"]}</p>
      <p><b>Телефон:</b> ${payload["Телефон"]}</p>
      <p><b>Поликлиника:</b> ${payload["Поликлиника"]}</p>
      <p><b>Меню:</b> ${payload["Меню"]}</p>
      <p><b>Напитки:</b> ${payload["Напитки"]}</p>`;

    await transporter.sendMail({ from, to, subject, html });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
