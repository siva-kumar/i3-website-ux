import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import Enquiry from '../models/Enquiry';
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
        body('firstname').isString().notEmpty().withMessage('First name is required'),
        body('lastname').isString().notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Email is invalid'),
        body('message').isString().notEmpty().withMessage('Message is required'),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({message: errors.array()});
            return;
        }

        const {firstname, lastname, email, message} = req.body;

        const existingUser = await Enquiry.findOne({email});
        if (existingUser) {
            res.status(400).json({message: 'Enquiry with this email already exists'});
            return;
        }

        const enquiry = new Enquiry({firstname, lastname, email, message});
        await enquiry.save();

        const orgMailOptions = {
            from: '"Enquiry Bot" <no-reply@i3.io>',
            to: 'hq@i3.io',
            subject: 'New Enquiry Received',
            html: `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; border-radius: 8px;">
      <div style="background-color: #2196F3; padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
        <h2 style="margin: 0;">New Customer Enquiry</h2>
      </div>

      <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>You have received a new enquiry via the contact form:</p>

        <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Name:</td>
            <td style="padding: 8px;">${firstname} ${lastname}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 8px;">${message}</td>
          </tr>
        </table>

        <p style="margin-top: 30px; color: #888; font-size: 12px;">This email was generated automatically by the website enquiry system.</p>
      </div>
    </div>
  `,
        };

        const customerMailOptions = {
            from: '"Enquiry" <no-reply@i3.io>',
            to: enquiry.email,
            subject: 'Thank You for Contacting Us',
            html: `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; color: #333; background: #f9f9f9; padding: 20px; border-radius: 8px;">
      <div style="background-color: #2196F3; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0;">Thank You for Contacting Us</h2>
      </div>

      <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hi <strong>${firstname}</strong>,</p>
        <p>Thanks for reaching out! We’ve received your message and will get back to you as soon as possible.</p>

        <div style="background: #f1f1f1; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your message:</strong></p>
          <p style="margin: 5px 0 0;">"${message}"</p>
        </div>

        <p>In the meantime, feel free to explore our website or contact us directly if it's urgent.</p>
        <p style="margin-top: 30px;">Best regards,<br><strong>The Support Team</strong></p>
      </div>

      <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
        <p>All rights reserved. &copy; Improvement Interactive 2020</p>
      </footer>
    </div>
  `,
        };

        try {
            await transporter.sendMail(orgMailOptions);
            await transporter.sendMail(customerMailOptions);

            res.status(201).json({
                message: 'Enquiry added successfully and email sent.',
                enquiry: {
                    name: `${enquiry.firstname} ${enquiry.lastname}`,
                    email: enquiry.email,
                },
            });
        } catch (err: any) {
            console.error('Email sending failed:', err.message);

            res.status(500).json({
                message: 'Enquiry saved, but email sending failed.',
                error: err.message,
            });
        }
    })
);

export default router;
