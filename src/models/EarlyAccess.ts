import mongoose, { Schema, Document } from 'mongoose';

interface IEarlyAccess extends Document {
    email: string;
    createdAt: Date;
}

const EarlyAccessSchema: Schema = new Schema({
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const EarlyAccess = mongoose.model<IEarlyAccess>('EarlyAccess', EarlyAccessSchema, 'early_access');

export default EarlyAccess;