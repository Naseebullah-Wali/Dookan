SMTP Setup & Quick Test
======================

1) Configure `.env.local`

- Open `backend-afghan-grocery/.env.local` and set your SMTP provider credentials.
- Example (Mailtrap):

  SMTP_HOST=smtp.mailtrap.io
  SMTP_PORT=2525
  SMTP_USER=<your-mailtrap-user>
  SMTP_PASS=<your-mailtrap-pass>
  SMTP_SECURE=false

- Ensure `SUPPORT_EMAIL` is the destination inbox (example: dreamteam.remote@gmail.com).

2) Restart the backend

Run from `backend-afghan-grocery`:

```powershell
npm run dev
```

or if you start with `node`/`ts-node` per your project scripts, use the project's usual start command.

3) Test by sending a contact request

Use `curl` (replace host/port if your backend listens elsewhere):

```bash
curl -X POST http://localhost:3000/api/v1/support/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"tester@example.com","message":"Hello from test","recaptchaToken":""}'
```

- If SMTP is configured correctly you'll either receive the email at `SUPPORT_EMAIL` or see Mailtrap capture it.
- Check backend logs for errors (auth failure, connection issues).

4) Using Mailtrap

- Create a Mailtrap account and get the SMTP credentials from the inbox settings.
- Use the Mailtrap `SMTP_USER`/`SMTP_PASS` in `.env.local` and run the test above.

5) Troubleshooting

- If you see authentication errors, verify `SMTP_USER`/`SMTP_PASS` and `SMTP_HOST`/`SMTP_PORT`.
- If using TLS/SSL set `SMTP_SECURE=true` and the proper port (usually 465).
- If the backend fails to start due to Node engine warnings, consider upgrading Node to >=18.
