"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, UserCircle2 } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/components/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.header
        className="fixed top-0 w-full z-50 bg-black"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            {/* Mobile Layout */}
            <div className="flex items-center justify-between w-full md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex flex-col justify-center items-center w-8 h-8"
                aria-label="Toggle menu">
                <div className="relative w-6 h-6">
                  <motion.span
                    animate={
                      isMenuOpen
                        ? { top: "50%", rotate: 45, y: "-50%" }
                        : { top: "25%", rotate: 0 }
                    }
                    className="absolute left-0 w-6 h-0.5 bg-white"
                  />
                  <motion.span
                    animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="absolute top-1/2 -translate-y-1/2 left-0 w-6 h-0.5 bg-white"
                  />
                  <motion.span
                    animate={
                      isMenuOpen
                        ? { bottom: "50%", rotate: -45, y: "50%" }
                        : { bottom: "25%", rotate: 0 }
                    }
                    className="absolute left-0 w-6 h-0.5 bg-white"
                  />
                </div>
              </button>

              {/* Centered Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link href="/" className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}>
                    <Image
                      src="/images/logo.jpg"
                      alt="HB Logo"
                      width={80}
                      height={50}
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </Link>
              </div>

              {/* Right Profile Icon */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer">
                <UserCircle2 className="text-white" size={28} strokeWidth={2} />
              </motion.div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between w-full">
              <Link href="/" className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Image
                    src="/images/logo.jpg"
                    alt="HB Logo"
                    width={80}
                    height={50}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </Link>

              <div className="flex items-center space-x-8">
                <NavigationMenu>
                  <NavigationMenuList className="flex gap-8">
                    {navItems.map((item) => (
                      <NavigationMenuItem key={item.label}>
                        <Link href={item.href} legacyBehavior passHref>
                          <NavigationMenuLink className="text-lg uppercase tracking-wide font-bold font-newYork text-white transition-all duration-300 hover:no-underline relative before:content-[''] before:absolute before:block before:w-full before:h-[0.5px] before:bottom-0 before:left-0 before:bg-current before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-left before:transform-gpu">
                            {item.label}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center space-x-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer">
                    <UserCircle2
                      className="text-white"
                      size={28}
                      strokeWidth={2}
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer">
                    <ShoppingCart
                      className="text-white"
                      size={28}
                      strokeWidth={2}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden">
            <div className="flex flex-col h-full px-6 pt-24">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-4 text-white text-2xl font-medium font-adallyn border-b border-gray-800 transition-colors duration-300 hover:text-gray-300">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
