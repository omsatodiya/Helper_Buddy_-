import { db } from '@/lib/config';
import { collection, addDoc, getDocs, query, where, DocumentData, getDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Define the allowed tags (for type safety and validation)
export type BlogTag = 'beauty' | 'lifestyle' | 'homepage' | 'fashion' | 'health' | 'food';

// Define the Blog interface to match your current data
export interface Blog {
  id?: string;
  title: string;
  author: string;
  description: string;
  publishedDate?: string;
  readTime?: string;
  fullDescription?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  imageFile?: File | null;
}

// Collection reference
const COLLECTION_NAME = 'blogs';
const blogsCollection = collection(db, COLLECTION_NAME);

// Helper functions for CRUD operations
export const BlogModel = {
  // Create a new blog
  async create(blogData: Blog, imageFile: File | null): Promise<string> {
    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      // Create blog with image URL
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...blogData,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  // Get all blogs
  async getAll(): Promise<(Blog & { id: string })[]> {
    const snapshot = await getDocs(blogsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Blog, 'id'>
    }));
  },

  // Get blogs by tag
  async getByTag(tag: BlogTag): Promise<(Blog & { id: string })[]> {
    const q = query(blogsCollection, where('tags', 'array-contains', tag));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Blog, 'id'>
    }));
  },

  // Validate blog data
  validateBlog(data: Partial<Blog>): boolean {
    if (!data.title || !data.author || !data.description) {
      return false;
    }
    return true;
  },

  // Get blog by ID
  async getById(id: string): Promise<(Blog & { id: string }) | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data() as Omit<Blog, 'id'>
    };
  },

  // Delete blog
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // Update blog
  async update(id: string, data: Partial<Blog>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }
};

export default BlogModel;