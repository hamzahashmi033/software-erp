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

export function buildInvoiceEmail(params: {
  clientName: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  payUrl: string;
  fromName: string;
}) {
  const { clientName, totalAmount, currency, payUrl, fromName } = params;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmount / 100);

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:40px 0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#0f172a;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">${fromName}</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#111827;margin-top:0;">Hi ${clientName},</h2>
      <p style="color:#4b5563;line-height:1.6;">
        You have a new invoice for <strong>${amount}</strong>. Please click the button below to view and pay.
      </p>
      <div style="text-align:center;margin:36px 0;">
        <a href="${payUrl}" style="background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;display:inline-block;">
          View & Pay Invoice
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;text-align:center;">
        Or copy this link: ${payUrl}
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        ${fromName} · Secure Invoice
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function buildPaymentNotificationEmail(params: {
  clientName: string;
  clientEmail: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  paidAt: Date;
}) {
  const { clientName, clientEmail, invoiceId, totalAmount, currency, paidAt } =
    params;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmount / 100);

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:40px 0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#16a34a;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">Payment Received ✓</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#111827;margin-top:0;">Invoice Paid</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="color:#6b7280;padding:6px 0;">Client</td><td style="color:#111827;font-weight:600;">${clientName}</td></tr>
        <tr><td style="color:#6b7280;padding:6px 0;">Email</td><td style="color:#111827;">${clientEmail}</td></tr>
        <tr><td style="color:#6b7280;padding:6px 0;">Invoice ID</td><td style="color:#111827;font-family:monospace;">${invoiceId}</td></tr>
        <tr><td style="color:#6b7280;padding:6px 0;">Amount</td><td style="color:#16a34a;font-weight:700;font-size:18px;">${amount}</td></tr>
        <tr><td style="color:#6b7280;padding:6px 0;">Paid at</td><td style="color:#111827;">${paidAt.toUTCString()}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>
  `.trim();
}
