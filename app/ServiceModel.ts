import mongoose, { Schema, Document, models } from 'mongoose';

interface IService extends Document {
  name: string;
  details: string;
  price: number;
  review: number;
  category: string;
  providers: Array<{
    providerId: mongoose.Types.ObjectId;
    price?: number;
    isAvailable: boolean;
    serviceAreas: string[]; // For pincodes
  }>;
  reviews: Array<{
    reviewerId: mongoose.Types.ObjectId;
    providerId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
  }>;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true }, // Make name unique
  details: { type: String, required: true },
  price: { type: Number, required: true }, // Base price
  category: { type: String, required: true },
  review: { type: Number, required: true, min: 1, max: 5 },
  providers: [{
    providerId: { type: mongoose.Types.ObjectId, ref: 'ServiceProvider', required: true },
    price: { type: Number }, // Optional provider-specific price
    isAvailable: { type: Boolean, default: true },
    serviceAreas: [{ type: String }], // Array of pincodes
    createdAt: { type: Date, default: Date.now }
  }],
  reviews: [{
    reviewerId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Types.ObjectId, ref: 'ServiceProvider', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Add index for faster lookups
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ 'providers.providerId': 1 });

// Helper method to add a provider to an existing service
ServiceSchema.methods.addProvider = async function(
  providerId: mongoose.Types.ObjectId,
  serviceAreas: string[],
  price?: number
) {
  const existingProvider = this.providers.find((p: { providerId: mongoose.Types.ObjectId }) => 
    p.providerId.toString() === providerId.toString()
  );

  if (existingProvider) {
    // Update existing provider
    existingProvider.serviceAreas = serviceAreas;
    if (price) existingProvider.price = price;
    existingProvider.isAvailable = true;
  } else {
    // Add new provider
    this.providers.push({
      providerId,
      serviceAreas,
      price: price || this.price,
      isAvailable: true
    });
  }

  return this.save();
};

const ServiceModel = models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default ServiceModel;
