/**
 * Shared email shell — every outgoing email from yo@businessdawg.com uses
 * emailShell() so branding, voice, and layout are always consistent.
 * Light background with lime + ink accents (safe across Gmail, Apple Mail,
 * Outlook). No images — pure inline-CSS HTML so nothing can be blocked.
 */

const SITE_URL = process.env.BOOKING_BASE_URL || 'https://businessdawg.com';
const INSTAGRAM = 'https://instagram.com/tahrimzaman';
const LINKEDIN = 'https://linkedin.com/in/tahrimzaman';

export type EmailTone = 'success' | 'info' | 'warning' | 'cancel';

type ShellOptions = {
  label: string;
  tone: EmailTone;
  headline: string;
  body: string;
};

const TONE_LABEL_COLOR: Record<EmailTone, string> = {
  success: '#5b6500',
  info: '#555555',
  warning: '#b45309',
  cancel: '#a02020',
};

export function emailShell({ label, tone, headline, body }: ShellOptions): string {
  const labelColor = TONE_LABEL_COLOR[tone];
  const headlineColor = tone === 'cancel' ? '#a02020' : '#0A0A0A';
  const siteDisplay = SITE_URL.replace(/^https?:\/\//, '');
  const logoUrl = `${SITE_URL}/brand/logo-horizontal.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<title>${label}</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="background:#f2f2f2">
  <tr>
    <td align="center" style="padding:40px 16px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="max-width:560px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-radius:16px;overflow:hidden">

        <!-- Dark hero band -->
        <tr>
          <td style="background:#0A0A0A;padding:36px 40px;text-align:left">
            <a href="${SITE_URL}" style="text-decoration:none;display:inline-block">
              <img src="${logoUrl}"
                   alt="BusinessDawg"
                   width="200"
                   height="52"
                   style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;width:200px;height:auto"/>
            </a>
          </td>
        </tr>

        <!-- Lime accent stripe -->
        <tr>
          <td style="background:#C8FF00;height:3px;line-height:3px;font-size:0">&nbsp;</td>
        </tr>

        <!-- White card -->
        <tr>
          <td style="background:#ffffff;padding:40px">

            <!-- Label chip -->
            <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${labelColor};line-height:1">
              ${label}
            </p>

            <!-- Headline -->
            <h1 style="margin:0 0 28px;font-size:30px;font-weight:800;font-style:italic;line-height:1.1;color:${headlineColor};letter-spacing:-0.5px">
              ${headline}
            </h1>

            <!-- Body content (caller-supplied) -->
            ${body}

            <!-- Footer divider -->
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin:36px 0 0">
              <tr><td style="border-top:1px solid #E5E5E5;font-size:0;line-height:0">&nbsp;</td></tr>
            </table>

            <!-- Footer -->
            <p style="margin:18px 0 0;font-size:13px;color:#999;line-height:1.7">
              — BusinessDawg<br/>
              <a href="${SITE_URL}" style="color:#5b6500;text-decoration:none;font-weight:600">${siteDisplay}</a>
              &nbsp;&middot;&nbsp;
              <a href="${INSTAGRAM}" style="color:#5b6500;text-decoration:none;font-weight:600">Instagram</a>
              &nbsp;&middot;&nbsp;
              <a href="${LINKEDIN}" style="color:#5b6500;text-decoration:none;font-weight:600">LinkedIn</a>
            </p>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Lime-tinted info card used inside body sections. */
export function infoCard(content: string): string {
  return `<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin:0 0 20px">
  <tr>
    <td style="background:#F4FFB8;border-radius:12px;padding:16px 18px">
      ${content}
    </td>
  </tr>
</table>`;
}

/** Neutral grey card for long-form text like intent. */
export function greyCard(content: string): string {
  return `<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin:0 0 20px">
  <tr>
    <td style="background:#f5f5f5;border-radius:12px;padding:16px 18px;white-space:pre-wrap;font-size:14px;color:#0A0A0A;line-height:1.6">
      ${content}
    </td>
  </tr>
</table>`;
}

/** Lime pill CTA button — returns a table-wrapped anchor safe for all email clients. */
export function ctaButton(text: string, href: string): string {
  return `<table cellspacing="0" cellpadding="0" role="presentation" style="margin:20px 0">
  <tr>
    <td style="border-radius:999px;background:#C8FF00">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#0A0A0A;text-decoration:none;letter-spacing:0.2px">${text}</a>
    </td>
  </tr>
</table>`;
}

/** Label + value row for the data tables inside admin emails. */
export function fieldRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:6px 0;vertical-align:top;width:130px;font-size:13px;color:#888;white-space:nowrap">${label}</td>
  <td style="padding:6px 0;vertical-align:top;font-size:14px;color:#0A0A0A">${value}</td>
</tr>`;
}
