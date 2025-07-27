"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface JournalChapter {
  id: string;
  title: string;
  summary: string;
  created_at: string;
}

export default function ProfilePage() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [latestEntry, setLatestEntry] = useState<JournalEntry | null>(null);
  const [latestChapter, setLatestChapter] = useState<JournalChapter | null>(
    null
  );
  const [chapters, setChapters] = useState<JournalChapter[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        // Redirect to login if no user
        window.location.href = "/login";
        return;
      }

      await fetchData(user.id);
    };

    getUser();
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);

    // 1. Latest entry for the user
    const { data: entry } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLatestEntry(entry);

    // 2. Latest chapter for the user
    const { data: chapter } = await supabase
      .from("journal_chapters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLatestChapter(chapter);

    // 3. All chapters for the user (for timeline)
    const { data: allChapters } = await supabase
      .from("journal_chapters")
      .select("id, title, created_at, summary")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    setChapters(allChapters || []);

    // 4. Get total entries count for the user
    const { count } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setTotalEntries(count || 0);

    // 5. Calculate current streak for the user (simplified)
    const { data: recentEntries } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (recentEntries && recentEntries.length > 0) {
      let streak = 1;
      let checkDate = new Date(recentEntries[0].created_at);

      for (let i = 1; i < recentEntries.length; i++) {
        const entryDate = new Date(recentEntries[i].created_at);
        const dayDiff = Math.floor(
          (checkDate.getTime() - entryDate.getTime()) / (1000 * 3600 * 24)
        );

        if (dayDiff === 1) {
          streak++;
          checkDate = entryDate;
        } else {
          break;
        }
      }
      setCurrentStreak(streak);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 font-crimson text-lg">
            Loading your journey...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-center">
          <p className="text-amber-800 font-crimson text-lg">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Every page tells your story",
      "Your journey is uniquely yours",
      "Embrace your authentic self",
      "Your words have power",
      "Keep writing your truth",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Personal Header */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white font-cinzel">
              YOU
            </span>
          </div>
          <h1 className="text-4xl font-bold text-amber-900 font-cinzel mb-2">
            {getTimeOfDayGreeting()}, Storyteller
          </h1>
          <p className="text-amber-700 font-crimson text-lg mb-4">
            {getMotivationalMessage()}
          </p>

          {/* Personal Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {totalEntries}
              </div>
              <div className="text-sm text-amber-600">Entries Written</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {chapters.length}
              </div>
              <div className="text-sm text-amber-600">Chapters Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {currentStreak}
              </div>
              <div className="text-sm text-amber-600">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Latest Entry */}
        {latestEntry && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-amber-200 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
              <CardTitle className="text-2xl font-cinzel text-amber-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Your Latest Thoughts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {latestEntry.title}
              </h3>
              <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">
                {latestEntry.content}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <span>📝</span>
                  {new Date(latestEntry.created_at).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
                <Button
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                  onClick={() => (window.location.href = `/journal`)}
                >
                  Continue Writing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Chapter */}
        {latestChapter && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-rose-200 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-rose-100 to-pink-100">
              <CardTitle className="text-2xl font-cinzel text-rose-900 flex items-center gap-2">
                <span className="text-2xl">📖</span>
                Your Latest Chapter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {latestChapter.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {latestChapter.summary}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-rose-600">
                  Created{" "}
                  {new Date(latestChapter.created_at).toLocaleDateString()}
                </p>
                <Button
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                  onClick={() =>
                    (window.location.href = `/chapter/${latestChapter.id}`)
                  }
                >
                  Read Chapter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Timeline */}
        {chapters.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-amber-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
              <CardTitle className="text-2xl font-cinzel text-amber-900 text-center">
                Your Story Timeline
              </CardTitle>
              <p className="text-center text-amber-700 font-crimson">
                Every chapter of your journey
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative">
                {/* Scrollable Timeline Container */}
                <div className="overflow-x-auto pb-4">
                  <div
                    className="relative flex items-center"
                    style={{
                      minWidth: `${chapters.length * 280 + 160}px`,
                      height: "300px",
                    }}
                  >
                    {/* Timeline Line */}
                    <div
                      className="absolute h-1 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 rounded-full shadow-sm"
                      style={{
                        top: "50%",
                        left: "80px",
                        right: "80px",
                        transform: "translateY(-50%)",
                      }}
                    />

                    {/* Timeline Nodes */}
                    {chapters.map((ch, index) => {
                      const currentDate = new Date(ch.created_at);
                      const prevDate =
                        index > 0
                          ? new Date(chapters[index - 1].created_at)
                          : null;
                      const sameDay =
                        prevDate &&
                        currentDate.getDate() === prevDate.getDate() &&
                        currentDate.getMonth() === prevDate.getMonth() &&
                        currentDate.getFullYear() === prevDate.getFullYear();

                      return (
                        <div
                          key={ch.id}
                          className="absolute flex flex-col items-center"
                          style={{
                            left: `${80 + index * 280}px`,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        >
                          {/* Content Card - Above */}
                          {index % 2 === 0 && (
                            <div className="mb-6">
                              <Link href={`/chapter/${ch.id}`}>
                                <div
                                  className={`bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border ${
                                    sameDay
                                      ? "border-green-200"
                                      : "border-amber-200"
                                  } hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group w-64`}
                                >
                                  {sameDay && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                      <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                                      Same day
                                    </div>
                                  )}
                                  <h4 className="font-semibold text-amber-900 mb-2 group-hover:text-orange-700 transition-colors">
                                    {ch.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {ch.summary ||
                                      "Click to explore this chapter of your journey..."}
                                  </p>
                                  <p className="text-xs text-amber-600 font-medium">
                                    {currentDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                    <span className="ml-2 text-gray-500">
                                      {currentDate.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </p>
                                </div>
                              </Link>
                            </div>
                          )}

                          {/* Branch */}
                          <div
                            className={`w-0.5 ${
                              sameDay
                                ? "bg-green-400"
                                : "bg-gradient-to-b from-amber-400 to-orange-400"
                            } ${index % 2 === 0 ? "h-6 mb-2" : "h-6 mt-2"}`}
                          />

                          {/* Node */}
                          <Link href={`/chapter/${ch.id}`}>
                            <div
                              className={`w-8 h-8 rounded-full border-4 border-white shadow-lg hover:scale-125 transition-all duration-300 cursor-pointer group relative z-10 ${
                                sameDay
                                  ? "bg-green-500"
                                  : "bg-gradient-to-br from-amber-500 to-orange-500"
                              }`}
                            >
                              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              {sameDay && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-100 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                          </Link>

                          {/* Branch */}
                          <div
                            className={`w-0.5 ${
                              sameDay
                                ? "bg-green-400"
                                : "bg-gradient-to-b from-amber-400 to-orange-400"
                            } ${index % 2 === 0 ? "h-6 mt-2" : "h-6 mb-2"}`}
                          />

                          {/* Content Card - Below */}
                          {index % 2 === 1 && (
                            <div className="mt-6">
                              <Link href={`/chapter/${ch.id}`}>
                                <div
                                  className={`bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border ${
                                    sameDay
                                      ? "border-green-200"
                                      : "border-amber-200"
                                  } hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group w-64`}
                                >
                                  {sameDay && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                      <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                                      Same day
                                    </div>
                                  )}
                                  <h4 className="font-semibold text-amber-900 mb-2 group-hover:text-orange-700 transition-colors">
                                    {ch.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {ch.summary ||
                                      "Click to explore this chapter of your journey..."}
                                  </p>
                                  <p className="text-xs text-amber-600 font-medium">
                                    {currentDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                    <span className="ml-2 text-gray-500">
                                      {currentDate.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </p>
                                </div>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scroll Hint */}
                <div className="text-center mt-4 text-amber-600 text-sm font-crimson">
                  ← Scroll to explore your complete journey →
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-cinzel mb-4">
            Ready to write your next chapter?
          </h2>
          <p className="font-crimson mb-6 opacity-90">
            Your story is waiting to be told. Every word matters, every moment
            counts.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => (window.location.href = `/entry/new`)}
            >
              New Journal Entry
            </Button>
            <Button
              className="bg-transparent border-2 border-white hover:bg-white hover:text-amber-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => (window.location.href = `/dashboard`)}
            >
              Create Chapter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
