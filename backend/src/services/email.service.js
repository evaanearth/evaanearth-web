import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
let transporter;
function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!transporter) transporter = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE === 'true', auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } });
  return transporter;
}
export async function sendMail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) { logger.info({ to, subject }, 'Email skipped: SMTP is not configured'); return { skipped: true }; }
  return transport.sendMail({ from: env.MAIL_FROM, to, subject, html, text });
}
export const sendOtpEmail = (user, otp) => sendMail({ to: user.email, subject: 'Your Evaan Earth password reset code', text: `Your password reset code is ${otp}. It expires in 10 minutes.`, html: `<div style="font-family:Arial;color:#343b20"><h2>Reset your password</h2><p>Hello ${user.name}, use this code to reset your Evaan Earth password:</p><div style="font-size:28px;font-weight:bold;letter-spacing:8px">${otp}</div><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>` });
export const sendOrderConfirmation = (user, order) => sendMail({ to: user.email, subject: `Evaan Earth order confirmed · ${order._id}`, text: `Thank you for your order. Total: ₹${order.total}.`, html: `<div style="font-family:Arial;color:#343b20"><h2>Thank you for choosing handmade 🌿</h2><p>Your order <b>${order._id}</b> is confirmed.</p><h3>Order total: ₹${order.total.toFixed(2)}</h3><p>We will update you as your order progresses.</p></div>` });
