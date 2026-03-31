import nodemailer from "nodemailer";

const mailSender = async (email: string, title: string, body: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

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
