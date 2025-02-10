"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  UserCircle2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  User,
  Coins,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { auth } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { useLoadingStore } from "@/store/loading-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoading = useLoadingStore((state: any) => state.isLoading);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [coins, setCoins] = useState<number>(0);

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const socialLinksRef = useRef<HTMLDivElement>(null);

  // Header animation when loading completes
  useEffect(() => {
    if (!isLoading && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }
  }, [isLoading]);

  // Mobile menu animations
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMenuOpen) {
        // Reset display to block and set initial state
        gsap.set(mobileMenuRef.current, { 
          display: "block",
          clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)"
        });

        // Animate menu background with circular reveal
        gsap.to(mobileMenuRef.current, {
          clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)",
          duration: 0.75,
          ease: "power3.inOut"
        });

        // Animate menu items with staggered fade and slide
        menuItemsRef.current.forEach((item, index) => {
          if (item) {
            gsap.fromTo(item,
              { 
                opacity: 0,
                x: -30,
                rotate: -5
              },
              {
                opacity: 1,
                x: 0,
                rotate: 0,
                duration: 0.5,
                delay: 0.3 + index * 0.1,
                ease: "power2.out"
              }
            );
          }
        });
      } else {
        // Animate menu background with circular hide
        gsap.to(mobileMenuRef.current, {
          clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)",
          duration: 0.5,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(mobileMenuRef.current, { display: "none" });
          }
        });
      }
    }
  }, [isMenuOpen]);

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (!user) return;
      
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCoins(userDoc.data().coins || 0);
        }
      } catch (error) {
        console.error("Error fetching coins:", error);
      }
    };

    fetchUserCoins();
  }, [user]);

  const handleHoverScale = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleHoverScaleExit = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleTapScale = (target: HTMLElement) => {
    gsap.to(target, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    });
  };

  const addToMenuItemsRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !menuItemsRef.current.includes(el)) {
      menuItemsRef.current[index] = el;
    }
  };

  const DesktopProfile = () => (
    <div className="flex items-center space-x-8">
      <NavigationMenu>
        <NavigationMenuList className="flex gap-8">
          {navItems.map((item) => (
            <NavigationMenuItem key={item.label}>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink 
                  className="text-lg uppercase tracking-wide font-montserrat transition-all duration-300 hover:no-underline relative 
                  text-white dark:text-white
                  before:content-[''] before:absolute before:block before:w-full before:h-[0.5px] 
                  before:bottom-0 before:left-0 before:bg-white dark:before:bg-white before:scale-x-0 
                  hover:before:scale-x-100 before:transition-transform before:duration-300 
                  before:origin-left before:transform-gpu"
                >
                  {item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
          {!user && (
            <NavigationMenuItem>
              <Link href="/auth/login" legacyBehavior passHref>
                <NavigationMenuLink 
                  className="text-lg uppercase tracking-wide font-montserrat transition-all duration-300 hover:no-underline relative 
                  text-white dark:text-white
                  before:content-[''] before:absolute before:block before:w-full before:h-[0.5px] 
                  before:bottom-0 before:left-0 before:bg-white dark:before:bg-white before:scale-x-0 
                  hover:before:scale-x-100 before:transition-transform before:duration-300 
                  before:origin-left before:transform-gpu"
                >
                  Login
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
      {user && (
        <div className="flex items-center gap-2 text-white">
          <Coins className="h-4 w-4" />
          <span className="text-sm font-medium">{coins}</span>
        </div>
      )}
    </div>
  );

  const AuthSection = () => (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      {user && (
        <div
          onClick={() => router.push("/profile")}
          className="cursor-pointer"
          onMouseEnter={(e) => handleHoverScale(e.currentTarget)}
          onMouseLeave={(e) => handleHoverScaleExit(e.currentTarget)}
          onMouseDown={(e) => handleTapScale(e.currentTarget)}
        >
          <User
            className="text-green-400 hover:opacity-80 transition-opacity"
            size={28}
            strokeWidth={2}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {!isLoading && (
        <header
          ref={headerRef}
          className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm opacity-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-24">
              {/* Mobile Layout */}
              <div className="flex items-center justify-between w-full md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex flex-col justify-center items-center w-8 h-8 z-50"
                  aria-label="Toggle menu">
                  <div className="relative w-6 h-6">
                    <span
                      className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                        isMenuOpen
                          ? "top-1/2 -translate-y-1/2 rotate-45"
                          : "top-1/4 rotate-0"
                      }`}
                    />
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 left-0 w-6 h-0.5 bg-white transition-opacity duration-300 ${
                        isMenuOpen ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <span
                      className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                        isMenuOpen
                          ? "bottom-1/2 translate-y-1/2 -rotate-45"
                          : "bottom-1/4 rotate-0"
                      }`}
                    />
                  </div>
                </button>

                <Link
                  href="/"
                  className="absolute left-1/2 transform -translate-x-1/2">
                  <div
                    onMouseEnter={(e) => handleHoverScale(e.currentTarget)}
                    onMouseLeave={(e) => handleHoverScaleExit(e.currentTarget)}>
                    <Image
                      src="/images/logo2.png"
                      alt="HB Logo"
                      width={80}
                      height={50}
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>

                {/* Mobile Layout - Profile Icon */}
                <AuthSection />
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between w-full">
                <Link href="/" className="relative">
                  <div
                    onMouseEnter={(e) => handleHoverScale(e.currentTarget)}
                    onMouseLeave={(e) => handleHoverScaleExit(e.currentTarget)}>
                    <Image
                      src="/images/logo2.png"
                      alt="HB Logo"
                      width={80}
                      height={50}
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>

                <div className="flex items-center space-x-8">
                  <DesktopProfile />

                  <div className="flex items-center space-x-6">
                    <AuthSection />

                    {user && (
                      <div
                        className="cursor-pointer"
                        onMouseEnter={(e) => handleHoverScale(e.currentTarget)}
                        onMouseLeave={(e) => handleHoverScaleExit(e.currentTarget)}
                        onMouseDown={(e) => handleTapScale(e.currentTarget)}
                      >
                        <ShoppingCart
                          className="text-white dark:text-white hover:opacity-80 transition-opacity"
                          size={28}
                          strokeWidth={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            className="fixed left-0 right-0 top-24 h-[calc(100vh-6rem)] bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-lg border-t border-white/10 shadow-2xl md:hidden overflow-y-auto"
            style={{ display: "none" }}>
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />
                
                {/* Menu items */}
                <div className="space-y-0">
                  {navItems.map((item, index) => (
                    <div
                      key={item.label}
                      ref={(el) => addToMenuItemsRef(el, index)}
                      className="opacity-0">
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="group block">
                        <div className="relative py-5 px-8">
                          {/* Background hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2" />
                          
                          {/* Menu item content */}
                          <div className="relative flex items-center justify-between">
                            {/* Text */}
                            <span className="text-4xl font-montserrat text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-2">
                              {item.label}
                            </span>

                            {/* Arrow indicator */}
                            <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <svg
                                className="w-6 h-6 text-white/70"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {/* Divider - only show between items */}
                      {index < navItems.length - 1 && (
                        <div className="mx-8">
                          <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                        </div>
                      )}
                    </div>
                  ))}
                  {!user && (
                    <div
                      ref={(el) => addToMenuItemsRef(el, navItems.length)}
                      className="opacity-0">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="group block">
                        <div className="relative py-5 px-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2" />
                          <div className="relative flex items-center justify-between">
                            <span className="text-4xl font-montserrat text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-2">
                              Login
                            </span>
                            <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <svg
                                className="w-6 h-6 text-white/70"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
