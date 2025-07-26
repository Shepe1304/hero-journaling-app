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
import {
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  Moon,
  Eye,
  Edit,
  Bold,
  Italic,
  List,
  Link,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ================================
// TYPES & INTERFACES
// ================================
interface MoodOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface EntryFormData {
  title: string;
  content: string;
  mood: string;
}

interface MarkdownToolbarProps {
  onInsertMarkdown: (before: string, after?: string) => void;
}

interface WritingTip {
  text: string;
}

interface MarkdownGuideItem {
  syntax: string;
  display: string;
  className?: string;
}

// ================================
// CONSTANTS & CONFIGURATION
// ================================
const MOOD_OPTIONS: MoodOption[] = [
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

const WRITING_TIPS: WritingTip[] = [
  { text: "Describe your emotions and thoughts" },
  { text: "Include specific details about your day" },
  { text: "Write about challenges and how you overcame them" },
  { text: "Don't worry about perfect grammar - just write!" },
];

const MARKDOWN_GUIDE: MarkdownGuideItem[] = [
  { syntax: "**Bold**", display: "Bold", className: "font-bold" },
  { syntax: "*Italic*", display: "Italic", className: "italic" },
  { syntax: "# Heading", display: "Heading", className: "font-semibold" },
  { syntax: "- List item", display: "• List item" },
  {
    syntax: "[Link](url)",
    display: "Link",
    className: "text-amber-600 underline",
  },
];

const MARKDOWN_TOOLBAR_BUTTONS = [
  { label: "Bold", icon: Bold, before: "**", after: "**" },
  { label: "Italic", icon: Italic, before: "*", after: "*" },
  { label: "List", icon: List, before: "- " },
  { label: "Link", icon: Link, before: "[", after: "](url)" },
];

const PLACEHOLDER_TEXT = `Begin writing your story here... 

You can use markdown formatting:
**bold text** or *italic text*
# Heading 1
## Heading 2  
### Heading 3
- List items
[Link text](url)

What happened today? How did it make you feel? What challenges did you face or victories did you achieve?`;

const UI_TEXT = {
  title: "New Chapter",
  subtitle: "What adventure awaits today?",
  backButton: "Back",
  saveDraftButton: "Save Draft",
  generateChapterButton: "Generate Chapter",
  generatingText: "Crafting Chapter...",
  storyTitle: "Your Story",
  writeTab: "Write",
  previewTab: "Preview",
  previewPlaceholder: "Start writing to see your preview...",
  moodTitle: "Today's Mood",
  moodPlaceholder: "How are you feeling?",
  writingTipsTitle: "Writing Tips",
  markdownGuideTitle: "Markdown Guide",
} as const;

// ================================
// UTILITY FUNCTIONS
// ================================
const renderMarkdown = (text: string): string => {
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
    .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-amber-600 underline">$1</a>'
    )
    .replace(/\n/g, "<br>");
};

const insertMarkdownAtCursor = (
  textareaId: string,
  currentValue: string,
  before: string,
  after = ""
): { newText: string; newCursorPosition: number } => {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  if (!textarea) {
    return { newText: currentValue, newCursorPosition: 0 };
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = currentValue.substring(start, end);
  const newText =
    currentValue.substring(0, start) +
    before +
    selectedText +
    after +
    currentValue.substring(end);

  const newCursorPosition = start + before.length + selectedText.length;

  return { newText, newCursorPosition };
};

const setCursorPosition = (textareaId: string, position: number): void => {
  setTimeout(() => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(position, position);
    }
  }, 0);
};

const getCharacterCount = (text: string): number => text.length;

// ================================
// SUB-COMPONENTS
// ================================
interface MarkdownToolbarProps {
  onInsertMarkdown: (before: string, after?: string) => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsertMarkdown,
}) => (
  <div className="flex items-center gap-2">
    {MARKDOWN_TOOLBAR_BUTTONS.map((button) => {
      const IconComponent = button.icon;
      return (
        <Button
          key={button.label}
          variant="outline"
          size="sm"
          onClick={() => onInsertMarkdown(button.before, button.after)}
          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
          title={button.label}
        >
          <IconComponent className="w-3 h-3" />
        </Button>
      );
    })}
  </div>
);

interface EditorTabsProps {
  content: string;
  onChange: (value: string) => void;
  showPreview: boolean;
  onTogglePreview: (showPreview: boolean) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  content,
  onChange,
  showPreview,
  onTogglePreview,
}) => (
  <Tabs
    value={showPreview ? "preview" : "write"}
    onValueChange={(value) => onTogglePreview(value === "preview")}
  >
    <TabsList className="mb-4">
      <TabsTrigger value="write" className="font-crimson">
        <Edit className="w-4 h-4 mr-2" />
        {UI_TEXT.writeTab}
      </TabsTrigger>
      <TabsTrigger value="preview" className="font-crimson">
        <Eye className="w-4 h-4 mr-2" />
        {UI_TEXT.previewTab}
      </TabsTrigger>
    </TabsList>

    <TabsContent value="write">
      <Textarea
        id="entry-textarea"
        placeholder={PLACEHOLDER_TEXT}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[400px] border-amber-200 focus:border-amber-500 resize-none font-crimson text-base leading-relaxed"
      />
    </TabsContent>

    <TabsContent value="preview">
      <div className="min-h-[400px] p-4 border border-amber-200 rounded-md bg-amber-50/30">
        {content ? (
          <div
            className="font-crimson text-base leading-relaxed text-amber-900 prose prose-amber max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content),
            }}
          />
        ) : (
          <p className="text-amber-600 italic">{UI_TEXT.previewPlaceholder}</p>
        )}
      </div>
    </TabsContent>
  </Tabs>
);

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodChange,
}) => (
  <Card className="chapter-card border-amber-200">
    <CardHeader>
      <CardTitle className="font-cinzel text-lg text-amber-900">
        {UI_TEXT.moodTitle}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Select value={selectedMood} onValueChange={onMoodChange}>
        <SelectTrigger className="border-amber-200 focus:border-amber-500">
          <SelectValue placeholder={UI_TEXT.moodPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {MOOD_OPTIONS.map((mood) => {
            const IconComponent = mood.icon;
            return (
              <SelectItem key={mood.value} value={mood.value}>
                <div className="flex items-center">
                  <IconComponent className={`w-4 h-4 mr-2 ${mood.color}`} />
                  {mood.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
);

const WritingTipsCard: React.FC = () => (
  <Card className="chapter-card border-amber-200">
    <CardHeader>
      <CardTitle className="font-cinzel text-lg text-amber-900">
        {UI_TEXT.writingTipsTitle}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 text-sm font-crimson text-amber-700">
        {WRITING_TIPS.map((tip, index) => (
          <div key={index} className="flex items-start">
            <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>{tip.text}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const MarkdownGuideCard: React.FC = () => (
  <Card className="chapter-card border-amber-200">
    <CardHeader>
      <CardTitle className="font-cinzel text-lg text-amber-900">
        {UI_TEXT.markdownGuideTitle}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm font-crimson text-amber-700">
        {MARKDOWN_GUIDE.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.syntax}</span>
            <span className={item.className}>{item.display}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface EditorStatsProps {
  characterCount: number;
}

const EditorStats: React.FC<EditorStatsProps> = ({ characterCount }) => (
  <div className="mt-4 text-sm text-amber-600 font-crimson">
    {characterCount} characters • Write freely with markdown formatting, your
    story will be transformed into an epic chapter
  </div>
);

// ================================
// CUSTOM HOOKS
// ================================
const useEntryForm = () => {
  const [formData, setFormData] = useState<EntryFormData>({
    title: "",
    content: "",
    mood: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const updateTitle = (title: string) => {
    setFormData((prev) => ({ ...prev, title }));
  };

  const updateContent = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const updateMood = (mood: string) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const insertMarkdown = (before: string, after = "") => {
    const result = insertMarkdownAtCursor(
      "entry-textarea",
      formData.content,
      before,
      after
    );
    updateContent(result.newText);
    setCursorPosition("entry-textarea", result.newCursorPosition);
  };

  return {
    formData,
    showPreview,
    setShowPreview,
    updateTitle,
    updateContent,
    updateMood,
    insertMarkdown,
  };
};

// ================================
// MAIN COMPONENT
// ================================
function NewEntryPageComponent() {
  const {
    formData,
    showPreview,
    setShowPreview,
    updateTitle,
    updateContent,
    updateMood,
    insertMarkdown,
  } = useEntryForm();

  const characterCount = getCharacterCount(formData.content);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.content || !formData.mood) {
      alert("Please fill in the content and select a mood.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          title: formData.title || "Untitled Entry",
          content: formData.content,
          mood: formData.mood,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      console.log("Entry saved:", data);
      alert("Entry saved successfully!");
      window.location.href = `/entry/${data.id}`;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen parchment-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Card className="fantasy-border bg-white/90 backdrop-blur-sm h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-cinzel text-xl text-amber-900">
                    {UI_TEXT.storyTitle}
                  </CardTitle>
                  <MarkdownToolbar onInsertMarkdown={insertMarkdown} />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-crimson"
                  >
                    {isSaving ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Enter a chapter title..."
                  value={formData.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  className="w-full mb-4 p-2 border border-amber-200 rounded-md focus:border-amber-500 font-crimson text-lg"
                />
                <EditorTabs
                  content={formData.content}
                  onChange={updateContent}
                  showPreview={showPreview}
                  onTogglePreview={setShowPreview}
                />
                <EditorStats characterCount={characterCount} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MoodSelector
              selectedMood={formData.mood}
              onMoodChange={updateMood}
            />
            <WritingTipsCard />
            <MarkdownGuideCard />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export as default for Next.js page
export default NewEntryPageComponent;
