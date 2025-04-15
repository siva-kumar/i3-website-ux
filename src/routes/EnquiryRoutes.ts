import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import Enquiry from '../models/Enquiry';

const router = express.Router();

router.use(express.json());

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
      res.status(400).json({ message: errors.array() });
      return;
    }

    const { firstname, lastname, email, message } = req.body;

    const existingUser = await Enquiry.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Enquiry with this email already exists' });
      return;
    }

    const enquiry = new Enquiry({ firstname, lastname, email, message });
    await enquiry.save();

    res.status(201).json({
      message: 'Enquiry added successfully',
      enquiry: {
        name: `${enquiry.firstname} ${enquiry.lastname}`,
        email: enquiry.email,
      },
    });
  })
);

export default router;
