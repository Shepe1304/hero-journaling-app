"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Eye,
  Bold,
  Italic,
  List,
  Link,
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  Moon,
  Trash2,
} from "lucide-react";

const moods = [
  { value: "happy", label: "Happy", icon: Smile, color: "text-yellow-500" },
  { value: "sad", label: "Sad", icon: Frown, color: "text-blue-500" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-500" },
  { value: "excited", label: "Excited", icon: Zap, color: "text-orange-500" },
  {
    value: "peaceful",
    label: "Peaceful",
    icon: Heart,
    color: "text-green-500",
  },
  {
    value: "thoughtful",
    label: "Thoughtful",
    icon: Moon,
    color: "text-purple-500",
  },
];

// Mock data - in real app this would come from API/database
const mockEntry = {
  id: 1,
  title: "The Marathon Victory",
  content: `# My First Marathon

Today I finally completed my **first marathon**! The feeling of crossing the finish line was *incredible*.

## The Journey
I trained for months and there were times I wanted to quit, but I pushed through:
- Early morning runs at 5 AM
- Weekend long runs up to 20 miles  
- Dealing with sore muscles and fatigue
- Fighting through self-doubt

## The Race Day
The weather was perfect - cool and overcast. I started conservatively but felt strong throughout. At mile 20, I knew I was going to make it.

**All the training paid off!** I feel like I can accomplish anything now.

[My running tracker](https://example.com/run) shows I finished in 4:12:33.`,
  mood: "happy",
  date: "2024-01-15",
  createdAt: "2024-01-15T08:30:00Z",
  updatedAt: "2024-01-15T08:30:00Z",
  hasChapter: true,
};

export default function EntryPage(
  // { params }: { params: { id: string } }
) {
  const [entry, setEntry] = useState(mockEntry.content);
  const [selectedMood, setSelectedMood] = useState(mockEntry.mood);
  const [showPreview, setShowPreview] = useState(false);

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this entry? This action cannot be undone."
      )
    ) {
      // Simulate API call
      alert("Entry deleted!");
      window.location.href = "/dashboard";
    }
  };

  const insertMarkdown = (before: string, after = "") => {
    const textarea = document.getElementById(
      "entry-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = entry.substring(start, end);
    const newText =
      entry.substring(0, start) +
      before +
      selectedText +
      after +
      entry.substring(end);

    setEntry(newText);

    // Reset cursor position
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
        '<h3 class="text-lg font-semibold text-amber-900 mb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold text-amber-900 mb-3">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-amber-900 mb-4">$1</h1>'
      )
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-amber-600 underline hover:text-amber-800">$1</a>'
      )
      .replace(/\n/g, "<br>");
  };

  const MoodIcon = ({ mood }: { mood: string }) => {
    const moodData = moods.find((m) => m.value === mood) || moods[2];
    const IconComponent = moodData.icon;
    return (
      <div
        className={`p-2 rounded-full bg-${
          mood === "happy"
            ? "yellow"
            : mood === "excited"
            ? "orange"
            : mood === "peaceful"
            ? "green"
            : mood === "thoughtful"
            ? "purple"
            : mood === "sad"
            ? "blue"
            : "gray"
        }-100`}
      >
        <IconComponent className={`w-4 h-4 ${moodData.color}`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen parchment-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="fantasy-border bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-cinzel text-xl text-amber-900">
                    {showPreview ? "Edit Your Story" : "Your Story"}
                  </CardTitle>
                  {showPreview && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertMarkdown("**", "**")}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        title="Bold"
                      >
                        <Bold className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertMarkdown("*", "*")}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        title="Italic"
                      >
                        <Italic className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertMarkdown("- ")}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        title="List"
                      >
                        <List className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertMarkdown("[", "](url)")}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        title="Link"
                      >
                        <Link className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <Tabs
                    value={showPreview ? "preview" : "write"}
                    onValueChange={(value) =>
                      setShowPreview(value === "preview")
                    }
                  >
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
                        id="entry-textarea"
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        className="min-h-[500px] border-amber-200 focus:border-amber-500 resize-none font-crimson text-base leading-relaxed"
                        placeholder="Edit your story here..."
                      />
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="min-h-[500px] p-4 border border-amber-200 rounded-md bg-amber-50/30">
                        <div
                          className="font-crimson text-base leading-relaxed text-amber-900 prose prose-amber max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(entry),
                          }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="min-h-[500px] p-4">
                    <div
                      className="font-crimson text-base leading-relaxed text-amber-900 prose prose-amber max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(entry),
                      }}
                    />
                  </div>
                )}

                {showPreview && (
                  <div className="mt-4 text-sm text-amber-600 font-crimson">
                    {entry.length} characters • Use markdown formatting to
                    enhance your story
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entry Info */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Entry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-crimson text-amber-700">Mood:</span>
                  <div className="flex items-center gap-2">
                    <MoodIcon mood={selectedMood} />
                    <span className="font-crimson text-amber-900 capitalize">
                      {selectedMood}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-crimson text-amber-700">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      mockEntry.hasChapter
                        ? "border-green-300 text-green-700"
                        : "border-amber-300 text-amber-700"
                    }
                  >
                    {mockEntry.hasChapter ? "Chapter Created" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-crimson text-amber-700">
                    Word Count:
                  </span>
                  <span className="font-crimson text-amber-900">
                    {
                      entry.split(/\s+/).filter((word) => word.length > 0)
                        .length
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Mood Selector (only in edit mode) */}
            {showPreview && (
              <Card className="chapter-card border-amber-200">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg text-amber-900">
                    Update Mood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-500">
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => {
                        const IconComponent = mood.icon;
                        return (
                          <SelectItem key={mood.value} value={mood.value}>
                            <div className="flex items-center">
                              <IconComponent
                                className={`w-4 h-4 mr-2 ${mood.color}`}
                              />
                              {mood.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="chapter-card border-amber-200">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg text-amber-900">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!showPreview && (
                  <>
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
                      View Storybook
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 font-crimson bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Entry
                    </Button>
                  </>
                )}
                {showPreview && (
                  <div className="bg-amber-50 p-3 rounded border border-amber-200">
                    <p className="text-xs text-amber-700 font-crimson">
                      💡 <strong>Tip:</strong> Use markdown formatting to make
                      your entry more expressive. Your formatting will be
                      preserved when generating chapters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Markdown Guide (only in edit mode) */}
            {showPreview && (
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
          </div>
        </div>
      </div>
    </div>
  );
}
