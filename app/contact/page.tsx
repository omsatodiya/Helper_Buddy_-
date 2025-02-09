'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.from('.hero-text', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.2,
      });

      // About section animations
      gsap.from('.about-card', {
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top center',
          end: 'bottom center',
        },
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Contact form animations
      gsap.from('.contact-item', {
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top center',
          end: 'bottom center',
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
      });

      gsap.from('.form-element', {
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top center',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="hero-text text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Get in Touch
          </h1>
          <p className="hero-text text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="about-section py-32">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            About Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Mail,
                title: "Our Mission",
                description: "To provide exceptional service and innovative solutions to our customers."
              },
              {
                icon: Phone,
                title: "Our Vision",
                description: "To become the leading provider of quality products and services in our industry."
              },
              {
                icon: MapPin,
                title: "Our Values",
                description: "Integrity, innovation, and customer satisfaction drive everything we do."
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="about-card p-10 bg-black/50 border-none hover:bg-black/80 transition-all duration-300 group"
              >
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8 group-hover:bg-white/20 transition-colors">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-6 text-center text-primary">{item.title}</h3>
                <p className="text-muted-foreground text-center text-lg leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="contact-section py-32 bg-black/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-10">
              <h2 className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Contact Information
              </h2>
              <div className="space-y-8">
                {[
                  { icon: Mail, title: "Email", info: "contact@example.com" },
                  { icon: Phone, title: "Phone", info: "+1 (555) 123-4567" },
                  { icon: MapPin, title: "Address", info: "123 Business Street, Suite 100, City, State 12345" }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="contact-item flex items-center space-x-6 p-6 rounded-xl bg-black/30 hover:bg-black/50 transition-all duration-300 group"
                  >
                    <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-primary mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-lg">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <form ref={formRef} className="space-y-8 bg-black/30 p-10 rounded-xl">
              <div className="form-element space-y-2">
                <Label className="text-sm text-primary">Your Name</Label>
                <Input 
                  placeholder="Enter your name" 
                  className="h-14 bg-black/50 border-white/10 text-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="form-element space-y-2">
                <Label className="text-sm text-primary">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="h-14 bg-black/50 border-white/10 text-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="form-element space-y-2">
                <Label className="text-sm text-primary">Subject</Label>
                <Input 
                  placeholder="Enter subject" 
                  className="h-14 bg-black/50 border-white/10 text-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="form-element space-y-2">
                <Label className="text-sm text-primary">Message</Label>
                <Textarea 
                  placeholder="Enter your message" 
                  className="min-h-[200px] resize-none bg-black/50 border-white/10 text-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button className="form-element w-full h-14 bg-primary hover:bg-primary/80 text-lg font-semibold transition-colors">
                <Send className="mr-3 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
} 