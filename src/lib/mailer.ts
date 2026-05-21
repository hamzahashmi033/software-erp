import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: MailOptions) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmt(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

function shell(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F5F3FC;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F3FC;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(64,39,193,0.10);">
        ${content}
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function header(title: string, subtitle?: string) {
  return `
<tr>
  <td style="background:linear-gradient(135deg,#2D1879 0%,#4027C1 100%);padding:36px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#DCC9F7;">${subtitle ?? ""}</p>
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</h1>
  </td>
</tr>`;
}

function divider() {
  return `<tr><td style="padding:0 40px;"><div style="height:1px;background:#EDE9FB;"></div></td></tr>`;
}

function footer(fromName: string, note?: string) {
  return `
${divider()}
<tr>
  <td style="padding:24px 40px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">${note ?? `Sent by ${fromName}`} &nbsp;·&nbsp; <span style="color:#DCC9F7;">&#9679;</span> &nbsp;Secure &amp; Encrypted</p>
  </td>
</tr>`;
}

function infoRow(label: string, value: string, valueStyle = "") {
  return `
<tr>
  <td style="padding:8px 0;font-size:13px;color:#6b7280;width:110px;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;font-size:13px;color:#111827;font-weight:500;${valueStyle}">${value}</td>
</tr>`;
}

// ── Client invoice email ──────────────────────────────────────────────────────

export function buildInvoiceEmail(params: {
  clientName: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  payUrl: string;
  fromName: string;
}) {
  const { clientName, totalAmount, currency, payUrl, fromName } = params;
  const amount = fmt(totalAmount, currency);

  return shell(`
    ${header(`You have a new invoice`, fromName)}
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Hi ${clientName},</p>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
          A new invoice has been created for you. Please review the details and complete your payment at your earliest convenience.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 40px;">
        <div style="background:#F5F3FC;border-radius:10px;padding:24px;border:1px solid #EDE9FB;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#4027C1;">Amount Due</p>
          <p style="margin:0;font-size:36px;font-weight:800;color:#2D1879;line-height:1.1;">${amount}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 40px;text-align:center;">
        <a href="${payUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#2D1879,#4027C1);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
          View &amp; Pay Invoice →
        </a>
        <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
          Or copy this link:<br />
          <a href="${payUrl}" style="color:#4027C1;word-break:break-all;">${payUrl}</a>
        </p>
      </td>
    </tr>
    ${footer(fromName)}
  `);
}

// ── Admin: invoice created notification ──────────────────────────────────────

export function buildInvoiceCreatedEmail(params: {
  clientName: string;
  clientEmail: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  stripeHostedUrl: string | null;
  createdAt: Date;
  fromName: string;
}) {
  const { clientName, clientEmail, invoiceId, totalAmount, currency, stripeHostedUrl, createdAt, fromName } = params;
  const amount = fmt(totalAmount, currency);
  const date = createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return shell(`
    ${header("New Invoice Created", fromName)}
    <tr>
      <td style="padding:32px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${infoRow("Client", clientName)}
          ${infoRow("Email", `<a href="mailto:${clientEmail}" style="color:#4027C1;">${clientEmail}</a>`)}
          ${infoRow("Invoice ID", `<span style="font-family:monospace;font-size:12px;color:#6b7280;">${invoiceId}</span>`)}
          ${infoRow("Amount", `<span style="font-size:22px;font-weight:800;color:#2D1879;">${amount}</span>`)}
          ${infoRow("Created", date)}
        </table>
      </td>
    </tr>
    ${stripeHostedUrl ? `
    <tr>
      <td style="padding:24px 40px 40px;text-align:center;">
        <a href="${stripeHostedUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#2D1879,#4027C1);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          View Stripe Invoice →
        </a>
      </td>
    </tr>` : `<tr><td style="padding:0 0 24px;"></td></tr>`}
    ${footer(fromName, `Internal notification · ${fromName}`)}
  `);
}

// ── Client: payment success thank-you ────────────────────────────────────────

export function buildPaymentSuccessClientEmail(params: {
  clientName: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  paidAt: Date;
  fromName: string;
}) {
  const { clientName, invoiceId, totalAmount, currency, paidAt, fromName } = params;
  const amount = fmt(totalAmount, currency);
  const date = paidAt.toLocaleDateString("en-US", { dateStyle: "long" });

  return shell(`
    <tr>
      <td style="background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);padding:40px 40px 32px;text-align:center;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px;">
          <tr>
            <td width="64" height="64" align="center" valign="middle"
                style="width:64px;height:64px;line-height:64px;border-radius:32px;background:rgba(255,255,255,0.22);text-align:center;font-size:30px;color:#ffffff;font-weight:700;">
              ✓
            </td>
          </tr>
        </table>
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#bbf7d0;">${fromName}</p>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">Payment Confirmed!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 40px 0;">
        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
          Hi <strong>${clientName}</strong>, thank you so much for your payment. Your transaction has been processed successfully and everything is sorted on our end.
        </p>
        <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;border:1px solid #bbf7d0;text-align:center;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#16a34a;">Amount Paid</p>
          <p style="margin:0;font-size:38px;font-weight:800;color:#14532d;line-height:1.1;">${amount}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">${date}</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${infoRow("Invoice ID", `<span style="font-family:monospace;font-size:12px;color:#6b7280;">${invoiceId}</span>`)}
        </table>
        <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
          You will receive a payment receipt from Stripe shortly. If you have any questions, feel free to reach out to us at any time.
        </p>
      </td>
    </tr>
    <tr><td style="padding:32px 0 0;"></td></tr>
    ${footer(fromName, `Thank you for choosing ${fromName}`)}
  `);
}

// ── Client: payment failed retry nudge ───────────────────────────────────────

export function buildPaymentFailedClientEmail(params: {
  clientName: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  payUrl: string;
  fromName: string;
}) {
  const { clientName, invoiceId, totalAmount, currency, payUrl, fromName } = params;
  const amount = fmt(totalAmount, currency);

  return shell(`
    <tr>
      <td style="background:linear-gradient(135deg,#2D1879 0%,#4027C1 100%);padding:40px 40px 32px;text-align:center;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px;">
          <tr>
            <td width="64" height="64" align="center" valign="middle"
                style="width:64px;height:64px;line-height:64px;border-radius:32px;background:rgba(255,255,255,0.18);text-align:center;font-size:28px;color:#ffffff;font-weight:700;">
              ✕
            </td>
          </tr>
        </table>
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#DCC9F7;">${fromName}</p>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">Payment Unsuccessful</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 40px 0;">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
          Hi <strong>${clientName}</strong>, no worries at all — this can happen for a number of reasons such as an expired card, a temporary bank hold, or insufficient funds.
        </p>
        <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">
          Your invoice is still open and ready whenever you are. Simply click the button below to review the details and complete your payment at your convenience.
        </p>
        <div style="background:#F5F3FC;border-radius:10px;padding:20px 24px;border:1px solid #EDE9FB;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#4027C1;">Amount Due</p>
          <p style="margin:0;font-size:36px;font-weight:800;color:#2D1879;line-height:1.1;">${amount}</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${infoRow("Invoice ID", `<span style="font-family:monospace;font-size:12px;color:#6b7280;">${invoiceId}</span>`)}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 40px 40px;text-align:center;">
        <a href="${payUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#2D1879,#4027C1);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
          Try Payment Again →
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
          Or copy this link:<br />
          <a href="${payUrl}" style="color:#4027C1;word-break:break-all;">${payUrl}</a>
        </p>
      </td>
    </tr>
    ${footer(fromName, `Sent by ${fromName} · We're here to help`)}
  `);
}

// ── Admin: payment received notification ─────────────────────────────────────

export function buildPaymentNotificationEmail(params: {
  clientName: string;
  clientEmail: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  paidAt: Date;
}) {
  const { clientName, clientEmail, invoiceId, totalAmount, currency, paidAt } = params;
  const amount = fmt(totalAmount, currency);
  const date = paidAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const fromName = process.env.FROM_NAME ?? "Payment";

  return shell(`
    <tr>
      <td style="background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);padding:36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">✓</p>
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Payment Received</h1>
        <p style="margin:8px 0 0;font-size:13px;color:#bbf7d0;">${fromName}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 0;">
        <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;border:1px solid #bbf7d0;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#16a34a;">Amount Paid</p>
          <p style="margin:0;font-size:36px;font-weight:800;color:#14532d;line-height:1.1;">${amount}</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${infoRow("Client", clientName)}
          ${infoRow("Email", clientEmail)}
          ${infoRow("Invoice ID", `<span style="font-family:monospace;font-size:12px;color:#6b7280;">${invoiceId}</span>`)}
          ${infoRow("Paid at", date)}
        </table>
      </td>
    </tr>
    <tr><td style="padding:32px 0 0;"></td></tr>
    ${footer(fromName, `Internal notification · ${fromName}`)}
  `);
}
