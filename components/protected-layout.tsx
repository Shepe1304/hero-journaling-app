"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Allow unauthenticated access to /auth/* routes
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
      if (!session && !isAuthRoute) {
        router.replace("/auth/login");
      }
    };
    checkAuth();
    // Listen for auth changes
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session && !isAuthRoute) {
        router.replace("/auth/login");
      }
    });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, [pathname]);

  if (isLoading && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <p className="font-crimson text-xl text-amber-700">Loading...</p>
      </div>
    );
  }

  // If on an auth route, or authenticated, show children
  if (isAuthRoute || isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, null (redirect will happen)
  return null;
} 