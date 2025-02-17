'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, ArrowRight, Building2, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase/firebase';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/preloader";

gsap.registerPlugin(ScrollTrigger);

interface FormData {
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.from(heroTextRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
      });

      // About section animations
      gsap.from('.about-card', {
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
        },
        y: 100,
        opacity: 0,
        stagger: 0.3,
      });

      // Contact form animations
      gsap.from('.contact-item', {
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top 70%',
          end: 'top 30%',
          scrub: 1,
        },
        x: -50,
        opacity: 0,
        stagger: 0.2,
      });

      // Form elements with better stagger
      gsap.from('.form-element', {
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top 80%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Button hover animation
      if (submitButtonRef.current) {
        submitButtonRef.current.addEventListener('mouseenter', () => {
          gsap.to(submitButtonRef.current, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        submitButtonRef.current.addEventListener('mouseleave', () => {
          gsap.to(submitButtonRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        submitButtonRef.current.addEventListener('mousedown', () => {
          gsap.to(submitButtonRef.current, {
            scale: 0.98,
            duration: 0.1,
            ease: 'power2.out'
          });
        });

        submitButtonRef.current.addEventListener('mouseup', () => {
          gsap.to(submitButtonRef.current, {
            scale: 1.02,
            duration: 0.1,
            ease: 'power2.out'
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send a message.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getFirestore();
      
      await addDoc(collection(db, 'messages'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: 'unread'
      });

      setShowSuccess(true);
      setFormData({ subject: '', message: '' });
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (!auth.currentUser) {
      return "Login to Send Message";
    }
    if (isSubmitting) {
      return "Sending...";
    }
    if (showSuccess) {
      return (
        <span className="flex items-center justify-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Sent!
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center">
        Send Message
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </span>
    );
  };

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Preloader onLoadingComplete={handleLoadingComplete} />}
      <main
        className={`transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header />
        <div className="min-h-screen bg-white dark:bg-black pt-24">
          {/* Company Info Section */}
          <section className="py-20 border-b border-black/10 dark:border-white/10">
            <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">
                  Contact Us
                </h1>
                <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
                  We're here to help and answer any question you might have. We look forward to hearing from you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Building2,
                    title: "Our Company",
                    description: "A leading provider of innovative solutions, committed to excellence and customer satisfaction."
                  },
                  {
                    icon: Target,
                    title: "Our Mission",
                    description: "To deliver exceptional value through cutting-edge technology and unparalleled service."
                  },
                  {
                    icon: Users,
                    title: "Our Team",
                    description: "A diverse group of experts dedicated to bringing the best solutions to our clients."
                  }
                ].map((item, index) => (
                  <Card 
                    key={index}
                    className="about-card relative border-0 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <div className="p-8">
                      <div className="h-12 w-12 rounded-lg bg-black dark:bg-white flex items-center justify-center mb-6">
                        <item.icon className="h-6 w-6 text-white dark:text-black" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-black/60 dark:text-white/60 text-base leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20">
            <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Contact Information */}
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-black dark:text-white">
                    Get in Touch
                  </h2>
                  <div className="space-y-6">
                    {[
                      { icon: Mail, title: "Email", info: "contact@example.com" },
                      { icon: Phone, title: "Phone", info: "+1 (555) 123-4567" },
                      { icon: MapPin, title: "Address", info: "123 Business Street, Suite 100, City, State 12345" }
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className="contact-item flex items-center space-x-6 p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-300"
                      >
                        <div className="h-12 w-12 rounded-lg bg-black dark:bg-white flex items-center justify-center shrink-0">
                          <item.icon className="h-6 w-6 text-white dark:text-black" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg text-black dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-black/60 dark:text-white/60">
                            {item.info}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Form */}
                <form 
                  ref={formRef} 
                  onSubmit={handleSubmit} 
                  className="space-y-6 bg-black/[0.02] dark:bg-white/[0.02] p-8 rounded-2xl"
                >
                  <div className="form-element space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">
                      Subject
                    </Label>
                    <Input 
                      placeholder="Enter subject" 
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="h-12 bg-white dark:bg-black border-black/10 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                  <div className="form-element space-y-2">
                    <Label className="text-sm font-medium text-black dark:text-white">
                      Message
                    </Label>
                    <Textarea 
                      placeholder="Enter your message" 
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                      className="min-h-[200px] resize-none bg-white dark:bg-black border-black/10 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                  <Button 
                    ref={submitButtonRef}
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    onClick={() => !auth.currentUser && router.push('/auth/login')}
                    className={`w-full h-12 transition-all duration-300 ${
                      showSuccess 
                        ? 'bg-green-500 hover:bg-green-500 text-white cursor-default'
                        : 'bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black'
                    } font-medium`}
                  >
                    {getButtonText()}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
} 