"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  Moon,
  Edit,
  ChevronLeft,
  ChevronRight,
  Grid,
  CalendarDays,
  Search,
} from "lucide-react";

// ================================
// TYPES
// ================================
interface JournalEntry {
  id: string;
  date: string;
  mood: MoodType;
  preview: string;
  title: string;
  hasChapter: boolean;
  wordCount: number;
}

type MoodType =
  | "happy"
  | "sad"
  | "neutral"
  | "excited"
  | "peaceful"
  | "thoughtful";

interface DashboardStats {
  chaptersWritten: number;
  totalEntries: number;
}

interface GroupedEntries {
  [date: string]: JournalEntry[];
}

// ================================
// CONFIG
// ================================
const MOOD_ICONS: Record<
  MoodType,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    bg: string;
  }
> = {
  happy: { icon: Smile, color: "text-yellow-500", bg: "bg-yellow-100" },
  sad: { icon: Frown, color: "text-blue-500", bg: "bg-blue-100" },
  neutral: { icon: Meh, color: "text-gray-500", bg: "bg-gray-100" },
  excited: { icon: Zap, color: "text-orange-500", bg: "bg-orange-100" },
  peaceful: { icon: Heart, color: "text-green-500", bg: "bg-green-100" },
  thoughtful: { icon: Moon, color: "text-purple-500", bg: "bg-purple-100" },
};

// ================================
// UTILITIES
// ================================
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const renderMarkdownPreview = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");

const calculateStats = (entries: JournalEntry[]): DashboardStats => ({
  chaptersWritten: entries.filter((e) => e.hasChapter).length,
  totalEntries: entries.length,
});

const navigateToEntry = (entryId: string, edit = false) => {
  const editParam = edit ? "?edit=true" : "";
  window.location.href = `/entry/${entryId}${editParam}`;
};

const formatDateKey = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
};

const groupEntriesByDate = (entries: JournalEntry[]): GroupedEntries => {
  return entries.reduce((groups: GroupedEntries, entry) => {
    const dateKey = formatDateKey(entry.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
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

// ================================
// COMPONENTS
// ================================
const MoodIcon = ({ mood }: { mood: MoodType }) => {
  const moodData = MOOD_ICONS[mood] || MOOD_ICONS.neutral;
  const IconComponent = moodData.icon;
  return (
    <div className={`p-2 rounded-full ${moodData.bg}`}>
      <IconComponent className={`w-4 h-4 ${moodData.color}`} />
    </div>
  );
};

const EntryCard = ({
  entry,
  onView,
  onEdit,
}: {
  entry: JournalEntry;
  onView: (id: string) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
}) => (
  <div
    className="p-4 rounded-lg border border-amber-200 hover:border-amber-300 cursor-pointer transition-all duration-200 hover:shadow-md chapter-card group"
    onClick={() => onView(entry.id)}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <MoodIcon mood={entry.mood} />
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-crimson font-semibold text-lg text-amber-900">
                {entry.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onEdit(entry.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-amber-600">
              <span>{formatDate(entry.date)}</span>
              <span>{entry.wordCount} words</span>
            </div>
          </div>
        </div>
        <div
          className="text-amber-800 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownPreview(entry.preview),
          }}
        />
      </div>
      <div className="ml-4 flex flex-col gap-2">
        <Badge
          variant="outline"
          className={`capitalize ${
            MOOD_ICONS[entry.mood as MoodType]?.bg || "bg-gray-100"
          } ${MOOD_ICONS[entry.mood as MoodType]?.color || "text-gray-700"}`}
        >
          {entry.mood}
        </Badge>
        {entry.hasChapter && (
          <Badge variant="outline" className="border-green-300 text-green-700">
            Chapter Ready
          </Badge>
        )}
      </div>
    </div>
  </div>
);

// ================================
// MAIN DASHBOARD
// ================================
export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"list" | "calendar" | "grid">(
    "list"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformed = (data || []).map((entry) => ({
          id: entry.id,
          date: entry.date || entry.created_at,
          mood: (entry.mood &&
          [
            "happy",
            "sad",
            "neutral",
            "excited",
            "peaceful",
            "thoughtful",
          ].includes(entry.mood)
            ? entry.mood
            : "neutral") as MoodType,
          preview: entry.content?.slice(0, 120) + "...",
          title:
            entry.title ||
            `Entry from ${new Date(entry.created_at).toLocaleDateString()}`,
          hasChapter: entry.has_chapter || false,
          wordCount: entry.content?.split(/\s+/).length || 0,
        }));

        setEntries(transformed);
      } catch (err) {
        console.error("Error fetching entries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleViewEntry = (entryId: string) => navigateToEntry(entryId);
  const handleEditEntry = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToEntry(entryId, true);
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      const searchMatch =
        entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.preview.toLowerCase().includes(searchTerm.toLowerCase());

      const moodMatch = selectedMood === "all" || entry.mood === selectedMood;

      return searchMatch && moodMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.title.localeCompare(b.title);
    });

  const stats = calculateStats(filteredEntries);

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

    // Group entries by date
    const groupedEntries = groupEntriesByDate(filteredEntries);

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
                const dayEntries = groupedEntries[dateKey] || [];
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
                      {dayEntries.slice(0, 2).map((entry) => (
                        <div
                          key={entry.id}
                          className="text-xs bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-1 py-0.5 rounded cursor-pointer hover:from-amber-700 hover:to-yellow-700 transition-colors truncate"
                          onClick={() => handleViewEntry(entry.id)}
                          title={entry.title || "Untitled Entry"}
                        >
                          {entry.title || "Entry"}
                        </div>
                      ))}
                      {dayEntries.length > 2 && (
                        <div className="text-xs text-amber-600 font-crimson">
                          +{dayEntries.length - 2} more
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
                <span className="font-crimson">Entry</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <p className="font-crimson text-xl text-amber-700">
          Loading your story...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen parchment-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-2xl font-bold">{stats.chaptersWritten}</p>
              <p>Chapters Written</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
              <p>Total Entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Only show in non-calendar views */}
        {currentView !== "calendar" && (
          <Card className="mb-8 fantasy-border bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
                    <Input
                      placeholder="Search your entries..."
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

        {/* Entries */}
        <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-cinzel text-2xl text-amber-900">
                Your Story So Far
              </CardTitle>
              <div className="flex items-center bg-amber-100 rounded-lg p-1">
                <Button
                  variant={currentView === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("list")}
                  className={`${
                    currentView === "list"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      : "text-amber-700 hover:bg-amber-200"
                  } font-crimson`}
                >
                  List
                </Button>
                <Button
                  variant={currentView === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("grid")}
                  className={`${
                    currentView === "grid"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      : "text-amber-700 hover:bg-amber-200"
                  } font-crimson`}
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                  className={`${
                    currentView === "calendar"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      : "text-amber-700 hover:bg-amber-200"
                  } font-crimson`}
                >
                  <CalendarDays className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {currentView === "list" ? (
              // Grouped Entries by Date - List View
              <div className="space-y-8">
                {Object.keys(groupEntriesByDate(filteredEntries))
                  .sort((a, b) => {
                    if (sortBy === "newest")
                      return new Date(b).getTime() - new Date(a).getTime();
                    if (sortBy === "oldest")
                      return new Date(a).getTime() - new Date(b).getTime();
                    return new Date(b).getTime() - new Date(a).getTime(); // Default to newest
                  })
                  .map((dateKey) => {
                    const dayEntries =
                      groupEntriesByDate(filteredEntries)[dateKey];
                    return (
                      <div key={dateKey} className="space-y-4">
                        {/* Date Header */}
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-cinzel font-semibold">
                                  {formatDate(dateKey)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800"
                          >
                            {dayEntries.length} entr
                            {dayEntries.length !== 1 ? "ies" : "y"}
                          </Badge>
                        </div>

                        {/* Entries for this date */}
                        <div className="space-y-4 pl-4">
                          {dayEntries.map((entry) => (
                            <EntryCard
                              key={entry.id}
                              entry={entry}
                              onView={handleViewEntry}
                              onEdit={handleEditEntry}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : currentView === "grid" ? (
              // Grouped Entries by Date - Grid View
              <div className="space-y-8">
                {Object.keys(groupEntriesByDate(filteredEntries))
                  .sort((a, b) => {
                    if (sortBy === "newest")
                      return new Date(b).getTime() - new Date(a).getTime();
                    if (sortBy === "oldest")
                      return new Date(a).getTime() - new Date(b).getTime();
                    return new Date(b).getTime() - new Date(a).getTime(); // Default to newest
                  })
                  .map((dateKey) => {
                    const dayEntries =
                      groupEntriesByDate(filteredEntries)[dateKey];
                    return (
                      <div key={dateKey} className="space-y-4">
                        {/* Date Header */}
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-cinzel font-semibold">
                                  {formatDate(dateKey)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800"
                          >
                            {dayEntries.length} entr
                            {dayEntries.length !== 1 ? "ies" : "y"}
                          </Badge>
                        </div>

                        {/* Entries Grid for this date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-4">
                          {dayEntries.map((entry) => (
                            <Card
                              key={entry.id}
                              className="chapter-card border-amber-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                              onClick={() => handleViewEntry(entry.id)}
                            >
                              <CardContent className="p-4">
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-cinzel font-semibold text-lg text-amber-900 line-clamp-1">
                                      {entry.title}
                                    </h3>
                                    <MoodIcon mood={entry.mood} />
                                  </div>
                                  <div className="flex items-center text-sm text-amber-600 mb-2">
                                    <span>
                                      {new Date(
                                        entry.date
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{entry.wordCount} words</span>
                                  </div>
                                </div>
                                <div
                                  className="font-crimson text-sm text-amber-800 leading-relaxed line-clamp-3 mb-4"
                                  dangerouslySetInnerHTML={{
                                    __html: renderMarkdownPreview(
                                      entry.preview
                                    ),
                                  }}
                                />
                                <div className="flex items-center justify-between pt-3 border-t border-amber-200">
                                  <Badge
                                    variant="outline"
                                    className={`capitalize ${
                                      MOOD_ICONS[entry.mood as MoodType]?.bg ||
                                      "bg-gray-100"
                                    } ${
                                      MOOD_ICONS[entry.mood as MoodType]
                                        ?.color || "text-gray-700"
                                    }`}
                                  >
                                    {entry.mood}
                                  </Badge>
                                  {entry.hasChapter && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-300 text-green-700"
                                    >
                                      Chapter Ready
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              renderCalendarView()
            )}

            {/* No results message */}
            {(currentView === "list" || currentView === "grid") &&
              filteredEntries.length === 0 &&
              entries.length > 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="font-cinzel text-xl text-amber-900 mb-2">
                    No entries found
                  </h3>
                  <p className="text-amber-700 font-crimson mb-4">
                    Try adjusting your search or filters.
                  </p>
                </div>
              )}

            {/* Empty state */}
            {entries.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="font-cinzel text-xl text-amber-900 mb-2">
                  Your story awaits
                </h3>
                <p className="text-amber-700 font-crimson mb-4">
                  Write your first entry to begin your epic journey.
                </p>
                <Button
                  onClick={() => (window.location.href = "/entry/new")}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson"
                >
                  Write Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
