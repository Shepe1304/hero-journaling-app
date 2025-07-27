"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  Moon,
  Edit,
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
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list");

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

  const stats = calculateStats(entries);

  const handleViewEntry = (entryId: string) => navigateToEntry(entryId);
  const handleEditEntry = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToEntry(entryId, true);
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

        {/* Entries */}
        <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-cinzel text-2xl text-amber-900">
                Your Story So Far
              </CardTitle>
              <Tabs
                value={currentView}
                onValueChange={(value) =>
                  setCurrentView(value as "list" | "calendar")
                }
              >
                <TabsList>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {currentView === "list" ? (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onView={handleViewEntry}
                    onEdit={handleEditEntry}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="font-crimson">Calendar view coming soon!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
