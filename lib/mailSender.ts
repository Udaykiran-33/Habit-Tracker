import nodemailer from "nodemailer";
import type { Transporter, TransportOptions } from "nodemailer";

/**
 * createTransporter — build a single Nodemailer transporter to be
 * reused across multiple sends (avoids repeated TLS handshakes).
 */
export function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: 465,
    secure: true, // TLS on port 465
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  } as TransportOptions);
}

/**
 * mailSender — sends a single HTML email.
 *
 * @param email     Recipient address
 * @param title     Subject line
 * @param body      HTML body
 * @param transport Optional shared transporter (pass one for bulk sends to
 *                  avoid repeated TLS handshakes). A fresh one is created
 *                  if omitted (good for one-off sends).
 */
const mailSender = async (
  email: string,
  title: string,
  body: string,
  transport?: Transporter
): Promise<boolean> => {
  try {
    const transporter = transport ?? createTransporter();

    const sendPromise = transporter.sendMail({
      from: `"UrHabit" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    // Hard deadline — 15 s gives stragglers room without eating Vercel budget
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Mail send timed out after 15 s")), 15000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`[Mail] Sent to ${email}: "${title}"`);
    return true;
  } catch (err: unknown) {
    console.error(`[Mail] Failed to send to ${email}:`, err);
    return false;
  }
};

export default mailSender;
