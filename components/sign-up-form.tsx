"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/protected` },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google" });
    setIsLoading(false);
  };

  return (
    <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-center mb-2">
          <Scroll className="w-12 h-12 text-amber-700" />
        </div>
        <CardTitle className="font-cinzel text-center text-4xl text-amber-900">
          Begin Your Quest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-8">
        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              className="pl-12 h-12 text-lg border-amber-200 focus:border-amber-500"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              className="pl-12 h-12 text-lg border-amber-200 focus:border-amber-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
            <Input
              id="password"
              type="password"
              placeholder="Create password"
              className="pl-12 h-12 text-lg border-amber-200 focus:border-amber-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
            <Input
              id="repeat-password"
              type="password"
              placeholder="Repeat password"
              className="pl-12 h-12 text-lg border-amber-200 focus:border-amber-500"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-base text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-amber-200" />
          </div>
          <div className="relative flex justify-center text-base uppercase">
            <span className="bg-white px-2 text-amber-600 font-crimson">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full border-amber-200 hover:bg-amber-50 font-crimson bg-transparent text-lg"
          disabled={isLoading}
        >
          Continue with Google
        </Button>
        <div className="mt-4 text-center text-base">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
