'use client';

import { useState } from 'react';
import { Shield, Star, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

export default function BecomeProviderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleBecomeProvider = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to become a provider.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'provider',
        providerSince: new Date(),
        status: 'pending'
      });

      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error becoming provider:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "Verified Provider Status",
      description: "Join our network of trusted professionals and build credibility with a verified provider badge."
    },
    {
      icon: Star,
      title: "Increased Visibility",
      description: "Get featured in our provider directory and reach more potential clients."
    },
    {
      icon: Award,
      title: "Professional Tools",
      description: "Access exclusive tools and features to manage your services efficiently."
    }
  ];

  const requirements = [
    "Valid professional certification or license",
    "Minimum 2 years of experience",
    "Excellent communication skills",
    "Strong portfolio or work history",
    "Commitment to quality service"
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="pt-32 pb-20 border-b border-black/10 dark:border-white/10">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">
              Become a Service Provider
            </h1>
            <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed mb-8">
              Join our platform and start offering your professional services to clients worldwide.
            </p>
            <Button
              onClick={handleBecomeProvider}
              disabled={isSubmitting}
              className="h-12 px-8 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-medium transition-all duration-300"
            >
              {isSubmitting ? 'Processing...' : 'Apply Now'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-black dark:text-white">
            Benefits of Becoming a Provider
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                className="relative border-0 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="p-8">
                  <div className="h-12 w-12 rounded-lg bg-black dark:bg-white flex items-center justify-center mb-6">
                    <benefit.icon className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-black/60 dark:text-white/60 text-base leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-black dark:text-white">
            Requirements
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {requirements.map((requirement, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-white dark:bg-black"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  <span className="text-black/80 dark:text-white/80">
                    {requirement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 