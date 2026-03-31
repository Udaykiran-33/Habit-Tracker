/**
 * Premium dark-themed HTML email for UrHabit nightly reminders.
 *
 * Color palette (from globals.css):
 *   Background: #0a0a0a  |  Surface: #141414  |  Surface-2: #1c1c1c
 *   Border: #2a2a2a      |  Olive: #6b8c3a    |  Olive-light: #8baf48
 *   Foreground: #f5f5f5  |  Muted: #888888    |  Dim: #555555
 */

interface ReminderData {
  userName: string;
  completedCount: number;
  totalCount: number;
  incompleteHabits: string[];
  appUrl: string;
}

export function habitReminderEmail({
  userName,
  completedCount,
  totalCount,
  incompleteHabits,
  appUrl,
}: ReminderData): string {
  const logoUrl = `${appUrl}/logo.png`;
  const habitsUrl = `${appUrl}/habits`;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const firstName = userName.split(" ")[0];
  const remaining = incompleteHabits.length;

  // Build habit rows with alternating subtle backgrounds
  const habitRows = incompleteHabits
    .map(
      (name, i) => `
        <tr>
          <td style="padding: 14px 20px; font-size: 14px; font-weight: 500; color: #f5f5f5; background-color: ${i % 2 === 0 ? '#1c1c1c' : '#181818'}; border-left: 3px solid #6b8c3a;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="28" style="vertical-align: middle;">
                  <div style="width: 20px; height: 20px; border: 2px solid #555555; border-radius: 5px;"></div>
                </td>
                <td style="vertical-align: middle; padding-left: 8px; font-size: 14px; color: #e0e0e0;">
                  ${name}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  // Completed habit checkmarks (visual contrast)
  const completedDots = Array.from({ length: completedCount })
    .map(() => `<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #8baf48; margin: 0 3px;"></span>`)
    .join("");
  const remainingDots = Array.from({ length: remaining })
    .map(() => `<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #2a2a2a; border: 1px solid #555555; margin: 0 3px;"></span>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>UrHabit — Evening Reminder</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; color: #050505;">
    You have ${remaining} habit${remaining > 1 ? 's' : ''} left today. Don't break your streak! &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌
  </div>

  <!-- OUTER WRAPPER -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- MAIN CARD -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #0a0a0a; border-radius: 20px; overflow: hidden; border: 1px solid #1e1e1e;">

          <!-- ═══════════ TOP ACCENT BAR ═══════════ -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #4a5c2f, #6b8c3a, #8baf48, #6b8c3a, #4a5c2f);"></td>
          </tr>

          <!-- ═══════════ LOGO + BRAND HEADER ═══════════ -->
          <tr>
            <td style="padding: 28px 32px 16px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${logoUrl}" alt="UrHabit" width="40" height="40" style="display: block; border-radius: 10px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.5px;">Ur</span><span style="font-size: 20px; font-weight: 700; color: #8baf48; letter-spacing: -0.5px;">Habit</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════ EVENING ICON + GREETING ═══════════ -->
          <tr>
            <td style="padding: 8px 32px 0 32px; text-align: center;">
              <div style="font-size: 44px; line-height: 1;">🌙</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px 4px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #f5f5f5; line-height: 1.3;">
                Good Evening, ${firstName}!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 36px 20px 36px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.65;">
                Your day isn't over yet! You have <strong style="color: #8baf48;">${remaining} habit${remaining > 1 ? 's' : ''}</strong> waiting to be checked off. Small steps today build the discipline of tomorrow.
              </p>
            </td>
          </tr>

          <!-- ═══════════ PROGRESS CARD ═══════════ -->
          <tr>
            <td style="padding: 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 14px; border: 1px solid #2a2a2a;">
                <tr>
                  <td style="padding: 22px 24px 12px 24px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 1.5px;">
                      Today's Progress
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px; text-align: center;">
                    <span style="font-size: 48px; font-weight: 800; color: #8baf48; letter-spacing: -2px;">${completedCount}</span>
                    <span style="font-size: 22px; font-weight: 300; color: #555555;"> / ${totalCount}</span>
                  </td>
                </tr>
                <!-- Progress bar -->
                <tr>
                  <td style="padding: 16px 28px 8px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #1e1e1e; border-radius: 4px; overflow: hidden; height: 8px;">
                          <div style="width: ${progress}%; height: 8px; background: linear-gradient(90deg, #4a5c2f, #8baf48); border-radius: 4px;"></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Dot visualization -->
                <tr>
                  <td style="padding: 10px 24px 20px 24px; text-align: center; line-height: 1;">
                    ${completedDots}${remainingDots}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════ INCOMPLETE HABITS LIST ═══════════ -->
          <tr>
            <td style="padding: 24px 24px 6px 24px;">
              <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; color: #888888; text-transform: uppercase; letter-spacing: 1.5px; padding-left: 4px;">
                Waiting for you
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
                ${habitRows}
              </table>
            </td>
          </tr>

          <!-- ═══════════ CTA BUTTON ═══════════ -->
          <tr>
            <td style="padding: 28px 32px 8px 32px; text-align: center;">
              <a href="${habitsUrl}" target="_blank" style="display: inline-block; padding: 15px 44px; background: linear-gradient(135deg, #6b8c3a 0%, #8baf48 100%); color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; letter-spacing: 0.4px; box-shadow: 0 4px 16px rgba(107,140,58,0.3);">
                ✓&nbsp;&nbsp;Complete Your Habits
              </a>
            </td>
          </tr>

          <!-- ═══════════ MOTIVATIONAL QUOTE ═══════════ -->
          <tr>
            <td style="padding: 28px 36px 24px 36px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-left: 3px solid #6b8c3a; padding-left: 16px; text-align: left;">
                    <p style="margin: 0; font-size: 13px; color: #777777; line-height: 1.6; font-style: italic;">
                      "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 11px; color: #555555; font-weight: 600;">
                      — Aristotle
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════ DIVIDER ═══════════ -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background-color: #1e1e1e;"></div>
            </td>
          </tr>

          <!-- ═══════════ FOOTER ═══════════ -->
          <tr>
            <td style="padding: 24px 32px 28px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #555555; line-height: 1.6;">
                You're receiving this because you have incomplete habits on UrHabit.
              </p>
              <p style="margin: 0; font-size: 10px; color: #333333;">
                © ${new Date().getFullYear()} UrHabit — Build Discipline, One Day at a Time
              </p>
            </td>
          </tr>

        </table>
        <!-- END MAIN CARD -->

      </td>
    </tr>
  </table>
  <!-- END OUTER WRAPPER -->

</body>
</html>`;
}
