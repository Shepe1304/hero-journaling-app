"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Play,
  Calendar,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Grid,
  CalendarDays,
  List,
  Edit,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Types
interface Chapter {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  summary?: string;
  cover_art?: string;
  read_time?: string;
  created_at: string;
  updated_at: string;
  has_chapter?: boolean;
  user_id?: string;
}

interface GroupedChapters {
  [date: string]: Chapter[];
}

const moodColors = {
  happy: "bg-yellow-100 text-yellow-800 border-yellow-300",
  sad: "bg-blue-100 text-blue-800 border-blue-300",
  neutral: "bg-gray-100 text-gray-800 border-gray-300",
  excited: "bg-orange-100 text-orange-800 border-orange-300",
  peaceful: "bg-green-100 text-green-800 border-green-300",
  thoughtful: "bg-purple-100 text-purple-800 border-purple-300",
};

const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  if (content == null || content.trim().length === 0) return "0 min";
  const wordCount = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
};

const generateSummary = (content: string): string => {
  if (content == null || content.trim().length === 0) return "0 min";
  // Remove markdown and get first few sentences
  const cleanContent = content
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
    .replace(/^-\s/gm, "") // Remove list markers
    .trim();

  const sentences = cleanContent
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const firstSentences = sentences.slice(0, 2).join(". ");
  return firstSentences.length > 150
    ? firstSentences.substring(0, 150) + "..."
    : firstSentences + ".";
};

const formatDateForGrouping = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateKey = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
};

const groupChaptersByDate = (chapters: Chapter[]): GroupedChapters => {
  return chapters.reduce((groups: GroupedChapters, chapter) => {
    const dateKey = formatDateKey(chapter.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(chapter);
    return groups;
  }, {});
};

// Calendar helper functions
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
};

const renderMarkdownPreview = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");

const ChapterCard = ({
  chapter,
  onView,
  onEdit,
  onPlayNarration,
}: {
  chapter: Chapter;
  onView: (id: string) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onPlayNarration: (id: string, e: React.MouseEvent) => void;
}) => (
  <div
    className="p-4 rounded-lg border border-amber-200 hover:border-amber-300 cursor-pointer transition-all duration-200 hover:shadow-md chapter-card group"
    onClick={() => onView(chapter.id)}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-crimson font-semibold text-lg text-amber-900">
                {chapter.title ||
                  `Chapter from ${new Date(
                    chapter.created_at
                  ).toLocaleDateString()}`}
              </h3>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onPlayNarration(chapter.id, e)}
                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onEdit(chapter.id, e)}
                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-amber-600">
              <span>{formatDateForGrouping(chapter.created_at)}</span>
              <span>
                {new Date(chapter.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              <span>
                {chapter.read_time || calculateReadTime(chapter.content)}
              </span>
            </div>
          </div>
        </div>
        <div
          className="text-amber-800 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownPreview(
              chapter.summary || generateSummary(chapter.content)
            ),
          }}
        />
      </div>
      <div className="ml-4 flex flex-col gap-2">
        {chapter.mood && (
          <Badge
            variant="outline"
            className={`capitalize ${
              moodColors[chapter.mood as keyof typeof moodColors] ||
              "bg-gray-100"
            }`}
          >
            {chapter.mood}
          </Badge>
        )}
        {chapter.cover_art && (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            Cover Art
          </Badge>
        )}
      </div>
    </div>
  </div>
);

export default function StorybookPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "calendar">(
    "list"
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch chapters from Supabase
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error: supabaseError } = await supabase
          .from("journal_chapters")
          .select("*")
          .order("created_at", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform the data if needed to match Chapter interface
        const transformedChapters: Chapter[] =
          data?.map((chapter) => ({
            id: chapter.id,
            title:
              chapter.title ||
              `Chapter from ${new Date(
                chapter.created_at
              ).toLocaleDateString()}`,
            content: chapter.content,
            mood: chapter.mood,
            summary: chapter.summary,
            cover_art: chapter.cover_art,
            read_time: chapter.read_time,
            created_at: chapter.created_at,
            updated_at: chapter.updated_at,
          })) || [];

        setChapters(transformedChapters);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load chapters"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const handleReadChapter = (chapterId: string) => {
    window.location.href = `/chapter/${chapterId}`;
  };

  const handleEditChapter = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement edit functionality
    window.location.href = `/chapter/${chapterId}/edit`;
  };

  const handlePlayNarration = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement narration playback
    alert(`Playing narration for chapter ${chapterId}`);
  };

  const filteredChapters = chapters
    .filter((chapter) => {
      const searchMatch =
        chapter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chapter.summary &&
          chapter.summary.toLowerCase().includes(searchTerm.toLowerCase()));

      const moodMatch = selectedMood === "all" || chapter.mood === selectedMood;

      return searchMatch && moodMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      // Handle title sorting with undefined values
      const titleA =
        a.title || `Entry from ${new Date(a.created_at).toLocaleDateString()}`;
      const titleB =
        b.title || `Entry from ${new Date(b.created_at).toLocaleDateString()}`;
      return titleA.localeCompare(titleB);
    });

  // Group filtered chapters by date
  const groupedChapters = groupChaptersByDate(filteredChapters);
  const sortedDateKeys = Object.keys(groupedChapters).sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b).getTime() - new Date(a).getTime();
    if (sortBy === "oldest")
      return new Date(a).getTime() - new Date(b).getTime();
    return new Date(b).getTime() - new Date(a).getTime(); // Default to newest
  });

  // Calendar navigation
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar rendering
  const renderCalendarView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const calendarDays = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <div className="space-y-6">
        {/* Calendar Header */}
        <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-2xl font-bold text-amber-900">
                {getMonthName(month)} {year}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 font-crimson"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-cinzel font-semibold text-amber-800 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-24"></div>;
                }

                const dateKey = `${year}-${String(month + 1).padStart(
                  2,
                  "0"
                )}-${String(day).padStart(2, "0")}`;
                const dayChapters = groupedChapters[dateKey] || [];
                const isToday =
                  new Date().toDateString() ===
                  new Date(year, month, day).toDateString();

                return (
                  <div
                    key={`day-${day}`}
                    className={`h-24 border border-amber-200 rounded-lg p-1 ${
                      isToday ? "bg-amber-100 border-amber-400" : "bg-white"
                    } hover:bg-amber-50 transition-colors`}
                  >
                    <div
                      className={`text-sm font-crimson mb-1 ${
                        isToday ? "text-amber-900 font-bold" : "text-amber-700"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayChapters.slice(0, 2).map((chapter) => (
                        <div
                          key={chapter.id}
                          className="text-xs bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-1 py-0.5 rounded cursor-pointer hover:from-amber-700 hover:to-yellow-700 transition-colors truncate"
                          onClick={() => handleReadChapter(chapter.id)}
                          title={chapter.title || "Untitled Chapter"}
                        >
                          {chapter.title || "Entry"}
                        </div>
                      ))}
                      {dayChapters.length > 2 && (
                        <div className="text-xs text-amber-600 font-crimson">
                          +{dayChapters.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-6 text-sm text-amber-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-100 border border-amber-400 rounded"></div>
                <span className="font-crimson">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded"></div>
                <span className="font-crimson">Chapter</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen parchment-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
          <h3 className="font-cinzel text-xl text-amber-900 mb-2">
            Loading your epic journey...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen parchment-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h3 className="font-cinzel text-xl text-amber-900 mb-2">
            Error loading chapters
          </h3>
          <p className="text-amber-700 font-crimson mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center bg-amber-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      : "text-amber-700 hover:bg-amber-200"
                  } font-crimson`}
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      : "text-amber-700 hover:bg-amber-200"
                  } font-crimson`}
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={`${
                    viewMode === "calendar"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      : "text-amber-700 hover:bg-amber-200"
                  } font-crimson`}
                >
                  <CalendarDays className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
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
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters and Search - Only show in list and grid view */}
        {viewMode !== "calendar" && (
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
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="peaceful">Peaceful</SelectItem>
                    <SelectItem value="thoughtful">Thoughtful</SelectItem>
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
        )}

        {/* Render based on view mode */}
        {viewMode === "calendar" ? (
          renderCalendarView()
        ) : viewMode === "list" ? (
          /* List View - Grouped Chapters by Date */
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-cinzel font-semibold">
                          {formatDateForGrouping(dateKey)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800"
                  >
                    {groupedChapters[dateKey].length} chapter
                    {groupedChapters[dateKey].length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Chapters for this date */}
                <div className="space-y-4 pl-4">
                  {groupedChapters[dateKey].map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      onView={handleReadChapter}
                      onEdit={handleEditChapter}
                      onPlayNarration={handlePlayNarration}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grouped Chapters by Date - Grid View */
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-cinzel font-semibold">
                          {formatDateForGrouping(dateKey)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800"
                  >
                    {groupedChapters[dateKey].length} chapter
                    {groupedChapters[dateKey].length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Chapters Grid for this date */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-4">
                  {groupedChapters[dateKey].map((chapter) => (
                    <Card
                      key={chapter.id}
                      className="chapter-card border-amber-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleReadChapter(chapter.id)}
                    >
                      <CardHeader className="p-0">
                        <div className="relative">
                          {chapter.cover_art ? (
                            <Image
                              src={chapter.cover_art || ""}
                              alt={chapter.title || "Untitled Chapter"}
                              width={500}
                              height={192}
                              className="w-full h-48 object-cover rounded-t-lg"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                          ) : null}

                          {/* Fallback placeholder */}
                          <div
                            className={`w-full h-48 bg-gradient-to-br from-amber-100 to-amber-200 rounded-t-lg flex items-center justify-center ${
                              chapter.cover_art ? "hidden" : ""
                            }`}
                          >
                            <ImageIcon className="w-12 h-12 text-amber-400" />
                          </div>

                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/90 hover:bg-white text-amber-700"
                              onClick={(e) =>
                                handlePlayNarration(chapter.id, e)
                              }
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <h3 className="font-cinzel font-semibold text-lg text-amber-900 mb-1 line-clamp-2">
                            {chapter.title ||
                              `Entry from ${new Date(
                                chapter.created_at
                              ).toLocaleDateString()}`}
                          </h3>
                          <div className="flex items-center text-sm text-amber-600 mb-2">
                            <span>
                              {new Date(chapter.created_at).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {chapter.read_time ||
                                calculateReadTime(chapter.content)}
                            </span>
                          </div>
                        </div>
                        <p className="font-crimson text-sm text-amber-800 leading-relaxed line-clamp-3">
                          {chapter.summary || generateSummary(chapter.content)}
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
              </div>
            ))}
          </div>
        )}

        {filteredChapters.length === 0 &&
          chapters.length > 0 &&
          viewMode !== "calendar" && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="font-cinzel text-xl text-amber-900 mb-2">
                No chapters found
              </h3>
              <p className="text-amber-700 font-crimson mb-4">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

        {chapters.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="font-cinzel text-xl text-amber-900 mb-2">
              Your storybook awaits
            </h3>
            <p className="text-amber-700 font-crimson mb-4">
              Write your first entry to begin your epic journey.
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
