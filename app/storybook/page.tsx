"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, Play, Calendar } from "lucide-react";

// Mock data for chapters
const mockChapters = [
  {
    id: 1,
    title: "The Marathon of Triumph",
    date: "2024-01-15",
    mood: "triumphant",
    summary:
      "Our hero conquers their first marathon, transforming a physical challenge into a spiritual victory.",
    coverArt: "/placeholder.svg?height=200&width=150",
    readTime: "5 min",
  },
  {
    id: 2,
    title: "The Fireside Revelation",
    date: "2024-01-14",
    mood: "thoughtful",
    summary:
      "In the quiet glow of firelight, profound wisdom emerges from simple moments of reflection.",
    coverArt: "/placeholder.svg?height=200&width=150",
    readTime: "3 min",
  },
  {
    id: 3,
    title: "The Ascension to New Heights",
    date: "2024-01-13",
    mood: "excited",
    summary:
      "A career milestone becomes a stepping stone to greater adventures and possibilities.",
    coverArt: "/placeholder.svg?height=200&width=150",
    readTime: "4 min",
  },
  {
    id: 4,
    title: "The Forest Sanctuary",
    date: "2024-01-12",
    mood: "peaceful",
    summary:
      "Morning mist and birdsong create a sacred space for inner peace and connection with nature.",
    coverArt: "/placeholder.svg?height=200&width=150",
    readTime: "3 min",
  },
  {
    id: 5,
    title: "The Challenge of the Storm",
    date: "2024-01-11",
    mood: "determined",
    summary:
      "When life's tempests rage, our hero discovers the strength that lies within adversity.",
    coverArt: "/placeholder.svg?height=200&width=150",
    readTime: "6 min",
  },
  {
    id: 6,
    title: "The Feast of Friendship",
    date: "2024-01-10",
    mood: "joyful",
    summary:
      "A simple dinner with friends becomes an epic celebration of bonds that transcend time.",
    coverArt: "/placeholder.svg?height=200&width=150",
    readTime: "4 min",
  },
];

const moodColors = {
  triumphant: "bg-yellow-100 text-yellow-800 border-yellow-300",
  thoughtful: "bg-purple-100 text-purple-800 border-purple-300",
  excited: "bg-orange-100 text-orange-800 border-orange-300",
  peaceful: "bg-green-100 text-green-800 border-green-300",
  determined: "bg-blue-100 text-blue-800 border-blue-300",
  joyful: "bg-pink-100 text-pink-800 border-pink-300",
};

export default function StorybookPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleReadChapter = (chapterId: number) => {
    window.location.href = `/chapter/${chapterId}`;
  };

  const handlePlayNarration = (chapterId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement narration playback
    alert(`Playing narration for chapter ${chapterId}`);
  };

  const filteredChapters = mockChapters
    .filter(
      (chapter) =>
        chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (chapter) => selectedMood === "all" || chapter.mood === selectedMood
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="min-h-screen parchment-bg">
      {/* Header */}
      <div className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cinzel text-3xl font-bold text-amber-900">
                Your Epic Storybook
              </h1>
              <p className="font-crimson text-amber-700 mt-1">
                Browse the chapters of your legendary journey
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = "/entry/new")}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Write New Chapter
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-8 fantasy-border bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                  <Input
                    placeholder="Search your chapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-amber-200 focus:border-amber-500"
                  />
                </div>
              </div>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="w-full md:w-48 border-amber-200 focus:border-amber-500">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="triumphant">Triumphant</SelectItem>
                  <SelectItem value="thoughtful">Thoughtful</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="determined">Determined</SelectItem>
                  <SelectItem value="joyful">Joyful</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 border-amber-200 focus:border-amber-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="chapter-card border-amber-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleReadChapter(chapter.id)}
            >
              <CardHeader className="p-0">
                <div className="relative">
                  {/* <Image
                    src={chapter.coverArt || "/placeholder.svg"}
                    alt={chapter.title ?? "Chapter cover"}
                    width={500}
                    height={192}
                    className="w-full h-48 object-cover rounded-t-lg"
                  /> */}

                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-amber-700"
                      onClick={(e) => handlePlayNarration(chapter.id, e)}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
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
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-cinzel font-semibold text-lg text-amber-900 mb-1 line-clamp-2">
                    {chapter.title}
                  </h3>
                  <div className="flex items-center text-sm text-amber-600 mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(chapter.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <span className="mx-2">•</span>
                    <span>{chapter.readTime}</span>
                  </div>
                </div>
                <p className="font-crimson text-sm text-amber-800 leading-relaxed line-clamp-3">
                  {chapter.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-amber-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadChapter(chapter.id);
                    }}
                  >
                    Read Full Chapter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="font-cinzel text-xl text-amber-900 mb-2">
              No chapters found
            </h3>
            <p className="text-amber-700 font-crimson mb-4">
              Try adjusting your search or filters, or write a new chapter to
              begin your epic journey.
            </p>
            <Button
              onClick={() => (window.location.href = "/entry/new")}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
            >
              Write Your First Chapter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
