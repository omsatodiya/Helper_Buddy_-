"use client";
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);

  const faqData: FAQItem[] = [
    {
      question: "What is HelperBuddy?",
      answer: "HelperBuddy is a cleaning service that helps keep your home and office clean. We also clean air conditioning units. Our goal is to make your spaces fresh and healthy."
    },
    {
      question: "What cleaning services do you offer?",
      answer: "We offer a variety of cleaning services, including home cleaning, office cleaning, and AC cleaning. Whether you need a deep clean or regular maintenance, we've got you covered."
    },
    {
      question: "How do I book a cleaning service?",
      answer: "Booking is easy! Just give us a call or fill out our online form. We'll set up a time that works best for you."
    },
    {
      question: "How much does your service cost?",
      answer: "The cost depends on the size of your home or office and the type of cleaning you need. We have options for every budget. For exact prices, check our pricing page/contact us."
    },
    {
      question: "Is HelperBuddy the best cleaning service in India?",
      answer: "Many of our customers think so! We pride ourselves on quality service and customer satisfaction. Check our reviews to see what others are saying."
    },
    {
      question: "How can I find good cleaning services near me?",
      answer: "If you're looking for reliable cleaning services nearby, Helper Buddy is the answer. We connect you with experienced cleaners who can handle everything from regular home cleaning to deep cleaning. Simply book through our platform, and we'll send a trusted professional to your home."
    }
  ];

  useEffect(() => {
    // Initial animations when component mounts
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );

    gsap.fromTo(titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.2 }
    );

    // Animate FAQ items
    faqRefs.current.forEach((ref, index) => {
      gsap.fromTo(ref,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          delay: index * 0.1 
        }
      );
    });
  }, []);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
    
    // Animate the answer content
    const answerContent = document.querySelector(`#faq-answer-${index}`);
    if (answerContent) {
      if (activeIndex === index) {
        // Closing animation
        gsap.to(answerContent, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        });
      } else {
        // Opening animation
        gsap.fromTo(answerContent,
          { height: 0, opacity: 0 },
          { 
            height: "auto", 
            opacity: 1, 
            duration: 0.3,
            ease: "power2.inOut"
          }
        );
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="max-w-3xl mx-auto py-12 px-4"
    >
      <h2 
        ref={titleRef}
        className="text-3xl font-bold text-center mb-8"
      >
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div 
            key={index}
            ref={el => faqRefs.current[index] = el}
            className="border border-gray-200 rounded-lg"
          >
            <button
              className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-medium">{faq.question}</span>
              <span
                className={`transform transition-transform duration-300 ${
                  activeIndex === index ? 'rotate-180' : ''
                }`}
              >
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`overflow-hidden ${activeIndex === index ? '' : 'h-0 opacity-0'}`}
            >
              <div className="px-6 pb-4">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
