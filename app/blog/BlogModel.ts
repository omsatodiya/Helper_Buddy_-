import mongoose from 'mongoose';

// Define the allowed tags (for type safety and validation)
export type BlogTag = 'beauty' | 'lifestyle' | 'homepage' | 'fashion' | 'health' | 'food';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  readTime: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
    enum: ['beauty', 'lifestyle', 'homepage', 'fashion', 'health', 'food'], // Add all your desired tags here
    validate: {
      validator: function(v: string[]) {
        return v.length > 0; // Ensures at least one tag is provided
      },
      message: 'At least one tag is required'
    }
  }
}, {
  timestamps: true,
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);