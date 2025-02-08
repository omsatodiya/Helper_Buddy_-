import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the ServiceProvider document
interface IServiceProvider extends Document {
  providerName: string;
  providerAddress: string;
  providerMobileNumber: string;
  providerState: string;
  providerGender: string;
  providerCity: string;
  providerPinCode: string;
  providerReviews: number; // Average rating in stars (1-5)
  numberOfReviews: number; // Total number of reviews
}

// Create the ServiceProvider schema
const ServiceProviderSchema: Schema = new Schema({
  providerName: { type: String, required: true },
  providerAddress: { type: String, required: true },
  providerMobileNumber: { type: String, required: true },
  providerState: { type: String, required: true },
  providerGender: { type: String, required: true },
  providerCity: { type: String, required: true },
  providerPinCode: { type: String, required: true },
  providerReviews: { type: Number, required: true, min: 1, max: 5 },
  numberOfReviews: { type: Number, required: true, default: 0 },
});

// Create the ServiceProvider model
const ServiceProviderModel = mongoose.model<IServiceProvider>('ServiceProvider', ServiceProviderSchema);

export default ServiceProviderModel;
