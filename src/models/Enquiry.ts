import mongoose, { Schema, Document } from 'mongoose';

interface IEnquiry extends Document {
  firstname: string;
  lastname: string;
  email: string;
  message: string;
}

const EnquirySchema: Schema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
});

const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;