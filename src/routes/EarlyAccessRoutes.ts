import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import EarlyAccess from '../models/EarlyAccess';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.use(express.json());

// Configure Mailtrap transporter using credentials from .env
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER!,
        pass: process.env.MAILTRAP_PASS!,
    },
});

router.post(
    '/',
    [
        body('email').isEmail().withMessage('Email is invalid'),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({message: errors.array()});
            return;
        }

        const {email} = req.body;

        const existingUser = await EarlyAccess.findOne({email});
        if (existingUser) {
            res.status(400).json({message: 'Already signed up for early access'});
            return;
        }

        const signup = new EarlyAccess({email});
        await signup.save();

        const earlyAccessUserMailOptions = {
            from: '"Valley Proof Team" <no-reply@i3.io>',
            to: email, // user email
            subject: 'You’re In! Early Access to Valley-Proof Confirmed',
            html: `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; color: #333; background: #f9f9f9; padding: 20px; border-radius: 8px;">
      <div style="background-color: #673AB7; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0;">Early Access Confirmed!</h2>
      </div>

      <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hi there,</p>
        <p>Thank you for signing up for early access to our upcoming book, <strong><em>Valley-Proof: How Real Founders Survive the Tough Years and Build Something That Lasts</em></strong>.</p>
        <p>We’re excited to have you on board! This book is packed with hard-earned lessons and real-life stories from founders who have been through the grind and emerged stronger. We’ll be sending you exclusive updates and early content as soon as it’s ready—so you’ll be among the first to dive in.</p>
        <p>Stay tuned for more, and we can’t wait to share this journey with you!</p>

        <p style="margin-top: 30px;">Warm regards,<br><strong>The Valley-Proof Team</strong></p>
      </div>

      <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
        <p>All rights reserved. &copy; Improvement Interactive 2020</p>
      </footer>
    </div>
  `
        };

        const companyNotificationMailOptions = {
            from: '"Valley Proof Early Access" <no-reply@i3.io>',
            to: 'team@i3.io',
            subject: 'New Early Access Sign-Up for Valley-Proof',
            html: `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h3 style="color: #673AB7;">New Early Access Request for Valley-Proof</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">This user has requested early access to our upcoming book, <em>_Valley-Proof: How Real Founders Survive the Tough Years and Build Something That Lasts_</em>.</p>
    </div>
  `
        };

        try {
            await transporter.sendMail(earlyAccessUserMailOptions);
            await transporter.sendMail(companyNotificationMailOptions);

            res.status(201).json({
                message: 'Successfully signed up for early access. and email sent.',
                subscribe: {
                    email: signup.email,
                },
            });
        } catch (err: any) {
            console.error('Email sending failed:', err.message);

            res.status(500).json({
                message: 'Successfully signed up for early access, but email sending failed.',
                error: err.message,
            });
        }
    })
);

export default router;
