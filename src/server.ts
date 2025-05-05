import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import enquiryRoutes from './routes/EnquiryRoutes';
import subscribeRoutes from "./routes/SubscribeRoutes";

const app = express();

// Enable CORS
app.use(cors());
/*
app.use(cors({
  origin: ['http://your-frontend.com', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
})); */

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/i3')
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Optional: Route to serve home.html directly for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Route
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/subscribe', subscribeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});