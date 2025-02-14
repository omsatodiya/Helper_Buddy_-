'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollToPlugin);

// This could later come from your database
const TRENDING_SEARCHES = [
  { id: 1, label: "Electrician", count: "750 searches" },
  { id: 2, label: "Home Cleaning", count: "980 searches" },
  { id: 3, label: "Plumbing", count: "850 searches" },
  { id: 4, label: "AC Service", count: "1.2k searches" },
];

// Update the ALL_SERVICES array with image URLs
const ALL_SERVICES = [
  { id: 1, name: "AC Service", category: "Appliances", price: "from ₹399", image: "https://picsum.photos/200/300" },
  { id: 2, name: "AC Installation", category: "Appliances", price: "from ₹499", image: "https://picsum.photos/200/300" },
  { id: 3, name: "Home Cleaning", category: "Cleaning", price: "from ₹299", image: "https://picsum.photos/200/300" },
  { id: 4, name: "Deep Cleaning", category: "Cleaning", price: "from ₹999", image: "https://picsum.photos/200/300" },
  { id: 5, name: "Plumbing Work", category: "Plumbing", price: "from ₹199", image: "https://picsum.photos/200/300" },
  { id: 6, name: "Pipe Fitting", category: "Plumbing", price: "from ₹299", image: "https://picsum.photos/200/300" },
  { id: 7, name: "Electrician", category: "Electrical", price: "from ₹199", image: "https://picsum.photos/200/300" },
  { id: 8, name: "Electrical Repair", category: "Electrical", price: "from ₹299", image: "https://picsum.photos/200/300" },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subHeadingsRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Initial page load animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animate heading with text reveal
    if (headingRef.current) {
      tl.fromTo(headingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 }
      );
    }

    // Animate subheadings with stagger
    if (subHeadingsRef.current) {
      const subHeadings = Array.from(subHeadingsRef.current.children);
      tl.fromTo(subHeadings,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
        "-=0.5"
      );
    }

    // Animate search bar
    if (searchBarRef.current) {
      tl.fromTo(searchBarRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );
    }

    // Animate features with stagger
    if (featuresRef.current) {
      const features = featuresRef.current.querySelectorAll('.feature-card');
      tl.fromTo(features,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
        "-=0.4"
      );
    }
  }, []);

  // Handle search focus and scroll
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // Smooth scroll using GSAP
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: 300, autoKill: false },
      ease: "power3.inOut"
    });
  };

  // Filter services based on search query
  const filteredServices = ALL_SERVICES.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Animate dropdown close
        if (isSearchFocused) {
          const dropdownContent = searchRef.current.querySelector('.dropdown-content');
          if (dropdownContent) {
            gsap.to(dropdownContent, {
              opacity: 0,
              y: -10,
              duration: 0.3,
              ease: "power2.inOut",
              onComplete: () => setIsSearchFocused(false)
            });
          }
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchFocused]);

  return (
    <div ref={containerRef} className="bg-black min-h-screen relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      {/* Main content */}
      <div className="relative mt-16 z-10 container mx-auto px-4 min-h-screen flex flex-col justify-center items-center">
        <div className="text-center">
          <h1 ref={headingRef} className="text-5xl md:text-7xl font-bold text-white mb-10 opacity-0">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#2C786C] to-[#004AAD] text-transparent bg-clip-text">
              Helper Buddy
            </span>
          </h1>
          <div ref={subHeadingsRef} className="flex flex-col gap-2 my-10">
            <p className="text-3xl md:text-5xl text-[#EAEAEA] font-light opacity-0">
              Reliable, Fast & Affordable Services
            </p>
            <p className="text-3xl md:text-5xl text-[#EAEAEA] font-light opacity-0">
              Your Helper Buddy
            </p>
            <p className="text-3xl md:text-5xl text-[#EAEAEA] font-light opacity-0">
              is Just a Click Away
            </p>
          </div>
          
          {/* Search Bar */}
          <div ref={searchBarRef} className="flex justify-center mt-8 relative opacity-0 z-50">
            <div ref={searchRef} className="relative w-full max-w-2xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder="Search for services..."
                className="w-full px-6 py-4 bg-white/10 border border-[#2C786C]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#2C786C] transition-colors text-xl"
              />

              {/* Dropdown Content */}
              {isSearchFocused && (
                <div className="dropdown-content absolute w-full mt-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-4">
                    {searchQuery === '' ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-gray-700 font-semibold flex items-center gap-2">
                            Trending Searches
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="currentColor" 
                              className="w-5 h-5 text-[#2C786C]"
                            >
                              <path 
                                d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                              />
                            </svg>
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {TRENDING_SEARCHES.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSearchQuery(item.label);
                                setIsSearchFocused(false);
                              }}
                              className="group flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <span className="text-gray-800">{item.label}</span>
                              <span className="text-xs text-gray-500 group-hover:text-gray-700">
                                • {item.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <img 
                            src="https://picsum.photos/32/32" 
                            alt="Services" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <h3 className="text-gray-700 font-semibold">Search Results</h3>
                        </div>
                        {filteredServices.length > 0 ? (
                          <div className="space-y-2">
                            {filteredServices.map((service) => (
                              <button
                                key={service.id}
                                onClick={() => {
                                  setSearchQuery(service.name);
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-4 group hover:scale-[1.02]"
                              >
                                <img 
                                  src={service.image} 
                                  alt={service.name}
                                  className="w-12 h-12 rounded-lg object-cover group-hover:shadow-md transition-all duration-200"
                                />
                                <div className="flex-1">
                                  <p className="text-gray-800 font-medium group-hover:text-[#2C786C] transition-colors">
                                    {service.name}
                                  </p>
                                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                    {service.category}
                                  </p>
                                </div>
                                <span className="text-[#2C786C] font-medium group-hover:scale-105 transition-transform">
                                  {service.price}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No services found</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="w-full mt-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Home & Office Cleaning",
                description: "Expert cleaning tailored to your space, using eco-friendly products",
                icon: "🏠"
              },
              {
                title: "Appliance Repair & Maintenance",
                description: "Quick, reliable appliance repairs and maintenance",
                icon: "🔧"
              },
              {
                title: "Plumbing & Electrical",
                description: "Trusted plumbing and electrical services, with emergency response",
                icon: "⚡"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card p-6 rounded-lg border border-[#2C786C]/20 backdrop-blur-sm bg-black/30 opacity-0"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">{feature.title}</h3>
                <p className="text-[#EAEAEA]/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}