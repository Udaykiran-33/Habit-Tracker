import nodemailer from "nodemailer";

// ── Singleton transporter — reused across all invocations in the same lambda ──
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      // Pool connections instead of creating a new one per email
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }
  return _transporter;
}

const mailSender = async (email: string, title: string, body: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"UrHabit" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log(`[Mail] Sent to ${email}: "${title}"`);
    return true;
  } catch (err: unknown) {
    console.error(`[Mail] Failed to send to ${email}:`, err);
    return false;
  }
};

export default mailSender;
