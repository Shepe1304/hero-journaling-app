"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scroll, Sparkles, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const storyTones = [
  {
    id: "epic-fantasy",
    name: "Epic Fantasy",
    description: "Grand adventures with mythical elements",
    icon: "⚔️",
  },
  {
    id: "whimsical",
    name: "Whimsical",
    description: "Light-hearted and magical",
    icon: "✨",
  },
  {
    id: "dark-gothic",
    name: "Dark Gothic",
    description: "Mysterious and atmospheric",
    icon: "🌙",
  },
  {
    id: "casual-modern",
    name: "Casual Modern",
    description: "Contemporary and relatable",
    icon: "📱",
  },
];

const narratorPersonas = [
  {
    id: "wise-sage",
    name: "Wise Sage",
    description: "Ancient wisdom and guidance",
    icon: "🧙‍♂️",
  },
  {
    id: "cheeky-bard",
    name: "Cheeky Bard",
    description: "Witty and entertaining",
    icon: "🎭",
  },
  {
    id: "stoic-chronicler",
    name: "Stoic Chronicler",
    description: "Measured and thoughtful",
    icon: "📜",
  },
];

export default function OnboardingPage() {
  const [selectedTone, setSelectedTone] = useState<string>("");
  const [selectedNarrator, setSelectedNarrator] = useState<string>("");
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entryId");
  const supabase = createClient();

  const handleGetStarted = async () => {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;
      if (!user) {
        alert("You must be logged in.");
        return;
      }

      // Insert a new chapter
      const { error } = await supabase
        .from("journal_chapters")
        .insert({
          entry_id: entryId,
          user_id: user.id,
          story_tone: selectedTone,
          narrator: selectedNarrator,
          status: "draft",
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        alert("Failed to create chapter.");
        return;
      }

      // Redirect to the next step
      window.location.href = `/chapter/generate/preview?entryId=${entryId}`;
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen parchment-bg flex flex-col">
      {/* Top navigation with Auth Buttons */}
      <nav className="w-full flex justify-between items-center p-4 border-b border-amber-200 bg-white/70 backdrop-blur-sm">
        <h1 className="font-cinzel text-2xl text-amber-900">Odyscribe</h1>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition"
          >
            Log In
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg shadow hover:from-amber-700 hover:to-yellow-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Scroll className="w-16 h-16 text-amber-700" />
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="font-cinzel text-5xl font-bold text-amber-900 mb-4">
              Odyscribe
            </h1>
            <p className="font-crimson text-xl text-amber-800 mb-8">
              Write your life as an epic journey
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-yellow-500 mx-auto rounded-full"></div>
          </div>

          {/* Story Tone Selection */}
          <Card className="mb-8 fantasy-border bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-amber-700 mr-3" />
                <h2 className="font-cinzel text-2xl font-semibold text-amber-900">
                  Choose Your Story Tone
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyTones.map((tone) => (
                  <div
                    key={tone.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedTone === tone.id
                        ? "border-amber-500 bg-amber-50 shadow-md"
                        : "border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-25"
                    }`}
                    onClick={() => setSelectedTone(tone.id)}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{tone.icon}</span>
                      <h3 className="font-crimson font-semibold text-lg text-amber-900">
                        {tone.name}
                      </h3>
                    </div>
                    <p className="text-amber-700 text-sm">{tone.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Narrator Persona Selection */}
          <Card className="mb-8 fantasy-border bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-amber-700 mr-3" />
                <h2 className="font-cinzel text-2xl font-semibold text-amber-900">
                  Choose Your Narrator
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {narratorPersonas.map((narrator) => (
                  <div
                    key={narrator.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedNarrator === narrator.id
                        ? "border-amber-500 bg-amber-50 shadow-md"
                        : "border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-25"
                    }`}
                    onClick={() => setSelectedNarrator(narrator.id)}
                  >
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">
                        {narrator.icon}
                      </span>
                      <h3 className="font-crimson font-semibold text-lg text-amber-900 mb-1">
                        {narrator.name}
                      </h3>
                      <p className="text-amber-700 text-sm">
                        {narrator.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Get Started Button */}
          <div className="text-center">
            <Button
              onClick={handleGetStarted}
              disabled={!selectedTone || !selectedNarrator}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-crimson text-lg px-8 py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Your Epic Journey
            </Button>
            {(!selectedTone || !selectedNarrator) && (
              <p className="text-amber-600 text-sm mt-2">
                Please select both a story tone and narrator to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
