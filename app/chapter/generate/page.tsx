"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Save, Share, Volume2, VolumeX } from "lucide-react";

const generatedChapter = {
  title: "The Marathon of Triumph",
  narrative: `The dawn broke with golden promise as our hero stood at the starting line, heart thundering like war drums in their chest. Twenty-six miles stretched ahead—a quest that would test not just the strength of their legs, but the very fiber of their spirit.

Through the early miles, doubt whispered its poison: "Turn back, this path is too arduous." But our champion pressed forward, each step a declaration of defiance against the voice of surrender. The sun climbed higher, casting long shadows that seemed to reach for their ankles, trying to drag them back to the realm of the ordinary.

At mile thirteen, the halfway point, a revelation struck like lightning. This was not merely a race against time or distance—this was a battle against every moment of self-doubt, every whispered "you cannot." The crowd's cheers became the songs of ancient bards, celebrating not just a runner, but a warrior on their most sacred journey.

The final miles transformed into a gauntlet of fire. Muscles screamed their protests, lungs burned with the effort of drawing breath, yet still our hero persevered. For they had learned the greatest truth of all: that victory is not found in the absence of struggle, but in the choice to continue despite it.

As the finish line appeared like a golden gateway to legend, tears of triumph mixed with sweat of effort. The crossing was not just the end of a race—it was the birth of a new chapter in the epic tale of a soul who dared to dream, dared to try, and dared to triumph.`,
  summary:
    "Our hero conquers their first marathon, transforming a physical challenge into a spiritual victory that proves the power of perseverance over doubt.",
  mood: "triumphant",
  originalEntry:
    "Today I finally completed my first marathon. The feeling of crossing the finish line was incredible. I trained for months and there were times I wanted to quit, but I pushed through. All the early morning runs, the sore muscles, the doubt - it was all worth it in the end. I feel like I can accomplish anything now.",
};

export default function ChapterGeneratePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  const handlePlayNarration = () => {
    setIsPlaying(!isPlaying);
    // Simulate audio playback
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 5000);
    }
  };

  const handleSaveChapter = () => {
    setIsSaved(true);
    setTimeout(() => {
      window.location.href = "/storybook";
    }, 1000);
  };

  const handleShare = () => {
    // Implement sharing functionality
    alert("Sharing functionality coming soon!");
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

  return (
    <div className="min-h-screen parchment-bg">
      {/* Header */}
      <div className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mr-4 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-cinzel text-3xl font-bold text-amber-900">
                  Your Epic Chapter
                </h1>
                <p className="font-crimson text-amber-700 mt-1">
                  Behold your story, transformed
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleSaveChapter}
                disabled={isSaved}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaved ? "Saved!" : "Save Chapter"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chapter Content */}
          <div className="lg:col-span-2">
            <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-cinzel text-2xl text-amber-900 mb-2">
                      {generatedChapter.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-amber-300 text-amber-700"
                      >
                        Chapter 25
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-300 text-green-700 capitalize"
                      >
                        {generatedChapter.mood}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handlePlayNarration}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Listen
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-amber max-w-none">
                  <div className="font-crimson text-base leading-relaxed text-amber-900 space-y-4">
                    {generatedChapter.narrative
                      .split("\n\n")
                      .map((paragraph, index) => (
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
                  {generatedChapter.summary}
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
                  {isPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      Stop Narration
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen to Narration
                    </>
                  )}
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
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <div
                    className="font-crimson text-sm text-amber-800 leading-relaxed prose prose-amber max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(generatedChapter.originalEntry),
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                  onClick={() => (window.location.href = "/entry/new")}
                >
                  Write Another Entry
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                  onClick={() => (window.location.href = "/storybook")}
                >
                  View Storybook
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
