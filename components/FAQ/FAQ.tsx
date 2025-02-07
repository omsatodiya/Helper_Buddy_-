"use client";
import React , { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "What is HelperBuddy?",
      answer: "HelperBuddy is a cleaning service that helps keep your home and office clean. We also clean air conditioning units. Our goal is to make your spaces fresh and healthy."
    },
    {
      question: "What cleaning services do you offer?",
      answer: "We offer a variety of cleaning services, including home cleaning, office cleaning, and AC cleaning. Whether you need a deep clean or regular maintenance, we’ve got you covered."
    },
    {
      question: "How do I book a cleaning service?",
      answer: "Booking is easy! Just give us a call or fill out our online form. We’ll set up a time that works best for you."
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
      answer: "If you're looking for reliable cleaning services nearby, Helper Buddy is the answer. We connect you with experienced cleaners who can handle everything from regular home cleaning to deep cleaning. Simply book through our platform, and we’ll send a trusted professional to your home."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto py-12 px-4"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Frequently Asked Questions
      </motion.h2>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg"
          >
            <button
              className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-medium">{faq.question}</span>
              <motion.span
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="transform transition-transform duration-200"
              >
                {activeIndex === index ? '−' : '+'}
              </motion.span>
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FAQ;
