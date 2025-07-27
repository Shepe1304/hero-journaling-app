"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Save,
  Share,
  VolumeX,
  Edit,
  Eye,
  Bold,
  Italic,
  List,
  Link,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import NarrationPlayer from "@/components/narration-player";
import { MusicConsentPopup } from "@/components/music-consent-popup";

interface Chapter {
  title: string;
  content: string;
  summary: string;
  narrator: string;
  storyTone: string;
  status: string;
  originalEntry?: string;
  id: string;
}

const BackgroundMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showConsentPopup, setShowConsentPopup] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleConsent = (allowed: boolean) => {
    localStorage.setItem("musicConsent", String(allowed));
    setShowConsentPopup(false);
    setIsPlaying(allowed);
  };

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(
      "/background-music/enchant-background-music.mp3"
    );
    audioRef.current.volume = volume;
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        audioRef.current.duration
      );
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <>
      {showConsentPopup && <MusicConsentPopup onConsent={handleConsent} />}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
        <button
          onClick={handleRewind}
          className="p-2 text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
          title="Rewind 10 seconds"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 19 2 12 11 5 11 19"></polygon>
            <polygon points="22 19 13 12 22 5 22 19"></polygon>
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="p-2 text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>

        <button
          onClick={handleForward}
          className="p-2 text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
          title="Forward 10 seconds"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 19 22 12 13 5 13 19"></polygon>
            <polygon points="2 19 11 12 2 5 2 19"></polygon>
          </svg>
        </button>

        <div className="flex items-center gap-2 ml-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-600"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-amber-600"
          />
        </div>
      </div>
    </>
  );
};

export default function ChapterDisplayPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const params = useParams();
  const chapterId = params?.id as string;
  const supabase = createClient();

  // Fetch chapter data on component mount
  useEffect(() => {
    const fetchChapterData = async () => {
      if (!supabase || !chapterId) {
        setError("Missing Supabase client or entry ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Get the chapter record
        const { data: chapterData, error: chapterError } = await supabase
          .from("journal_chapters")
          .select("*")
          .eq("id", chapterId)
          .single();

        if (chapterError || !chapterData) {
          throw new Error("Failed to fetch chapter data.");
        }

        // Get the original entry if we have entry_id
        let originalEntry = "";
        if (chapterData.entry_id) {
          const { data: entryData } = await supabase
            .from("journal_entries")
            .select("content")
            .eq("id", chapterData.entry_id)
            .single();

          originalEntry = entryData?.content || "";
        }

        const fullChapter = {
          ...chapterData,
          originalEntry,
        };

        setChapter(fullChapter);
        setEditTitle(chapterData.title || "");
        setEditContent(chapterData.content || "");
        setEditSummary(chapterData.summary || "");
      } catch (err) {
        console.error("Error fetching chapter", err);
        // setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [chapterId, supabase]);

  const handleBack = () => {
    window.location.href = "/storybook";
  };

  const handlePlayNarration = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSaveChapter = () => {
    setIsSaved(true);
    setTimeout(() => {
      window.location.href = "/storybook";
    }, 1000);
  };

  const handleShare = () => {
    alert("Sharing functionality coming soon!");
  };

  const handleSaveEdits = async () => {
    if (!chapter) return;

    try {
      const { error } = await supabase
        .from("journal_chapters")
        .update({
          title: editTitle,
          content: editContent,
          summary: editSummary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chapter.id);

      if (error) throw error;

      // Update local state
      setChapter({
        ...chapter,
        title: editTitle,
        content: editContent,
        summary: editSummary,
      });

      setShowEdit(false);
      alert("Chapter updated successfully!");
    } catch (error) {
      console.error("Error saving edits:", error);
      alert("Failed to save changes.");
    }
  };

  const handleCancelEdit = () => {
    setShowEdit(false);
    setEditTitle(chapter?.title || "");
    setEditContent(chapter?.content || "");
    setEditSummary(chapter?.summary || "");
    setActiveTab("write");
  };

  const insertMarkdown = (before: string, after = "") => {
    const textarea = document.getElementById(
      "chapter-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    const newText =
      editContent.substring(0, start) +
      before +
      selectedText +
      after +
      editContent.substring(end);

    setEditContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mb-2 text-amber-900">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold mb-3 text-amber-900">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mb-4 text-amber-900">$1</h1>'
      )
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-amber-600 underline hover:text-amber-800">$1</a>'
      )
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, "<br>");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="font-serif text-lg text-amber-700">
            Loading your epic chapter...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-lg text-red-700 mb-4">
            {error || "Failed to load chapter."}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <div className="border-b border-amber-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 flex items-center px-3 py-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-amber-900 font-serif">
                  Your Epic Chapter
                </h1>
                <p className="text-amber-700 mt-1 font-serif">
                  {showEdit
                    ? "Edit your story"
                    : "Behold your story, transformed"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!showEdit && (
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg font-serif bg-white/70 transition-colors"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </button>
              )}
              <button
                onClick={handleSaveChapter}
                disabled={isSaved}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-lg font-serif transition-colors disabled:opacity-70"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaved ? "Saved!" : "Save Chapter"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chapter Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {showEdit ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border border-amber-200 rounded-md focus:border-amber-500 font-serif text-2xl text-amber-900 bg-transparent"
                        placeholder="Chapter title..."
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-amber-900 mb-2 font-serif">
                        {chapter.title}
                      </h2>
                    )}
                    {!showEdit && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 border border-amber-300 text-amber-700 rounded-full text-sm font-serif bg-white/70">
                          Generated Chapter
                        </span>
                        <span className="px-3 py-1 border border-blue-300 text-blue-700 rounded-full text-sm font-serif bg-white/70 capitalize">
                          {chapter.storyTone?.replace("-", " ") ||
                            "Epic Fantasy"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!showEdit ? (
                      <>
                        <button
                          onClick={handlePlayNarration}
                          className="flex items-center px-4 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg bg-white/70 transition-colors"
                        >
                          {isPlaying ? (
                            <>
                              <VolumeX className="w-4 h-4 mr-2" /> Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" /> Listen
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowEdit(true)}
                          className="flex items-center px-4 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg bg-white/70 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => insertMarkdown("**", "**")}
                          className="p-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded bg-white/70 transition-colors"
                          title="Bold"
                        >
                          <Bold className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => insertMarkdown("*", "*")}
                          className="p-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded bg-white/70 transition-colors"
                          title="Italic"
                        >
                          <Italic className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => insertMarkdown("- ")}
                          className="p-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded bg-white/70 transition-colors"
                          title="List"
                        >
                          <List className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => insertMarkdown("[", "](url)")}
                          className="p-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded bg-white/70 transition-colors"
                          title="Link"
                        >
                          <Link className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleSaveEdits}
                          className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded bg-white/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {showEdit ? (
                  <div className="w-full">
                    {/* Tab Navigation */}
                    <div className="flex mb-4 border-b border-amber-200">
                      <button
                        onClick={() => setActiveTab("write")}
                        className={`flex items-center px-4 py-2 font-serif transition-colors ${
                          activeTab === "write"
                            ? "border-b-2 border-amber-600 text-amber-900"
                            : "text-amber-700 hover:text-amber-900"
                        }`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Write
                      </button>
                      <button
                        onClick={() => setActiveTab("preview")}
                        className={`flex items-center px-4 py-2 font-serif transition-colors ${
                          activeTab === "preview"
                            ? "border-b-2 border-amber-600 text-amber-900"
                            : "text-amber-700 hover:text-amber-900"
                        }`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "write" ? (
                      <textarea
                        id="chapter-textarea"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-[500px] p-4 border border-amber-200 rounded-md focus:border-amber-500 resize-none font-serif text-base leading-relaxed bg-white"
                        placeholder="Edit your chapter here..."
                      />
                    ) : (
                      <div className="min-h-[500px] p-4 border border-amber-200 rounded-md bg-amber-50/30">
                        <div
                          className="font-serif text-base leading-relaxed text-amber-900 prose prose-amber max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: `<p class="mb-4">${renderMarkdown(
                              editContent || ""
                            )}</p>`,
                          }}
                        />
                      </div>
                    )}

                    <div className="mt-4 text-sm text-amber-600 font-serif">
                      {editContent.length} characters • Use markdown formatting
                      to enhance your chapter
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-amber max-w-none">
                    <div
                      className="font-serif text-base leading-relaxed text-amber-900 space-y-4"
                      dangerouslySetInnerHTML={{
                        __html: `<p class="mb-4">${renderMarkdown(
                          chapter.content || ""
                        )}</p>`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chapter Summary */}
            <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-amber-100">
                <h3 className="text-lg font-bold text-amber-900 font-serif">
                  Chapter Summary
                </h3>
              </div>
              <div className="p-4">
                {showEdit ? (
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full min-h-[100px] p-3 border border-amber-200 rounded-md focus:border-amber-500 resize-none font-serif text-sm bg-white"
                    placeholder="Edit chapter summary..."
                  />
                ) : (
                  <p className="font-serif text-sm text-amber-800 leading-relaxed">
                    {chapter.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Narration Info */}
            <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-amber-100">
                <h3 className="text-lg font-bold text-amber-900 font-serif">
                  Narration
                </h3>
              </div>
              <div className="p-4 space-y-2 text-sm font-serif text-amber-700">
                <p>
                  Narrator:{" "}
                  <span className="font-semibold capitalize">
                    {chapter.narrator?.replace("-", " ") || "Wise Sage"}
                  </span>
                </p>
                <p>
                  Story Tone:{" "}
                  <span className="font-semibold capitalize">
                    {chapter.storyTone?.replace("-", " ") || "Epic Fantasy"}
                  </span>
                </p>
                <p>
                  Background music:{" "}
                  <span className="font-semibold">Epic Adventure</span>
                </p>
              </div>
            </div>

            {/* Markdown Guide (only in edit mode) */}
            {showEdit && (
              <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-amber-100">
                  <h3 className="text-lg font-bold text-amber-900 font-serif">
                    Markdown Guide
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm font-serif text-amber-700">
                    <div className="flex justify-between">
                      <span>**Bold**</span>
                      <span className="font-bold">Bold</span>
                    </div>
                    <div className="flex justify-between">
                      <span>*Italic*</span>
                      <span className="italic">Italic</span>
                    </div>
                    <div className="flex justify-between">
                      <span># Heading</span>
                      <span className="font-semibold">Heading</span>
                    </div>
                    <div className="flex justify-between">
                      <span>- List item</span>
                      <span>• List item</span>
                    </div>
                    <div className="flex justify-between">
                      <span>[Link](url)</span>
                      <span className="text-amber-600 underline">Link</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Original Entry */}
            {chapter.originalEntry && (
              <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-amber-100">
                  <h3 className="text-lg font-bold text-amber-900 font-serif">
                    Your Original Entry
                  </h3>
                </div>
                <div className="p-4">
                  <div className="bg-amber-50 p-3 rounded border border-amber-200">
                    <div
                      className="font-serif text-sm text-amber-800 leading-relaxed prose prose-amber max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: `<p>${renderMarkdown(
                          chapter.originalEntry || ""
                        )}</p>`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {!showEdit && chapter && (
        <NarrationPlayer
          chapterTitle={chapter.title}
          text={chapter.content}
          tone={chapter.storyTone}
          isVisible={isPlaying}
          onClose={() => setIsPlaying(false)}
        />
      )}
      {isPlaying && <div style={{ height: "200px" }} />}
      <BackgroundMusicPlayer />
    </div>
  );
}
