import nodemailer from 'nodemailer';
import env from '../config/env';
import logger from './logger';

class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465, // true for 465, false for other ports
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }

  async sendOTP(to: string, otpCode: string): Promise<void> {
    if (!env.email.user || !env.email.pass) {
      logger.warn(`SMTP credentials not configured. Skipping email to ${to}. OTP is ${otpCode}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Crewmute" <${env.email.user}>`,
        to,
        subject: 'Your Crewmute Verification Code',
        text: `Your verification code is ${otpCode}. It will expire in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6133FF; text-align: center;">Crewmute</h2>
            <p>Hello,</p>
            <p>Welcome to Crewmute! Use the following one-time password to verify your college email address.</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #888;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      logger.info(`OTP email successfully sent to ${to}`);
    } catch (error: any) {
      logger.error(`Failed to send OTP email to ${to}: ${error.message || String(error)}`);
      throw new Error('Failed to send verification email. Please try again later.');
    }
  }
}

export const mailerService = new MailerService();
