"use client";

import { useState, useEffect } from "react";
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
  isVisible: boolean;
  onClose: () => void;
}

export default function NarrationPlayer({
  chapterTitle,
  isVisible,
  onClose,
}: NarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(300); // 5 minutes in seconds
  const [volume, setVolume] = useState([75]);
  const [selectedVoice, setSelectedVoice] = useState("wise-sage");
  const [backgroundMusic, setBackgroundMusic] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 15));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 15));
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
              onClick={onClose}
              className="text-amber-700 hover:text-amber-900"
            >
              ×
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-amber-600 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
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

            {/* Settings */}
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
