"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Define TypeScript interfaces
interface CategoryOption {
  title: string;
  icon: string;
  link: string;
}

interface Categories {
  [key: string]: CategoryOption[];
}

interface FilterCard {
  title: string;
  icon: string;
  modal: keyof Categories;
}

const ServiceFilters = () => {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<keyof Categories | null>(null);

  const categories: Categories = {
    appliances: [
      {
        title: "AC Repair & Service",
        icon: "❄️",
        link: "ac-repair",
      },
      {
        title: "Chimney Repair",
        icon: "🏭",
        link: "chimney-repair",
      },
      {
        title: "Water Purifier Repair",
        icon: "💧",
        link: "water-purifier",
      },
      {
        title: "Microwave Repair",
        icon: "📡",
        link: "microwave-repair",
      },
      {
        title: "Refrigerator Repair",
        icon: "🧊",
        link: "refrigerator-repair",
      },
    ],
    cleaning: [
      {
        title: "Bathroom & Kitchen Cleaning",
        icon: "🧹",
        link: "bathroom-kitchen-cleaning",
      },
      {
        title: "Sofa & Carpet Cleaning",
        icon: "🛋️",
        link: "sofa-carpet-cleaning",
      },
    ],
    trades: [
      {
        title: "Electrician",
        icon: "⚡",
        link: "electrician",
      },
      {
        title: "Plumber",
        icon: "🔧",
        link: "plumber",
      },
      {
        title: "Carpenter",
        icon: "🔨",
        link: "carpenter",
      },
    ],
  };

  const filterCards: FilterCard[] = [
    {
      title: "Appliance repair & service",
      icon: "icons/appliances.webp",
      modal: "appliances",
    },
    {
      title: "Cleaning",
      icon: "/icons/cleaning.webp",
      modal: "cleaning",
    },
    {
      title: "Electrician, Plumber & Carpenters",
      icon: "/icons/tracks.webp",
      modal: "trades",
    },
  ];

  const handleCategorySelect = (category: string) => {
    router.push(`/services?category=${category}`);
    setActiveModal(null);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-950 transition-colors duration-200">
      <div className="border rounded-md shadow-sm md:w-[500px] dark:border-gray-800">
        <h2 className="text-xl font-semibold hidden md:block p-4 ml-2 text-gray-600 dark:text-gray-300">
          What are you looking for?
        </h2>

        {/* Responsive Grid for Filter Cards */}
        <div className="p-4 md:w-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filterCards.map((filter, index) => (
              <button
                key={index}
                onClick={() => setActiveModal(filter.modal)}
                className="flex flex-col items-center justify-center p-3 
                           bg-gray-50 dark:bg-gray-800 
                           hover:bg-gray-100 dark:hover:bg-gray-700
                           rounded-lg transition-colors group"
              >
                <div className="relative w-16 h-16 mb-2">
                  <img
                    src={filter.icon}
                    alt={filter.title}
                    className="object-contain group-hover:scale-110 transition-transform
                             dark:filter dark:brightness-90"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {filter.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Category Selection Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 text-gray-500 dark:text-gray-400
                         hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>

              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {typeof activeModal === "string"
                  ? activeModal.charAt(0).toUpperCase() + activeModal.slice(1)
                  : activeModal}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {categories[activeModal].map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategorySelect(option.link)}
                    className="flex flex-col items-center p-4 
                             bg-gray-50 dark:bg-gray-900
                             hover:bg-gray-100 dark:hover:bg-gray-900 
                             rounded-lg transition-colors"
                  >
                    <span className="text-2xl mb-2">{option.icon}</span>
                    <span className="text-center text-sm text-gray-900 dark:text-gray-200">
                      {option.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceFilters;
