import mongoose, { Schema, Document, models } from 'mongoose';

interface IService extends Document {
  name: string;
  details: string;
  price: number;
  review: number; 
  category: string;
  providerId: mongoose.Types.ObjectId; 
  reviews: { reviewerId: mongoose.Types.ObjectId; rating: number; comment: string }[]; 
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  price: { type: Number, required: true },
  category: {type: String, required: true},
  review: { type: Number, required: true, min: 1, max: 5 },
  providerId: { type: mongoose.Types.ObjectId, ref: 'ServiceProvider', required: true },
  reviews: [
    {
      reviewerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: false },
    },
  ],
});

// ✅ Prevent OverwriteModelError by checking if the model already exists
const ServiceModel = models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default ServiceModel;
