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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

const Header = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const ProfileIcon = () => (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer">
      <UserCircle2
        className={status === "authenticated" ? "text-green-400" : "text-white"}
        size={28}
        strokeWidth={2}
      />
    </motion.div>
  );

  const menuVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

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

              <Link
                href="/"
                className="absolute left-1/2 transform -translate-x-1/2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Image
                    src="/images/logo2.png"
                    alt="HB Logo"
                    width={80}
                    height={50}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </Link>

              {status === "authenticated" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <ProfileIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 font-lora bg-black/95 border border-white/10">
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="text-white hover:bg-white/10 cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="text-white hover:bg-white/10 cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/orders")}
                      className="text-white hover:bg-white/10 cursor-pointer">
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/api/auth/signout")}
                      className="text-white hover:bg-white/10 cursor-pointer">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div onClick={() => router.push("/auth/login")}>
                  <ProfileIcon />
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between w-full">
              <Link href="/" className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Image
                    src="/images/logo2.png"
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
                  {status === "authenticated" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="outline-none">
                        <ProfileIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-black/95 border border-white/10">
                        <DropdownMenuItem
                          onClick={() => router.push("/profile")}
                          className="text-white hover:bg-white/10 cursor-pointer">
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/settings")}
                          className="text-white hover:bg-white/10 cursor-pointer">
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/orders")}
                          className="text-white hover:bg-white/10 cursor-pointer">
                          Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/api/auth/signout")}
                          className="text-white hover:bg-white/10 cursor-pointer">
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div onClick={() => router.push("/auth/login")}>
                      <ProfileIcon />
                    </div>
                  )}

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
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="absolute top-full left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 } 
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 text-lg font-adallyn text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: navItems.length * 0.1 }
                }}
                className="pt-4 mt-4 border-t border-white/10"
              >
                <div className="flex justify-center space-x-6">
                  {/* Add your social icons here */}
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {/* Add social icon */}
                  </motion.a>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: (navItems.length + 1) * 0.1 }
                }}
                className="text-center text-white/60 text-sm mt-6"
              >
                <p>Contact us: info@example.com</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
