# Круглый стол — сайт регистрации (готовый проект)

## Быстрый старт (Windows)
1. Установите **Node.js LTS**: https://nodejs.org/
2. Распакуйте архив и откройте папку `roundtable-app` в **VS Code**.
3. Откройте терминал и выполните:
   ```bash
   npm install
   npm run dev
   ```
   Сайт будет доступен на http://localhost:3000

## Отправка писем
1. Скопируйте `.env.example` → `.env` и заполните SMTP-поля (Mail.ru / Gmail / SendGrid).
2. Добавьте `NEXT_PUBLIC_EMAIL_TO=ВАШ_EMAIL` (или поменяйте адрес в коде).
3. Перезапустите `npm run dev`.

## Публикация на Vercel
- Создайте новый проект и добавьте переменные из `.env` в разделе **Environment Variables**.
- После деплоя форма начнёт отправлять заявки на e‑mail.
