/**
 * Clean, short dark-themed HTML email for UrHabit nightly reminders.
 *
 * Color palette:
 *   Background: #060606  |  Card: #0d0d0d  |  Border: #1e1e1e
 *   Olive: #6b8c3a       |  Olive-light: #8baf48
 *   Foreground: #f5f5f5  |  Muted: #777777
 *
 * Logo: Uses /logo.png served from the production domain.
 * The logo URL is built from the `appUrl` param so it automatically
 * resolves correctly on any deployment (staging, prod, etc.).
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
  const habitsUrl = `${appUrl}/habits`;
  // Derive logo URL from the passed-in appUrl so this works on any deployment
  const logoUrl = `${appUrl}/logo.png`;
  const firstName = userName.split(" ")[0];
  const remaining = incompleteHabits.length;

  // Build habit rows
  const habitRows = incompleteHabits
    .map(
      (name, i) => `
        <tr>
          <td style="padding:12px 18px;background-color:${i % 2 === 0 ? "#141414" : "#111111"};border-bottom:1px solid #1e1e1e;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="22" style="vertical-align:middle;">
                  <div style="width:16px;height:16px;border:2px solid #3a3a3a;border-radius:4px;background:#1c1c1c;"></div>
                </td>
                <td style="vertical-align:middle;padding-left:10px;font-size:14px;color:#d4d4d4;font-weight:500;">${name}</td>
                <td width="58" style="text-align:right;vertical-align:middle;">
                  <span style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.8px;">pending</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>UrHabit — Evening Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#060606;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preview text -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#060606;">
    ${remaining} habit${remaining > 1 ? "s" : ""} still waiting — finish strong tonight!
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060606;">
    <tr>
      <td align="center" style="padding:36px 12px;">

        <!-- CARD -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:480px;background:#0d0d0d;border-radius:20px;overflow:hidden;border:1px solid #1e1e1e;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#3a4d20,#8baf48,#3a4d20);"></td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="padding:24px 24px 16px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Logo -->
                  <td width="44" style="vertical-align:middle;">
                    <img
                      src="${logoUrl}"
                      alt="UrHabit"
                      width="40"
                      height="40"
                      style="display:block;width:40px;height:40px;border-radius:10px;"
                    >
                  </td>
                  <!-- Brand -->
                  <td style="vertical-align:middle;padding-left:10px;">
                    <span style="font-size:18px;font-weight:800;color:#f5f5f5;letter-spacing:-0.4px;">Ur</span><span style="font-size:18px;font-weight:800;color:#8baf48;letter-spacing:-0.4px;">Habit</span>
                    <div style="font-size:9px;color:#555;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;margin-top:2px;">Build Discipline</div>
                  </td>
                  <!-- Evening badge -->
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="display:inline-block;padding:5px 11px;background:#1a2010;border:1px solid #2d3d1a;border-radius:20px;font-size:11px;font-weight:600;color:#8baf48;">🌙 Evening</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 24px;"><div style="height:1px;background:#1a1a1a;"></div></td></tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:24px 24px 8px 24px;">
              <h1 style="margin:0 0 10px 0;font-size:22px;font-weight:800;color:#f5f5f5;line-height:1.3;letter-spacing:-0.3px;">
                Hey ${firstName},<br>finish strong tonight.
              </h1>
              <p style="margin:0;font-size:14px;color:#777;line-height:1.65;">
                You're <strong style="color:#8baf48;">${completedCount} of ${totalCount}</strong> done.
                <strong style="color:#d4d4d4;">${remaining} habit${remaining > 1 ? "s" : ""}</strong> still waiting for you.
              </p>
            </td>
          </tr>

          <!-- HABITS LIST -->
          <tr>
            <td style="padding:20px 24px 6px 24px;">
              <div style="font-size:10px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Waiting for you</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #1e1e1e;">
                ${habitRows}
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:22px 24px 10px 24px;text-align:center;">
              <a href="${habitsUrl}" target="_blank"
                style="display:inline-block;padding:14px 48px;background:linear-gradient(135deg,#5a7832,#8baf48);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
                Complete Your Habits →
              </a>
            </td>
          </tr>

          <!-- QUOTE -->
          <tr>
            <td style="padding:16px 24px 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1409;border-radius:10px;border:1px solid #1e2a0e;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="3" style="background:linear-gradient(180deg,#6b8c3a,#8baf48);border-radius:2px;"></td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 5px 0;font-size:12px;color:#888;line-height:1.6;font-style:italic;">"We are what we repeatedly do. Excellence, then, is not an act, but a habit."</p>
                          <p style="margin:0;font-size:10px;color:#4a5c2f;font-weight:700;letter-spacing:0.5px;">— Aristotle</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 24px;"><div style="height:1px;background:#141414;"></div></td></tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:16px 24px 22px 24px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:11px;color:#3a3a3a;line-height:1.6;">You're receiving this because you have incomplete habits on UrHabit.</p>
              <p style="margin:0;font-size:10px;color:#2a2a2a;">© ${new Date().getFullYear()} UrHabit — Build Discipline, One Day at a Time</p>
            </td>
          </tr>

        </table>
        <!-- END CARD -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
