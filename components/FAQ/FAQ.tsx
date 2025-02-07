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
      question: "What services do you offer?",
      answer: "We offer a wide range of services including web development, mobile app development, and digital marketing solutions."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team through email at support@example.com or call us at (123) 456-7890 during business hours."
    },
    {
      question: "What are your business hours?",
      answer: "Our business hours are Monday through Friday, 9:00 AM to 6:00 PM EST."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all our services. Terms and conditions apply."
    },
    {
      question: "How long does it take to complete a project?",
      answer: "Project timelines vary depending on complexity and requirements. Typically, small projects take 2-4 weeks, while larger projects may take 2-3 months."
    },
    {
      question: "Do you provide maintenance and support?",
      answer: "Yes, we offer ongoing maintenance and support packages to ensure your project continues to run smoothly after launch."
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
