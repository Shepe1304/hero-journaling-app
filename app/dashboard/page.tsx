"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  List,
  BookOpen,
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  Moon,
  Edit,
} from "lucide-react";

// ================================
// TYPES & INTERFACES
// ================================
interface JournalEntry {
  id: number;
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

interface MoodConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

interface DashboardStats {
  chaptersWritten: number;
  totalEntries: number;
  currentTone: string;
}

// ================================
// CONSTANTS & CONFIGURATION
// ================================
const MOOD_ICONS: Record<MoodType, MoodConfig> = {
  happy: { icon: Smile, color: "text-yellow-500", bg: "bg-yellow-100" },
  sad: { icon: Frown, color: "text-blue-500", bg: "bg-blue-100" },
  neutral: { icon: Meh, color: "text-gray-500", bg: "bg-gray-100" },
  excited: { icon: Zap, color: "text-orange-500", bg: "bg-orange-100" },
  peaceful: { icon: Heart, color: "text-green-500", bg: "bg-green-100" },
  thoughtful: { icon: Moon, color: "text-purple-500", bg: "bg-purple-100" },
};

// Mock data - In real app, this would come from Supabase
const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: 1,
    date: "2024-01-15",
    mood: "happy",
    preview:
      "Today I finally completed my **first marathon**! The feeling of crossing the finish line was *incredible*...",
    title: "The Marathon Victory",
    hasChapter: true,
    wordCount: 245,
  },
  {
    id: 2,
    date: "2024-01-14",
    mood: "thoughtful",
    preview:
      "Spent the evening reading by the fireplace. There's something magical about...",
    title: "Evening Reflections",
    hasChapter: true,
    wordCount: 189,
  },
  {
    id: 3,
    date: "2024-01-13",
    mood: "excited",
    preview:
      "Got the promotion I've been working towards for months. All those late nights...",
    title: "Career Milestone",
    hasChapter: false,
    wordCount: 156,
  },
  {
    id: 4,
    date: "2024-01-12",
    mood: "peaceful",
    preview:
      "Morning walk in the forest. The mist was rising from the ground and birds...",
    title: "Forest Meditation",
    hasChapter: true,
    wordCount: 203,
  },
];

// ================================
// UTILITY FUNCTIONS
// ================================
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const renderMarkdownPreview = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
};

const calculateStats = (entries: JournalEntry[]): DashboardStats => ({
  chaptersWritten: entries.filter((entry) => entry.hasChapter).length,
  totalEntries: entries.length,
  currentTone: "Epic", // This could be calculated based on recent moods
});

const navigateToEntry = (entryId: number, edit = false): void => {
  const editParam = edit ? "?edit=true" : "";
  window.location.href = `/entry/${entryId}${editParam}`;
};

// ================================
// SUB-COMPONENTS
// ================================
interface MoodIconProps {
  mood: MoodType;
}

const MoodIcon: React.FC<MoodIconProps> = ({ mood }) => {
  const moodData = MOOD_ICONS[mood] || MOOD_ICONS.neutral;
  const IconComponent = moodData.icon;

  return (
    <div className={`p-2 rounded-full ${moodData.bg}`}>
      <IconComponent className={`w-4 h-4 ${moodData.color}`} />
    </div>
  );
};

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, value, label }) => (
  <Card className="chapter-card border-amber-200">
    <CardContent className="p-6">
      <div className="flex items-center">
        <Icon className="w-8 h-8 text-amber-600 mr-3" />
        <div>
          <p className="text-2xl font-bold text-amber-900">{value}</p>
          <p className="text-sm text-amber-700 font-crimson">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface EntryCardProps {
  entry: JournalEntry;
  onView: (id: number) => void;
  onEdit: (id: number, e: React.MouseEvent) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onView, onEdit }) => (
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
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          Entry {entry.id}
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

interface StatsGridProps {
  stats: DashboardStats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <StatsCard
      icon={BookOpen}
      value={stats.chaptersWritten}
      label="Chapters Written"
    />
    <StatsCard icon={Edit} value={stats.totalEntries} label="Total Entries" />
    <StatsCard icon={Zap} value={stats.currentTone} label="Current Tone" />
  </div>
);

interface EntriesListProps {
  entries: JournalEntry[];
  onViewEntry: (id: number) => void;
  onEditEntry: (id: number, e: React.MouseEvent) => void;
}

const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  onViewEntry,
  onEditEntry,
}) => (
  <div className="space-y-4">
    {entries.map((entry) => (
      <EntryCard
        key={entry.id}
        entry={entry}
        onView={onViewEntry}
        onEdit={onEditEntry}
      />
    ))}
  </div>
);

const CalendarPlaceholder: React.FC = () => (
  <div className="text-center py-12">
    <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
    <h3 className="font-cinzel text-xl text-amber-900 mb-2">Calendar View</h3>
    <p className="text-amber-700 font-crimson">
      Calendar integration coming soon to visualize your journey timeline
    </p>
  </div>
);

// ================================
// MAIN COMPONENT
// ================================
export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list");

  // TODO: Replace with Supabase hooks/queries later
  const entries = MOCK_ENTRIES;
  const stats = calculateStats(entries);

  const handleViewEntry = (entryId: number) => {
    navigateToEntry(entryId);
  };

  const handleEditEntry = (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToEntry(entryId, true);
  };

  return (
    <div className="min-h-screen parchment-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <StatsGrid stats={stats} />

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
                  <TabsTrigger value="list" className="font-crimson">
                    <List className="w-4 h-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="font-crimson">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                  <EntriesList
                    entries={entries}
                    onViewEntry={handleViewEntry}
                    onEditEntry={handleEditEntry}
                  />
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                  <CalendarPlaceholder />
                </TabsContent>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
