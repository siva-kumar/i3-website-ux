import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import Subscribe from '../models/Subscribe';
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

        const existingUser = await Subscribe.findOne({email});
        if (existingUser) {
            res.status(400).json({message: 'Already subscribed to i3 blogs'});
            return;
        }

        const subscribe = new Subscribe({email});
        await subscribe.save();

        const subscribedUserMailOptions = {
            from: '"i3 Blog" <no-reply@i3.io>',
            to: email, // only email is collected
            subject: 'Thanks for Subscribing to Our Blog!',
            html: `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; color: #333; background: #f9f9f9; padding: 20px; border-radius: 8px;">
      <div style="background-color: #4CAF50; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0;">Welcome to Our Blog!</h2>
      </div>

      <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hi there,</p>
        <p>Thanks for subscribing to our blog. You’ll now receive the latest updates and insights straight to your inbox.</p>
        <p>We’re glad to have you with us!</p>

        <p style="margin-top: 30px;">Best,<br><strong>The i3 Blog Team</strong></p>
      </div>

      <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
        <p>All rights reserved. &copy; Improvement Interactive 2025</p>
      </footer>
    </div>
  `
        };

        const companyNotificationMailOptions = {
            from: '"Blog Subscription" <no-reply@i3.io>',
            to: 'team@i3.io',
            subject: 'New Blog Subscriber',
            html: `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h3 style="color: #2196F3;">New Blog Subscriber</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">You are receiving this email because someone subscribed to the blog.</p>
    </div>
  `
        };

        try {
            await transporter.sendMail(subscribedUserMailOptions);
            await transporter.sendMail(companyNotificationMailOptions);

            res.status(201).json({
                message: 'Subscribed successfully and email sent.',
                subscribe: {
                    email: subscribe.email,
                },
            });
        } catch (err: any) {
            console.error('Email sending failed:', err.message);

            res.status(500).json({
                message: 'Subscribed successfully, but email sending failed.',
                error: err.message,
            });
        }
    })
);

export default router;
