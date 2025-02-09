"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const socialIconsRef = useRef<(HTMLDivElement | null)[]>([]);
  const copyrightRef = useRef<HTMLDivElement>(null);

  const addToColumnsRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !columnsRef.current.includes(el)) {
      columnsRef.current[index] = el;
    }
  };

  const addToSocialIconsRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !socialIconsRef.current.includes(el)) {
      socialIconsRef.current[index] = el;
    }
  };

  useEffect(() => {
    if (footerRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom-=100",
          once: true
        }
      });

      // Initial footer animation
      tl.fromTo(
        footerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        }
      );

      // Animate columns
      columnsRef.current.forEach((column, index) => {
        if (column) {
          tl.fromTo(
            column,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.3"
          );
        }
      });

      // Animate social icons
      socialIconsRef.current.forEach((icon, index) => {
        if (icon) {
          tl.fromTo(
            icon,
            { scale: 0, rotation: -180 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.5,
              ease: "back.out(1.7)",
            },
            "-=0.3"
          );
        }
      });

      // Animate copyright
      if (copyrightRef.current) {
        tl.fromTo(
          copyrightRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.3"
        );
      }
    }
  }, []);

  const handleHover = (target: HTMLElement) => {
    gsap.to(target, {
      x: 8,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleHoverExit = (target: HTMLElement) => {
    gsap.to(target, {
      x: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleSocialHover = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 1.2,
      rotation: 15,
      duration: 0.3,
      ease: "back.out(1.7)"
    });
  };

  const handleSocialHoverExit = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "back.out(1.7)"
    });
  };

  return (
    <footer ref={footerRef} className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 font-montserrat md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div ref={(el) => addToColumnsRef(el, 0)} className="space-y-4">
            <Link href="/" className="block">
              <h3 className="text-2xl font-montserrat font-bold mb-4">Helper Buddy</h3>
            </Link>
            <p className="text-gray-300 font-inter text-sm leading-relaxed">
              Your trusted partner for finding reliable household services and
              professionals.
            </p>
            <div className="mt-4">
              <h4 className="font-montserrat font-semibold mb-2">Contact Us</h4>
              <p className="text-gray-300 font-inter">Email: info@helperbuddy.in</p>
              <p className="text-gray-300 font-inter">Phone: +91 XXXXX XXXXX</p>
            </div>
          </div>

          {/* Quick Links */}
          <div ref={(el) => addToColumnsRef(el, 1)}>
            <h3 className="text-xl font-montserrat font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About Us", "Services", "Contact", "Careers"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-300 hover:text-white transition-colors font-inter tracking-wide block"
                      onMouseEnter={(e) => handleHover(e.currentTarget)}
                      onMouseLeave={(e) => handleHoverExit(e.currentTarget)}
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Services */}
          <div ref={(el) => addToColumnsRef(el, 2)}>
            <h3 className="text-xl font-montserrat font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {[
                "House Cleaning",
                "Cook Services",
                "Elderly Care",
                "Kitchen Cleaning",
              ].map((service) => (
                <li key={service}>
                  <Link
                    href={`/services/${service.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-300 hover:text-white transition-colors font-inter tracking-wide block"
                    onMouseEnter={(e) => handleHover(e.currentTarget)}
                    onMouseLeave={(e) => handleHoverExit(e.currentTarget)}
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Section */}
          <div ref={(el) => addToColumnsRef(el, 3)}>
            <h3 className="text-xl font-montserrat font-bold mb-4">Follow us</h3>
            <div className="flex flex-col space-y-4">
              <p className="text-gray-300 font-inter text-sm leading-relaxed">
                Stay connected with us on social media for updates and offers.
              </p>
              <div className="flex space-x-6">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Linkedin, label: "LinkedIn" },
                  { Icon: Twitter, label: "Twitter" },
                ].map(({ Icon, label }, index) => (
                  <div
                    key={label}
                    ref={(el) => addToSocialIconsRef(el, index)}
                    onMouseEnter={(e) => handleSocialHover(e.currentTarget)}
                    onMouseLeave={(e) => handleSocialHoverExit(e.currentTarget)}
                  >
                    <Link
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                      aria-label={label}
                    >
                      <Icon size={24} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div ref={copyrightRef} className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p className="font-inter text-sm">
            © {new Date().getFullYear()} Helper Buddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
