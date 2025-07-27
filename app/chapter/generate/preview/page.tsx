"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NarrationPlayer from "@/components/narration-player";
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

interface Chapter {
  id: string;
  title: string;
  content: string;
  summary: string;
  storyTone: string;
  narrator: string;
  narrative: string;
  originalEntry: string;
  chapterId: string;
}

export default function ChapterGeneratePage() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entryId");
  const supabase = createClient();

  const [chapter, setChapter] = useState<Chapter>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");

  // Fetch & generate chapter on mount
  useEffect(() => {
    let hasFetched = false;
    const fetchAndGenerateChapter = async () => {
      if (hasFetched) return;
      hasFetched = true;
      try {
        setLoading(true);

        // 1. Get the journal entry content
        const { data: entry, error: entryError } = await supabase
          .from("journal_entries")
          .select("title, content, mood")
          .eq("id", entryId)
          .single();

        if (entryError || !entry) throw new Error("Failed to fetch entry.");

        // 2. Get the chapter record with tone and narrator preferences
        const { data: chapterRecord, error: chapterError } = await supabase
          .from("journal_chapters")
          .select("*")
          .eq("entry_id", entryId)
          .single();

        if (chapterError || !chapterRecord)
          throw new Error("Failed to fetch chapter record.");

        // 3. Generate chapter using our API route
        const response = await fetch("/api/generate-chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: entry.title,
            entry: entry.content,
            storyTone: chapterRecord.story_tone,
            narrator: chapterRecord.narrator,
          }),
        });

        if (!response.ok) throw new Error("Failed to generate chapter.");
        const generated = await response.json();

        // 4. Update the chapter record with generated content
        const { error: updateError } = await supabase
          .from("journal_chapters")
          .update({
            title: generated.title,
            content: generated.narrative,
            summary: generated.summary,
            status: "completed",
          })
          .eq("id", chapterRecord.id)
          .select()
          .single();

        if (updateError) throw new Error("Failed to save chapter.");

        // 5. Update the journal entry to mark it as having a chapter
        await supabase
          .from("journal_entries")
          .update({ has_chapter: true })
          .eq("id", entryId);

        const chapterData: Chapter = {
          id: chapterRecord.id,
          title: generated.title,
          content: generated.narrative,
          summary: generated.summary,
          narrator: chapterRecord.narrator,
          storyTone: chapterRecord.story_tone,
          narrative: generated.narrative,
          originalEntry: entry.content,
          chapterId: chapterRecord.id,
        };

        setChapter(chapterData);
        setEditTitle(generated.title);
        setEditContent(generated.narrative);
        setEditSummary(generated.summary);
      } catch (err) {
        console.error(err);
        alert("Something went wrong while generating the chapter: ");
      } finally {
        setLoading(false);
      }
    };

    if (entryId) {
      fetchAndGenerateChapter();
    }
  }, []);

  const handleBack = () => (window.location.href = "/dashboard");

  const handlePlayNarration = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSaveChapter = () => {
    setIsSaved(true);
    setTimeout(() => (window.location.href = "/storybook"), 1000);
  };

  const handleShare = () => alert("Sharing functionality coming soon!");

  const handleSaveEdits = async () => {
    try {
      const { error } = await supabase
        .from("journal_chapters")
        .update({
          title: editTitle,
          content: editContent,
          summary: editSummary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chapter?.chapterId);

      if (error) throw error;

      // Update local state
      setChapter((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle,
              narrative: editContent,
              summary: editSummary,
            }
          : undefined
      );

      setShowEdit(false);
      alert("Chapter updated successfully!");
    } catch (error) {
      console.error("Error saving edits:", error);
      alert("Failed to save changes.");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen parchment-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="font-crimson text-lg text-amber-700">
            Generating your epic chapter...
          </p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen parchment-bg flex items-center justify-center">
        <div className="text-center">
          <p className="font-crimson text-lg text-red-700 mb-4">
            Failed to generate chapter.
          </p>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
                  <div className="flex-1">
                    {showEdit ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border border-amber-200 rounded-md focus:border-amber-500 font-cinzel text-2xl text-amber-900 bg-transparent"
                        placeholder="Chapter title..."
                      />
                    ) : (
                      <CardTitle className="font-cinzel text-2xl text-amber-900 mb-2">
                        {chapter.title}
                      </CardTitle>
                    )}
                    {!showEdit && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="border-amber-300 text-amber-700"
                        >
                          Generated Chapter
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-blue-300 text-blue-700 capitalize"
                        >
                          {chapter.storyTone}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!showEdit ? (
                      <>
                        <Button
                          onClick={handlePlayNarration}
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
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
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowEdit(true)}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => insertMarkdown("**", "**")}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                          title="Bold"
                        >
                          <Bold className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => insertMarkdown("*", "*")}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                          title="Italic"
                        >
                          <Italic className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => insertMarkdown("- ")}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                          title="List"
                        >
                          <List className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => insertMarkdown("[", "](url)")}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                          title="Link"
                        >
                          <Link className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={handleSaveEdits}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEdit(false);
                            setEditTitle(chapter.title);
                            setEditContent(chapter.narrative);
                            setEditSummary(chapter.summary);
                          }}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showEdit ? (
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="write" className="font-crimson">
                        <Edit className="w-4 h-4 mr-2" />
                        Write
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="font-crimson">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="write">
                      <Textarea
                        id="chapter-textarea"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[500px] border-amber-200 focus:border-amber-500 resize-none font-crimson text-base leading-relaxed"
                        placeholder="Edit your chapter here..."
                      />
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="min-h-[500px] p-4 border border-amber-200 rounded-md bg-amber-50/30">
                        <div
                          className="font-crimson text-base leading-relaxed text-amber-900 prose prose-amber max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: `<p class="mb-4">${renderMarkdown(
                              editContent || ""
                            )}</p>`,
                          }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="prose prose-amber max-w-none">
                    <div
                      className="font-crimson text-base leading-relaxed text-amber-900 space-y-4"
                      dangerouslySetInnerHTML={{
                        __html: `<p class="mb-4">${renderMarkdown(
                          chapter.narrative || ""
                        )}</p>`,
                      }}
                    />
                  </div>
                )}

                {showEdit && (
                  <div className="mt-4 text-sm text-amber-600 font-crimson">
                    {editContent.length} characters • Use markdown formatting to
                    enhance your chapter
                  </div>
                )}
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
                {showEdit ? (
                  <Textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="min-h-[100px] border-amber-200 focus:border-amber-500 resize-none font-crimson text-sm"
                    placeholder="Edit chapter summary..."
                  />
                ) : (
                  <p className="font-crimson text-sm text-amber-800 leading-relaxed">
                    {chapter.summary}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Narration Info */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Narration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-crimson text-amber-700">
                <p>
                  Narrator:{" "}
                  <span className="font-semibold capitalize">
                    {chapter.narrator?.replace("-", " ")}
                  </span>
                </p>
                <p>
                  Story Tone:{" "}
                  <span className="font-semibold capitalize">
                    {chapter.storyTone?.replace("-", " ")}
                  </span>
                </p>
                <p>
                  Background music:{" "}
                  <span className="font-semibold">Epic Adventure</span>
                </p>
              </CardContent>
            </Card>

            {/* Markdown Guide (only in edit mode) */}
            {showEdit && (
              <Card className="chapter-card border-amber-200">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg text-amber-900">
                    Markdown Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm font-crimson text-amber-700">
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
                </CardContent>
              </Card>
            )}

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
                    className="font-crimson text-base leading-relaxed text-amber-900 space-y-4"
                    dangerouslySetInnerHTML={{
                      __html: `<p class="mb-4">${renderMarkdown(
                        chapter.originalEntry || ""
                      )}</p>`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {!showEdit && chapter && (
        <NarrationPlayer
          chapterTitle={chapter.title}
          text={chapter.narrative}
          tone={chapter.storyTone}
          isVisible={isPlaying}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
