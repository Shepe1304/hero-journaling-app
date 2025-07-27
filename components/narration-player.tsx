"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
} from "lucide-react";

interface NarrationPlayerProps {
  chapterTitle: string;
  text: string;
  tone: string;
  isVisible: boolean;
  onClose: () => void;
}

const useSystemTTS = true; // Set to true if ElevenLabs is unavailable

const narratorVoiceMap: Record<string, string> = {
  "wise-sage": "EXAVITQu4vr4xnSDxMaL", // Rachel
  "cheeky-bard": "21m00Tcm4TlvDq8ikWAM", // Adam
  "stoic-chronicler": "AZnzlk1XvdvUeBnXmlld", // Bella
};

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")         
    .replace(/\*\*(.*?)\*\*/g, "$1")     
    .replace(/\*(.*?)\*/g, "$1")         
    .replace(/!\[.*?\]\(.*?\)/g, "")     
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")  
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") 
    .replace(/^- /gm, "")                
    .replace(/>\s?/g, "")                
    .replace(/\n+/g, " ")                
    .replace(/\s+/g, " ")                
    .trim();
}


export default function NarrationPlayer({
  chapterTitle,
  text,
  tone,
  isVisible,
  onClose,
}: NarrationPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [selectedVoice, setSelectedVoice] = useState("wise-sage");
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchElevenLabsAudio = async (
    text: string,
    tone: string,
    narrator: string
  ): Promise<string> => {
    const voiceId = narratorVoiceMap[narrator] || narratorVoiceMap["wise-sage"];

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text, // actual story content only
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: tone === "peaceful" ? 0.8 : 0.4,
            similarity_boost: tone === "triumphant" ? 0.75 : 0.5,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("TTS generation failed");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
  if (!isVisible) return;

  const cleanText = stripMarkdown(text);

  const playSystemTTS = () => {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice =
      speechSynthesis.getVoices().find((v) => v.name.includes("Google") || v.default) || null;
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const generateAudio = async () => {
    try {
      if (!cleanText || cleanText.length < 10) return;
      const url = await fetchElevenLabsAudio(cleanText, tone, selectedVoice);
      setAudioUrl(url);
    } catch (err) {
      console.warn("ElevenLabs failed. Falling back to system TTS.");
      playSystemTTS();
    }
  };

  generateAudio();
}, [isVisible, text, tone, selectedVoice]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume[0] / 100;
  }, [volume]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, audio.currentTime - 15);
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto fantasy-border bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-cinzel text-lg font-semibold text-amber-900">
                Now Playing
              </h3>
              <p className="font-crimson text-amber-700 text-sm">
                {chapterTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                audioRef.current?.pause();
                setIsPlaying(false);
                onClose();
              }}
              className="text-amber-700 hover:text-amber-900"
            >
              ×
            </Button>
          </div>

          <div className="mb-4">
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="auto"
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onEnded={() => setIsPlaying(false)}
              />
            )}
            <Slider
              value={[audioRef.current?.currentTime || 0]}
              max={audioRef.current?.duration || 1}
              step={1}
              onValueChange={(value) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = value[0];
                  setCurrentTime(value[0]);
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-amber-600 mt-1">
              <span>
                {formatTime(audioRef.current?.currentTime || 0)}
              </span>
              <span>
                {formatTime(audioRef.current?.duration || 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipBack}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={handlePlayPause}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipForward}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-amber-700" />
              <Slider
                value={volume}
                max={100}
                step={1}
                onValueChange={setVolume}
                className="w-20"
              />
            </div>

            {/* Voice & Music Toggle */}
            <div className="flex items-center space-x-2">
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-32 border-amber-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wise-sage">Wise Sage</SelectItem>
                  <SelectItem value="cheeky-bard">Cheeky Bard</SelectItem>
                  <SelectItem value="stoic-chronicler">
                    Stoic Chronicler
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBackgroundMusic(!backgroundMusic)}
                className={`border-amber-300 ${
                  backgroundMusic
                    ? "bg-amber-50 text-amber-700"
                    : "text-amber-600"
                }`}
              >
                <Music className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
