import nodemailer from "nodemailer";
import { logger } from "../logger/logger";

export const emailClient = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const result = await emailClient.sendMail({
      from: process.env.SMTP_FROM || "no-reply@example.com",
      to,
      subject,
      html,
    });
    logger.info(`Sent email to ${to} - messageId=${(result as any)?.messageId}`);
    return result;
  } catch (err) {
    logger.error("sendEmail error", err as Error);
    throw err;
  }
}

