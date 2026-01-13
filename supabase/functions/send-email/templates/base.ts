// ================================================
// Base Email Template with Pulau Branding
// Story: 30.2 - Build Email Template System
// AC #1: Branded Email Templates
// ================================================

/**
 * Base email template with Pulau branding
 * - Deep teal primary color (#0D7377)
 * - Warm coral accent (#FF6B6B)
 * - Responsive design for mobile and desktop
 * - Email-safe inline CSS
 */
export function wrapInBaseTemplate(content: string, subject: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles for consistent rendering */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
    }

    /* Links */
    a {
      color: #0D7377;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Responsive adjustments */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 !important; }
      .content { padding: 24px 16px !important; }
      .card { padding: 16px !important; margin: 12px 0 !important; }
      .header { padding: 20px 16px !important; }
      .footer { padding: 20px 16px !important; }
      .button { display: block !important; width: 100% !important; text-align: center !important; }
      .mobile-full-width { width: 100% !important; display: block !important; }
      .mobile-hidden { display: none !important; }
      h1 { font-size: 24px !important; }
      .experience-image { height: 150px !important; }
    }

    /* Dark mode support for Apple Mail, iOS, Outlook */
    @media (prefers-color-scheme: dark) {
      .dark-mode-bg { background-color: #1a1a1a !important; }
      .dark-mode-text { color: #f5f5f5 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <!-- Preview text (hidden but shows in email preview) -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${subject}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <!-- Main container -->
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header with logo -->
          <tr>
            <td class="header" style="background-color: #0D7377; padding: 28px 32px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <!-- Logo text (since we can't guarantee image loading) -->
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      Pulau
                    </h1>
                    <p style="margin: 4px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Premium Bali Experiences
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td class="content" style="padding: 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="background-color: #f9f9f9; padding: 24px 32px; border-top: 1px solid #eee;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; color: #666; font-size: 14px; font-weight: 600;">
                      Pulau - Premium Bali Experiences
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; color: #888; font-size: 13px;">
                      Questions? <a href="mailto:support@pulau.app" style="color: #0D7377;">support@pulau.app</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #aaa; font-size: 12px;">
                      You're receiving this email because you booked on Pulau.<br>
                      <a href="https://pulau.app/settings/notifications" style="color: #888;">Manage notification preferences</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Copyright -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 24px 16px;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Pulau. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Common email components
 */
export const components = {
  /**
   * Primary call-to-action button
   */
  button: (href: string, text: string): string => `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${href}" class="button" target="_blank" style="display: inline-block; background-color: #0D7377; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; mso-padding-alt: 0;">
            <!--[if mso]>
            <i style="letter-spacing: 32px; mso-font-width: -100%; mso-text-raise: 24pt;">&nbsp;</i>
            <![endif]-->
            <span style="mso-text-raise: 12pt;">${text}</span>
            <!--[if mso]>
            <i style="letter-spacing: 32px; mso-font-width: -100%;">&nbsp;</i>
            <![endif]-->
          </a>
        </td>
      </tr>
    </table>
  `,

  /**
   * Secondary button (outline style)
   */
  secondaryButton: (href: string, text: string): string => `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
      <tr>
        <td align="center">
          <a href="${href}" class="button" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0D7377 !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid #0D7377;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,

  /**
   * Highlighted info box
   */
  highlight: (content: string): string => `
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      <tr>
        <td style="background-color: #f0fafa; border-left: 4px solid #0D7377; padding: 16px 20px; border-radius: 0 8px 8px 0;">
          ${content}
        </td>
      </tr>
    </table>
  `,

  /**
   * Warning box (for important notices)
   */
  warning: (content: string): string => `
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      <tr>
        <td style="background-color: #fff5f5; border-left: 4px solid #FF6B6B; padding: 16px 20px; border-radius: 0 8px 8px 0;">
          ${content}
        </td>
      </tr>
    </table>
  `,

  /**
   * Card container
   */
  card: (content: string): string => `
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      <tr>
        <td class="card" style="border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;">
          ${content}
        </td>
      </tr>
    </table>
  `,

  /**
   * Detail row (label + value)
   */
  detailRow: (label: string, value: string, isLast = false): string => `
    <tr>
      <td style="padding: 12px 0; border-bottom: ${isLast ? 'none' : '1px solid #eee'};">
        <strong style="color: #666;">${label}</strong>
      </td>
      <td style="padding: 12px 0; border-bottom: ${isLast ? 'none' : '1px solid #eee'}; text-align: right;">
        ${value}
      </td>
    </tr>
  `,

  /**
   * Details table wrapper
   */
  detailsTable: (rows: string): string => `
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      ${rows}
    </table>
  `,

  /**
   * Image with fallback
   */
  image: (src: string, alt: string, height = '200'): string => `
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <img src="${src}" alt="${alt}" class="experience-image" style="width: 100%; height: ${height}px; object-fit: cover; border-radius: 8px; display: block;" />
        </td>
      </tr>
    </table>
  `,

  /**
   * Divider line
   */
  divider: (): string => `
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td style="border-bottom: 1px solid #eee;"></td>
      </tr>
    </table>
  `,
};
