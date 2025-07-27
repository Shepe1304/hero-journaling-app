"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Feather, Headphones, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col parchment-bg">
      {/* Hero Section */}
      <section className="flex-1 flex items-center text-center px-4 py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-cinzel text-5xl font-bold text-amber-900 mb-6">
            Turn Your Life into an Epic Story
          </h2>
          <p className="font-crimson text-xl text-amber-700 mb-8">
            Journal your daily adventures. Watch them transform into chapters of
            your personal Hero’s Journey — now with narration and music for full
            immersion.
          </p>
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-crimson text-lg px-8 py-4"
            >
              Begin Your Chronicle
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="font-cinzel text-3xl text-amber-900 text-center mb-12">
            Your Adventure Awaits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Feather className="w-10 h-10 text-amber-600" />}
              title="Epic Journaling"
              description="Write your reflections in a fantasy-themed journal. Support for markdown and moods makes your entries expressive and fun."
            />
            <FeatureCard
              icon={<Sparkles className="w-10 h-10 text-amber-600" />}
              title="Hero’s Journey Chapters"
              description="AI transforms your raw thoughts into epic chapters — complete with titles, summaries, and an adventure tone of your choice."
            />
            <FeatureCard
              icon={<Headphones className="w-10 h-10 text-amber-600" />}
              title="Narration Mode"
              description="Listen to your journey come alive with voice narration and background music, turning your journal into an audiobook-like experience."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-amber-100 to-yellow-50 text-center">
        <h3 className="font-cinzel text-4xl text-amber-900 mb-6">
          Ready to Begin Your Hero’s Journey?
        </h3>
        <Link href="/auth/sign-up">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-crimson text-lg px-8 py-4"
          >
            Start Writing Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-white py-6">
        <div className="max-w-6xl mx-auto text-center text-amber-700 font-crimson">
          © {new Date().getFullYear()} Hero’s Chronicle. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="p-6 border border-amber-200 rounded-lg bg-amber-50/50 hover:shadow-lg transition">
    <div className="flex justify-center mb-4">{icon}</div>
    <h4 className="font-cinzel text-xl text-amber-900 mb-2 text-center">
      {title}
    </h4>
    <p className="font-crimson text-amber-700 text-center">{description}</p>
  </div>
);
