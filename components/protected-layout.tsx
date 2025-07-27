"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Public routes (accessible without auth)
  const isPublicRoute = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
      if (!session && !isPublicRoute) {
        router.replace("/");
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session && !isPublicRoute) {
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <p className="font-crimson text-xl text-amber-700">Loading...</p>
      </div>
    );
  }

  // If on a public route (/, /auth/*) OR authenticated, show children
  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, null (redirect will happen)
  return null;
}
