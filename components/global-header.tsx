"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  Plus,
  Menu,
  X,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function GlobalHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(
    null
  );
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email || "",
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            undefined,
        });
      } else {
        setUser(null);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleProfile = async () => {
    window.location.href = "/profile";
  };

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/storybook", label: "Storybook", icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/storybook") {
      return pathname === "/storybook" || pathname === "/";
    }
    if (href === "/entry/new") {
      return pathname === "/entry/new";
    }
    return pathname.startsWith(href);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block border-b border-amber-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={() => {
                  window.location.assign("/");
                }}
              >
                <BookOpen className="w-8 h-8 text-amber-700" />
                <span className="font-cinzel text-2xl font-bold text-amber-900">
                  Odyscribe
                </span>
              </Link>

              {/* Navigation Links */}
              {user && (
                <nav className="flex items-center space-x-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors font-crimson ${
                          isActive(item.href)
                            ? "bg-amber-100 text-amber-900"
                            : "text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4 relative">
              {user && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
                >
                  <Link href="/entry/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                  </Link>
                </Button>
              )}
              {/* User Menu or Auth Buttons */}
              {user ? (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-700"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-label="User menu"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-amber-200 z-50 p-4">
                      <div className="mb-2">
                        <div className="font-semibold text-amber-900 font-cinzel text-lg">
                          {user.name || "User"}
                        </div>
                        <div className="text-amber-700 text-sm font-crimson truncate">
                          {user.email}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent mt-2"
                        onClick={handleProfile}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent mt-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                  >
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 font-crimson"
                  >
                    <Link href="/auth/sign-up">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden border-b border-amber-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => {
                window.location.assign("/");
              }}
            >
              <BookOpen className="w-6 h-6 text-amber-700" />
              <span className="font-cinzel text-xl font-bold text-amber-900">
                Odyscribe
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
              >
                <Link href="/entry/new">
                  <Plus className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="text-amber-700"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-amber-200 bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors font-crimson ${
                        isActive(item.href)
                          ? "bg-amber-100 text-amber-900"
                          : "text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Actions */}
              <div className="mt-4 pt-4 border-t border-amber-200 space-y-2">
                {user ? (
                  <div className="flex flex-col items-center justify-between">
                    <Button
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                      onClick={handleProfile}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-between">
                    <Button
                      asChild
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent w-full"
                    >
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 font-crimson w-full"
                    >
                      <Link href="/auth/sign-up">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
