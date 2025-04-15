import express from 'express';
import enquiryRoutes from './routes/EnquiryRoutes';

const app = express();

app.use('/api', enquiryRoutes);

export default app;