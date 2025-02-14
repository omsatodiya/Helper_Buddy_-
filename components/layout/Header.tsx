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
  Briefcase,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { useLoadingStore } from "@/store/loading-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import gsap from "gsap";

interface NavItem {
  label: string;
  href: string;
}

interface UserData {
  role: string;
  coins: number;
}

const navItems: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "SERVICES", href: "/services" },
  { label: "BLOG", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
];

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoading = useLoadingStore((state: any) => state.isLoading);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData>({ role: '', coins: 0 });
  const [coins, setCoins] = useState<number>(0);

  // Remove all GSAP-related refs and effects
  const headerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const providerButtonRef = useRef<HTMLDivElement>(null);
  const socialLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData({ role: '', coins: 0 });
        return;
      }
      
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            role: data.role || 'user',
            coins: data.coins || 0
          });
          setCoins(data.coins || 0);
        } else {
          setUserData({ role: 'user', coins: 0 });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData({ role: 'user', coins: 0 });
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const menuItems = menuItemsRef.current ? Array.from(menuItemsRef.current.children) : [];
    const providerButton = providerButtonRef.current;
    const socialLinks = socialLinksRef.current;

    // Set initial states
    gsap.set(mobileMenuRef.current, {
      display: isMenuOpen ? 'block' : 'none',
      opacity: 0,
      clipPath: 'circle(0% at 100% 0)'
    });

    if (menuItems.length > 0) {
      gsap.set(menuItems, { 
        opacity: 0,
        x: 50,
        filter: 'blur(10px)'
      });
    }

    if (providerButton) {
      gsap.set(providerButton, {
        opacity: 0,
        y: 30,
        scale: 0.9
      });
    }

    if (socialLinks) {
      gsap.set(socialLinks, {
        opacity: 0,
        y: 30
      });
    }

    // Animation timeline
    if (isMenuOpen) {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' }
      });

      tl.to(mobileMenuRef.current, {
        display: 'block',
        opacity: 1,
        clipPath: 'circle(150% at 100% 0)',
        duration: 0.6
      })
      .to(menuItems, {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out'
      }, '-=0.3')
      .to(providerButton, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.7)'
      }, '-=0.2')
      .to(socialLinks, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.2');
    } else {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' }
      });

      tl.to(socialLinks, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in'
      })
      .to(providerButton, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in'
      }, '-=0.2')
      .to(menuItems, {
        opacity: 0,
        x: -30,
        filter: 'blur(5px)',
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.in'
      }, '-=0.2')
      .to(mobileMenuRef.current, {
        clipPath: 'circle(0% at 100% 0)',
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          gsap.set(mobileMenuRef.current, { display: 'none' });
        }
      }, '-=0.3');
    }
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
                  className={`font-montserrat text-base tracking-[0.2em] font-medium transition-all duration-300 hover:no-underline relative 
                  text-white dark:text-white
                  before:content-[''] before:absolute before:block before:w-full before:h-[1px] 
                  before:bottom-0 before:left-0 before:bg-white dark:before:bg-white before:scale-x-0 
                  hover:before:scale-x-100 before:transition-transform before:duration-500 
                  before:origin-left before:transform-gpu`}
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
                  className={`font-montserrat text-base tracking-[0.2em] font-medium transition-all duration-300 hover:no-underline relative 
                  text-white dark:text-white
                  before:content-[''] before:absolute before:block before:w-full before:h-[1px] 
                  before:bottom-0 before:left-0 before:bg-white dark:before:bg-white before:scale-x-0 
                  hover:before:scale-x-100 before:transition-transform before:duration-500 
                  before:origin-left before:transform-gpu`}
                >
                  LOGIN
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
      {user && (
        <div
          onClick={() => router.push(userData.role === 'provider' ? '/provider' : '/become-provider')}
          className="cursor-pointer group relative transition-transform duration-300 hover:scale-110"
        >
          <Briefcase
            className="text-white hover:opacity-80 transition-opacity"
            size={24}
            strokeWidth={1.5}
          />
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="bg-white dark:bg-black px-3 py-2 rounded-md shadow-lg border border-black/10 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-white dark:bg-black border-t border-l border-black/10 dark:border-white/10"></div>
              <span className="text-sm text-black dark:text-white font-medium">
                {userData.role === 'provider' ? 'Provider Dashboard' : 'Become a Provider'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const AuthSection = () => (
    <div className="flex items-center gap-6">
      <ThemeToggle />
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:opacity-80 transition-opacity">
              <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center">
                <UserCircle2 className="w-5 h-5 text-white dark:text-black" strokeWidth={1.5} />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Profile
            </DropdownMenuItem>
            {userData.role === 'admin' && (
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                <ShieldCheck className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Admin Dashboard
              </DropdownMenuItem>
            )}
            {userData.role === 'provider' && (
              <DropdownMenuItem onClick={() => router.push('/provider')}>
                <Briefcase className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Provider Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full z-50 bg-black dark:bg-black">
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
              <div className="transition-transform duration-300 hover:scale-110">
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
              <div className="transition-transform duration-300 hover:scale-110">
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

            <div className="flex items-center space-x-6">
              <DesktopProfile />
              
              <div className="flex items-center space-x-6">
                <AuthSection />

                {user && (
                  <div
                    className="cursor-pointer transition-transform duration-300 hover:scale-110"
                  >
                    <ShoppingCart
                      className="text-white dark:text-white hover:opacity-80 transition-opacity"
                      size={24}
                      strokeWidth={1.5}
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
        className="fixed inset-0 top-24 md:hidden z-40 bg-black"
      >
        <div className="absolute inset-0 bg-black border-t border-white/10">
          <div className="container h-[calc(100vh-6rem)] mx-auto px-4 py-8 overflow-y-auto">
            {/* Navigation Links */}
            <nav ref={menuItemsRef} className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-2xl text-white font-montserrat tracking-[0.2em] font-medium hover:text-white/80 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth/login"
                  className="text-2xl text-white font-montserrat tracking-[0.2em] font-medium hover:text-white/80 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOGIN
                </Link>
              )}
            </nav>

            {/* Provider Button */}
            {user && (
              <div ref={providerButtonRef} className="mt-8">
                <Button
                  onClick={() => {
                    router.push(userData.role === 'provider' ? '/provider' : '/become-provider');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-white text-black hover:bg-white/90 font-montserrat text-lg py-6 flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-5 h-5" />
                  {userData.role === 'provider' ? 'Provider Dashboard' : 'Become a Provider'}
                </Button>
              </div>
            )}

            {/* Social Links */}
            <div ref={socialLinksRef} className="mt-12 flex items-center justify-center gap-12">
              <Link href="#" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2">
                <Facebook className="w-6 h-6" strokeWidth={1.25} />
              </Link>
              <Link href="#" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2">
                <Instagram className="w-6 h-6" strokeWidth={1.25} />
              </Link>
              <Link href="#" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2">
                <Twitter className="w-6 h-6" strokeWidth={1.25} />
              </Link>
              <Link href="#" className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2">
                <Linkedin className="w-6 h-6" strokeWidth={1.25} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;