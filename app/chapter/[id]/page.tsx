"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, Edit, BookOpen } from "lucide-react";
import NarrationPlayer from "@/components/narration-player";
import React from "react";

// Mock data for individual chapters - in real app this would come from API
const mockChapters: Record<string, { id: number; title: string; narrative: string; summary: string; mood: string; date: string; readTime: string; originalEntry: string }> = {
  "1": {
    id: 1,
    title: "The Marathon of Triumph",
    narrative: `The dawn broke with golden promise as our hero stood at the starting line, heart thundering like war drums in their chest. Twenty-six miles stretched ahead—a quest that would test not just the strength of their legs, but the very fiber of their spirit.

Through the early miles, doubt whispered its poison: "Turn back, this path is too arduous." But our champion pressed forward, each step a declaration of defiance against the voice of surrender. The sun climbed higher, casting long shadows that seemed to reach for their ankles, trying to drag them back to the realm of the ordinary.

At mile thirteen, the halfway point, a revelation struck like lightning. This was not merely a race against time or distance—this was a battle against every moment of self-doubt, every whispered "you cannot." The crowd's cheers became the songs of ancient bards, celebrating not just a runner, but a warrior on their most sacred journey.

The final miles transformed into a gauntlet of fire. Muscles screamed their protests, lungs burned with the effort of drawing breath, yet still our hero persevered. For they had learned the greatest truth of all: that victory is not found in the absence of struggle, but in the choice to continue despite it.

As the finish line appeared like a golden gateway to legend, tears of triumph mixed with sweat of effort. The crossing was not just the end of a race—it was the birth of a new chapter in the epic tale of a soul who dared to dream, dared to try, and dared to triumph.`,
    summary:
      "Our hero conquers their first marathon, transforming a physical challenge into a spiritual victory that proves the power of perseverance over doubt.",
    mood: "triumphant",
    date: "2024-01-15",
    readTime: "5 min",
    originalEntry:
      "Today I finally completed my **first marathon**! The feeling of crossing the finish line was *incredible*. I trained for months and there were times I wanted to quit, but I pushed through. All the early morning runs, the sore muscles, the doubt - it was all worth it in the end. I feel like I can accomplish anything now.",
  },
  "2": {
    id: 2,
    title: "The Fireside Revelation",
    narrative: `In the quiet sanctuary of home, as twilight painted the sky in shades of amber and rose, our hero found themselves drawn to the ancient ritual of fire. The hearth beckoned with promises of warmth and wisdom, its flames dancing like spirits of old, eager to share their secrets.

The book in their hands was more than mere paper and ink—it was a portal to other worlds, other lives, other truths. As the fire crackled and whispered its ancient songs, our hero felt the boundaries between reality and imagination begin to blur. Each page turned was a step deeper into the labyrinth of knowledge.

In this sacred space, where time seemed to slow and the outside world faded to a distant memory, profound realizations began to emerge. The flickering light revealed not just the words on the page, but truths hidden within the hero's own soul. This was not merely reading—this was communion with the eternal wisdom that flows through all stories, all lives, all dreams.

The fire burned lower as the night deepened, but the inner flame of understanding burned ever brighter. In the gentle glow of ember and insight, our hero discovered that the greatest adventures often happen not in distant lands, but in the quiet moments when we dare to truly see ourselves.`,
    summary:
      "In the quiet glow of firelight, profound wisdom emerges from simple moments of reflection and the timeless ritual of reading.",
    mood: "thoughtful",
    date: "2024-01-14",
    readTime: "3 min",
    originalEntry:
      "Spent the evening reading by the fireplace. There's something magical about the combination of a good book, warm fire, and quiet solitude. Made me think about how much I've grown this year.",
  },
  "4": {
    id: 4,
    title: "The Forest Sanctuary",
    narrative: `Before the world awakened, when the veil between dreams and reality was thinnest, our hero ventured into the emerald cathedral of the ancient forest. The morning mist rose like incense from the sacred ground, carrying with it the prayers of countless creatures who called this place home.

Each footstep on the moss-covered path was a meditation, a gentle communion with the earth that had witnessed countless seasons, countless stories. The trees stood as silent sentinels, their branches reaching skyward in eternal supplication, their roots delving deep into the mysteries of the earth.

The symphony of the forest began to unfold—the liquid notes of hidden streams, the percussion of woodpeckers against ancient bark, the ethereal chorus of birds greeting the dawn. Our hero felt their own heartbeat synchronize with this primal rhythm, becoming one with the pulse of life itself.

In this sanctuary of green and gold, where sunbeams filtered through the canopy like divine light through stained glass, our hero found what they had unknowingly been seeking: perfect peace. Here, in the embrace of nature's cathedral, the soul could rest, restore, and remember its connection to all living things.`,
    summary:
      "Morning mist and birdsong create a sacred space for inner peace and connection with the eternal rhythms of nature.",
    mood: "peaceful",
    date: "2024-01-12",
    readTime: "3 min",
    originalEntry:
      "Morning walk in the forest. The mist was rising from the ground and birds were singing everywhere. Felt so peaceful and connected to nature. These quiet moments are becoming more precious to me.",
  },
};

export default function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [showNarrationPlayer, setShowNarrationPlayer] = useState(false);

  const chapter = mockChapters[id];

  // If chapter doesn't exist, show not found
  if (!chapter) {
    return (
      <div className="min-h-screen parchment-bg flex items-center justify-center">
        <Card className="fantasy-border bg-white/90 backdrop-blur-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="font-cinzel text-2xl text-amber-900 mb-2">
              Chapter Not Found
            </h2>
            <p className="font-crimson text-amber-700 mb-6">
              This chapter doesn&apos;t exist in your storybook yet.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = "/storybook")}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
              >
                Browse Storybook
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePlayNarration = () => {
    setShowNarrationPlayer(true);
    const utterance = new SpeechSynthesisUtterance(chapter.narrative);

    const voices = speechSynthesis.getVoices();
    const selectedVoice =
      voices.find((voice) => voice.lang === "en-US" || voice.name.includes("Google")) ?? null;

    utterance.voice = selectedVoice;
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
  };

  const handleEditOriginal = () => {
    window.location.href = `/entry/${chapter.id}`;
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mb-2">$1</h3>'
      )
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-amber-600 underline">$1</a>'
      )
      .replace(/\n/g, "<br>");
  };

  const moodColors = {
    triumphant: "bg-yellow-100 text-yellow-800 border-yellow-300",
    thoughtful: "bg-purple-100 text-purple-800 border-purple-300",
    excited: "bg-orange-100 text-orange-800 border-orange-300",
    peaceful: "bg-green-100 text-green-800 border-green-300",
    determined: "bg-blue-100 text-blue-800 border-blue-300",
    joyful: "bg-pink-100 text-pink-800 border-pink-300",
  };

  return (
    <div className="min-h-screen parchment-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chapter Content */}
          <div className="lg:col-span-2">
            <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-amber-700"
                    >
                      Chapter {chapter.id}
                    </Badge>
                    <Badge
                      className={`${
                        moodColors[chapter.mood as keyof typeof moodColors]
                      } capitalize`}
                    >
                      {chapter.mood}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-amber max-w-none">
                  <div className="font-crimson text-base leading-relaxed text-amber-900 space-y-4">
                    {chapter.narrative
                      .split("\n\n")
                      .map((paragraph: string, index: number) => (
                        <p key={index} className="text-justify">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chapter Summary */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Chapter Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-crimson text-sm text-amber-800 leading-relaxed">
                  {chapter.summary}
                </p>
              </CardContent>
            </Card>

            {/* Narration Controls */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Narration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePlayNarration}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-crimson"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen to Narration
                </Button>
                <div className="text-sm font-crimson text-amber-700">
                  <p className="mb-2">
                    Narrator: <span className="font-semibold">Wise Sage</span>
                  </p>
                  <p>
                    Background music:{" "}
                    <span className="font-semibold">Epic Adventure</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Original Entry */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Your Original Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 p-3 rounded border border-amber-200 mb-3">
                  <div
                    className="font-crimson text-sm text-amber-800 leading-relaxed prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(chapter.originalEntry),
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditOriginal}
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Original Entry
                </Button>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                  onClick={() => (window.location.href = "/entry/new")}
                >
                  Write New Entry
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                  onClick={() => (window.location.href = "/storybook")}
                >
                  Browse All Chapters
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Narration Player */}
      <NarrationPlayer
        chapterTitle={chapter.title}  
        text={chapter.narrative}
        isVisible={showNarrationPlayer}
        onClose={() => setShowNarrationPlayer(false)}
      />
    </div>
  );
}
