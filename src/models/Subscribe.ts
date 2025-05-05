import mongoose, { Schema, Document } from 'mongoose';

interface ISubscribe extends Document {
    email: string;
    subscribedAt: Date;
}

const SubscribeSchema: Schema = new Schema({
    email: { type: String, required: true },
    subscribedAt: { type: Date, default: Date.now }
});

const Subscribe = mongoose.model<ISubscribe>('Subscribe', SubscribeSchema);

export default Subscribe;