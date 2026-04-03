import nodemailer from "nodemailer";
import type { TransportOptions } from "nodemailer";

/**
 * mailSender — serverless-friendly SMTP mailer via Gmail.
 *
 * No connection pooling: pools don't survive across lambda cold starts —
 * a "pooled" singleton is just a dead socket on every cold invocation.
 * nodemailer defaults to non-pooled (pool: false), so we omit the option
 * entirely to stay compatible with the strict TypeScript overloads.
 *
 * A hard 8 s deadline is enforced via Promise.race so a stalled Gmail
 * SMTP server fails fast instead of silently blocking until Vercel kills
 * the lambda.
 */
const mailSender = async (
  email: string,
  title: string,
  body: string
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 465,
      secure: true, // TLS on port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    } as TransportOptions);

    const sendPromise = transporter.sendMail({
      from: `"UrHabit" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    // Hard deadline — don't let a stalled SMTP server eat Vercel's budget
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Mail send timed out after 8 s")), 8000)
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
