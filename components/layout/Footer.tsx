"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const socialIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
    hover: {
      scale: 1.2,
      rotate: 15,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 8,
      },
    },
  };

  const linkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
    },
    hover: {
      x: 8,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-black text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 font-newYork md:grid-cols-4 gap-8"
        >
          {/* Company Info */}
          <motion.div variants={columnVariants} className="space-y-4">
            <Link href="/" className="block">
              <motion.h3
                className="text-xl font-bold mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Helper Buddy
              </motion.h3>
            </Link>
            <motion.p className="text-gray-300" variants={linkVariants}>
              Your trusted partner for finding reliable household services and
              professionals.
            </motion.p>
            <motion.div className="mt-4" variants={linkVariants}>
              <h4 className="font-semibold mb-2">Contact Us</h4>
              <p className="text-gray-300">Email: info@helperbuddy.in</p>
              <p className="text-gray-300">Phone: +91 XXXXX XXXXX</p>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={columnVariants}>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About Us", "Services", "Contact", "Careers"].map(
                (item, index) => (
                  <motion.li
                    key={item}
                    variants={linkVariants}
                    whileHover="hover"
                    custom={index}
                  >
                    <Link
                      href={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-300 hover:text-white transition-colors tracking-wide"
                    >
                      {item}
                    </Link>
                  </motion.li>
                )
              )}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={columnVariants}>
            <h3 className="text-xl font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {[
                "House Cleaning",
                "Cook Services",
                "Elderly Care",
                "Kitchen Cleaning",
              ].map((service, index) => (
                <motion.li
                  key={service}
                  variants={linkVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Link
                    href={`/services/${service
                      .toLowerCase()
                      .replace(" ", "-")}`}
                    className="text-gray-300 hover:text-white transition-colors tracking-wide"
                  >
                    {service}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social Media Section */}
          <motion.div variants={columnVariants}>
            <h3 className="text-xl font-bold mb-4">Follow us</h3>
            <div className="flex flex-col space-y-4">
              <motion.p className="text-gray-300 mb-4" variants={linkVariants}>
                Stay connected with us on social media for updates and offers.
              </motion.p>
              <div className="flex space-x-6">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Linkedin, label: "LinkedIn" },
                  { Icon: Twitter, label: "Twitter" },
                ].map(({ Icon, label }, index) => (
                  <motion.div
                    key={label}
                    variants={socialIconVariants}
                    whileHover="hover"
                    custom={index}
                  >
                    <Link
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                      aria-label={label}
                    >
                      <Icon size={24} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>© {new Date().getFullYear()} Helper Buddy. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
