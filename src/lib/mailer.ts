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

interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}

export async function sendMail({ to, subject, html, text, attachments }: MailOptions) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
    attachments,
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmt(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

function emailRow(label: string, value: string) {
  return `
<tr style="border-bottom:1px solid #f3f4f6;">
  <td style="padding:10px 16px 10px 0;font-size:13px;font-weight:600;color:#374151;width:160px;vertical-align:top;">${label}</td>
  <td style="padding:10px 0;font-size:13px;color:#1f2937;vertical-align:top;">${value}</td>
</tr>`;
}

function invoiceEmailShell(body: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const logoUrl = `${appUrl}/logo-v2-1.png`;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "info@leendesignstudios.com";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#ffffff;padding:28px 32px 20px;text-align:center;border-bottom:3px solid #4027C1;">
            <img src="${logoUrl}" alt="Leen Design Studios" height="60" style="height:60px;width:auto;display:block;margin:0 auto;" />
            <p style="margin:12px 0 0;font-size:13px;font-weight:600;color:#4027C1;letter-spacing:0.2px;">Invoice Ready for Payment &mdash; Leen Design Studios</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
              Need assistance? Reach out to us at
              <a href="mailto:${supportEmail}" style="font-weight:600;color:#374151;text-decoration:none;">${supportEmail}</a>
            </p>
            <p style="margin:0 0 4px;font-size:12px;">
              <a href="https://leendesignstudio.com/terms-conditions/" style="font-weight:600;color:#374151;text-decoration:none;">Terms &amp; Conditions</a>
            </p>
            <p style="margin:0;font-size:12px;color:#d1d5db;">
              &copy; ${year} <strong style="color:#9ca3af;">Leen Design Studios</strong>. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
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
  clientEmail: string;
  clientContact?: string | null;
  invoiceId: string;
  packageName?: string | null;
  descriptionHtml: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  payUrl: string;
  fromName: string;
  agentName?: string;
  agentEmail?: string;
  hasAgreement?: boolean;
}) {
  const { clientName, clientEmail, clientContact, invoiceId, packageName, descriptionHtml, totalAmount, currency, createdAt, payUrl, agentName, agentEmail, hasAgreement } = params;
  const amount = fmt(totalAmount, currency);
  const date = createdAt.toLocaleDateString("en-US", { dateStyle: "long" });
  const invoiceNum = `#${invoiceId.slice(-8).toUpperCase()}`;

  return invoiceEmailShell(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#4027C1;">Invoice Ready for Payment &mdash; Leen Design Studios!</h1>

    <p style="margin:0 0 4px;font-size:14px;color:#1f2937;">Dear <strong>${clientName}</strong>,</p>
    <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
      Thank you for choosing <strong>Leen Design Studios</strong>. Here&rsquo;s a summary of your invoice details. Please review the information below and proceed with the payment.
    </p>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#4027C1;">Invoice Summary</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #f3f4f6;margin-bottom:32px;">
      ${emailRow("Customer Name:", clientName)}
      ${emailRow("Customer Email:", clientEmail)}
      ${clientContact ? emailRow("Customer Contact:", clientContact) : ""}
      ${emailRow("Invoice Number:", invoiceNum)}
      ${emailRow("Invoice Date:", date)}
      ${emailRow("Total Amount:", `<strong>${amount}</strong>`)}
    </table>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#4027C1;">Package Details</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #f3f4f6;margin-bottom:32px;">
      ${packageName ? emailRow("Package Name:", packageName) : ""}
      ${emailRow("Package Description:", descriptionHtml)}
    </table>

    ${hasAgreement ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F5F3FC;border:1px solid #EDE9FB;border-radius:8px;padding:12px 16px;">
          <p style="margin:0;font-size:13px;color:#4027C1;font-weight:500;">A Services Agreement PDF has been attached to this email.</p>
        </td>
      </tr>
    </table>` : ""}

    ${agentName ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F5F3FC;border:1px solid #EDE9FB;border-radius:8px;padding:12px 16px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4027C1;">Agent</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">${agentName}</p>
          ${agentEmail ? `<a href="mailto:${agentEmail}" style="font-size:12px;color:#4027C1;text-decoration:none;">${agentEmail}</a>` : ""}
        </td>
      </tr>
    </table>` : ""}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-top:8px;">
          <a href="${payUrl}" style="display:inline-block;background:#4027C1;color:#ffffff;text-decoration:none;padding:12px 40px;border-radius:8px;font-size:14px;font-weight:700;">Pay Invoice</a>
        </td>
      </tr>
    </table>
  `);
}

// ── Admin: invoice created notification ──────────────────────────────────────

export function buildInvoiceCreatedEmail(params: {
  clientName: string;
  clientEmail: string;
  clientContact?: string | null;
  invoiceId: string;
  packageName?: string | null;
  descriptionHtml: string;
  totalAmount: number;
  currency: string;
  stripeHostedUrl: string | null;
  createdAt: Date;
  fromName: string;
  agentName?: string;
  agentEmail?: string;
  hasAgreement?: boolean;
}) {
  const { clientName, clientEmail, clientContact, invoiceId, packageName, descriptionHtml, totalAmount, currency, stripeHostedUrl, createdAt, agentName, agentEmail, hasAgreement } = params;
  const amount = fmt(totalAmount, currency);
  const date = createdAt.toLocaleDateString("en-US", { dateStyle: "long" });
  const invoiceNum = `#${invoiceId.slice(-8).toUpperCase()}`;

  return invoiceEmailShell(`
    <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#4027C1;">New Invoice Created</h1>

    <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
      A new invoice has been generated for a client. Here&rsquo;s a summary of the details.
    </p>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#4027C1;">Invoice Summary</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #f3f4f6;margin-bottom:32px;">
      ${emailRow("Customer Name:", clientName)}
      ${emailRow("Customer Email:", `<a href="mailto:${clientEmail}" style="color:#4027C1;text-decoration:none;">${clientEmail}</a>`)}
      ${clientContact ? emailRow("Customer Contact:", clientContact) : ""}
      ${emailRow("Invoice Number:", invoiceNum)}
      ${emailRow("Invoice Date:", date)}
      ${emailRow("Total Amount:", `<strong>${amount}</strong>`)}
    </table>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#4027C1;">Package Details</h2>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #f3f4f6;margin-bottom:32px;">
      ${packageName ? emailRow("Package Name:", packageName) : ""}
      ${emailRow("Package Description:", descriptionHtml)}
    </table>

    ${hasAgreement ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F5F3FC;border:1px solid #EDE9FB;border-radius:8px;padding:12px 16px;">
          <p style="margin:0;font-size:13px;color:#4027C1;font-weight:500;">A Services Agreement PDF was attached to the client email.</p>
        </td>
      </tr>
    </table>` : ""}

    ${agentName ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F5F3FC;border:1px solid #EDE9FB;border-radius:8px;padding:12px 16px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4027C1;">Agent</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">${agentName}</p>
          ${agentEmail ? `<a href="mailto:${agentEmail}" style="font-size:12px;color:#4027C1;text-decoration:none;">${agentEmail}</a>` : ""}
        </td>
      </tr>
    </table>` : ""}

    ${stripeHostedUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-top:8px;">
          <a href="${stripeHostedUrl}" style="display:inline-block;background:#4027C1;color:#ffffff;text-decoration:none;padding:12px 40px;border-radius:8px;font-size:14px;font-weight:700;">View Stripe Invoice</a>
        </td>
      </tr>
    </table>` : ""}
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
