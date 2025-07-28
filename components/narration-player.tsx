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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface NarrationPlayerProps {
  chapterTitle: string;
  text: string;
  tone: string;
  isVisible: boolean;
  onClose: () => void;
}

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [selectedVoice, setSelectedVoice] = useState("wise-sage");
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [usingSystemTTS, setUsingSystemTTS] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          text,
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

  const playSystemTTS = (text: string) => {
    // Cancel any existing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice =
      speechSynthesis
        .getVoices()
        .find((v) => v.name.includes("Google") || v.default) || null;

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    utterance.onpause = () => setIsPlaying(false);
    utterance.onresume = () => setIsPlaying(true);

    speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
    setIsPlaying(true);
    setUsingSystemTTS(true);
  };

  // Update progress bar in real-time
  useEffect(() => {
    console.log(
      `isPlaying: ${isPlaying}, usingSystemTTS: ${usingSystemTTS}, intervalRef: ${intervalRef.current}`
    );

    if (isPlaying && !usingSystemTTS && audioRef.current) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      }, 100); // Update every 100ms for smooth progress
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, usingSystemTTS]);

  useEffect(() => {
    if (!isVisible) {
      // Clean up when player is hidden
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (usingSystemTTS) {
        speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    const cleanText = stripMarkdown(text);

    const generateAudio = async () => {
      try {
        if (!cleanText || cleanText.length < 10) return;
        const url = await fetchElevenLabsAudio(cleanText, tone, selectedVoice);
        setAudioUrl(url);
        setUsingSystemTTS(false);
      } catch {
        console.warn("ElevenLabs failed. Falling back to system TTS.");
        toast.error(
          "Failed to generate audio with ElevenLabs. Using system TTS instead.",
          {
            description:
              "We don't have enough tokens xD. You can clone the project and put in your own ElevenLabs API key to use the expressive TTS feature.",
          }
        );
        playSystemTTS(cleanText);
      }
    };

    generateAudio();

    return () => {
      // Clean up on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (usingSystemTTS) {
        speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isVisible, text, tone, selectedVoice]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume[0] / 100;
  }, [volume]);

  const handlePlayPause = () => {
    if (usingSystemTTS) {
      if (isPlaying) {
        speechSynthesis.pause();
      } else {
        if (utteranceRef.current) {
          speechSynthesis.resume();
        } else {
          playSystemTTS(stripMarkdown(text));
        }
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (!isLoading) {
          setIsLoading(true);
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            loadingTimeoutRef.current = null;
          }, 5000);
        }
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    if (!usingSystemTTS && audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - 15
      );
    }
  };

  const handleSkipForward = () => {
    if (!usingSystemTTS && audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 15
      );
    }
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
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current);
                  loadingTimeoutRef.current = null;
                }
                if (usingSystemTTS) {
                  speechSynthesis.cancel();
                } else if (audioRef.current) {
                  audioRef.current.pause();
                }
                setIsPlaying(false);
                setIsLoading(false);
                onClose();
              }}
              className="text-amber-700 hover:text-amber-900"
            >
              ×
            </Button>
          </div>

          {!usingSystemTTS && (
            <>
              <div className="mb-4">
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    preload="auto"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                      if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                      }
                    }}
                  />
                )}
                <Slider
                  value={[currentTime]}
                  max={duration || 1}
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
                    disabled={isLoading && !isPlaying}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                  >
                    {isLoading && !isPlaying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
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
                  <Select
                    value={selectedVoice}
                    onValueChange={setSelectedVoice}
                    disabled={usingSystemTTS}
                  >
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
                    disabled={usingSystemTTS}
                  >
                    <Music className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {usingSystemTTS && (
            <div className="flex justify-center">
              <Button
                onClick={handlePlayPause}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Narration
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume Narration
                  </>
                )}
              </Button>
            </div>
          )}
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

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Slider } from "@/components/ui/slider";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Play,
//   Pause,
//   SkipBack,
//   SkipForward,
//   Volume2,
//   Music,
// } from "lucide-react";
// import { toast } from "sonner";

// interface NarrationPlayerProps {
//   chapterTitle: string;
//   text: string;
//   tone: string;
//   isVisible: boolean;
//   onClose: () => void;
// }

// const narratorVoiceMap: Record<string, string> = {
//   "wise-sage": "EXAVITQu4vr4xnSDxMaL", // Rachel
//   "cheeky-bard": "21m00Tcm4TlvDq8ikWAM", // Adam
//   "stoic-chronicler": "AZnzlk1XvdvUeBnXmlld", // Bella
// };

// function stripMarkdown(md: string): string {
//   return md
//     .replace(/^#{1,6}\s+/gm, "")
//     .replace(/\*\*(.*?)\*\*/g, "$1")
//     .replace(/\*(.*?)\*/g, "$1")
//     .replace(/!\[.*?\]\(.*?\)/g, "")
//     .replace(/\[(.*?)\]\(.*?\)/g, "$1")
//     .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
//     .replace(/^- /gm, "")
//     .replace(/>\s?/g, "")
//     .replace(/\n+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// export default function NarrationPlayer({
//   chapterTitle,
//   text,
//   tone,
//   isVisible,
//   onClose,
// }: NarrationPlayerProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState([75]);
//   const [selectedVoice, setSelectedVoice] = useState("wise-sage");
//   const [backgroundMusic, setBackgroundMusic] = useState(true);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [usingSystemTTS, setUsingSystemTTS] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   const fetchElevenLabsAudio = async (
//     text: string,
//     tone: string,
//     narrator: string
//   ): Promise<string> => {
//     const voiceId = narratorVoiceMap[narrator] || narratorVoiceMap["wise-sage"];

//     const response = await fetch(
//       `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
//       {
//         method: "POST",
//         headers: {
//           "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
//           "Content-Type": "application/json",
//           Accept: "audio/mpeg",
//         },
//         body: JSON.stringify({
//           text,
//           model_id: "eleven_monolingual_v1",
//           voice_settings: {
//             stability: tone === "peaceful" ? 0.8 : 0.4,
//             similarity_boost: tone === "triumphant" ? 0.75 : 0.5,
//           },
//         }),
//       }
//     );

//     if (!response.ok) throw new Error("TTS generation failed");

//     const blob = await response.blob();
//     return URL.createObjectURL(blob);
//   };

//   const playSystemTTS = (text: string) => {
//     // Cancel any existing speech
//     speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.voice =
//       speechSynthesis
//         .getVoices()
//         .find((v) => v.name.includes("Google") || v.default) || null;

//     utterance.onend = () => {
//       setIsPlaying(false);
//       utteranceRef.current = null;
//     };

//     utterance.onpause = () => setIsPlaying(false);
//     utterance.onresume = () => setIsPlaying(true);

//     speechSynthesis.speak(utterance);
//     utteranceRef.current = utterance;
//     setIsPlaying(true);
//     setUsingSystemTTS(true);
//   };

//   // Update progress bar in real-time
//   useEffect(() => {
//     // console.log(`isPlaying: ${isPlaying}, usingSystemTTS: ${usingSystemTTS}, intervalRef: ${intervalRef.current}`);

//     if (isPlaying && !usingSystemTTS && audioRef.current) {
//       intervalRef.current = setInterval(() => {
//         if (audioRef.current) {
//           setCurrentTime(audioRef.current.currentTime);
//           setDuration(audioRef.current.duration || 0);
//         }
//       }, 100); // Update every 100ms for smooth progress
//     } else {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [isPlaying, usingSystemTTS]);

//   useEffect(() => {
//     if (!isVisible) {
//       // Clean up when player is hidden
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       if (usingSystemTTS) {
//         speechSynthesis.cancel();
//       } else if (audioRef.current) {
//         audioRef.current.pause();
//       }
//       setIsPlaying(false);
//       return;
//     }

//     const cleanText = stripMarkdown(text);

//     const generateAudio = async () => {
//       try {
//         if (!cleanText || cleanText.length < 10) return;
//         const url = await fetchElevenLabsAudio(cleanText, tone, selectedVoice);
//         setAudioUrl(url);
//         setUsingSystemTTS(false);
//       } catch {
//         console.warn("ElevenLabs failed. Falling back to system TTS.");
//         toast.error(
//           "Failed to generate audio with ElevenLabs. Using system TTS instead.",
//           {
//             description:
//               "We don't have enough tokens xD. You can clone the project and put in your own ElevenLabs API key to use the expressive TTS feature.",
//           }
//         );
//         playSystemTTS(cleanText);
//       }
//     };

//     generateAudio();

//     return () => {
//       // Clean up on unmount
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       if (usingSystemTTS) {
//         speechSynthesis.cancel();
//       } else if (audioRef.current) {
//         audioRef.current.pause();
//       }
//     };
//   }, [isVisible, text, tone, selectedVoice]);

//   useEffect(() => {
//     if (!audioRef.current) return;
//     audioRef.current.volume = volume[0] / 100;
//   }, [volume]);

//   const handlePlayPause = () => {
//     if (usingSystemTTS) {
//       if (isPlaying) {
//         speechSynthesis.pause();
//       } else {
//         if (utteranceRef.current) {
//           speechSynthesis.resume();
//         } else {
//           playSystemTTS(stripMarkdown(text));
//         }
//       }
//     } else if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//     }
//     setIsPlaying(!isPlaying);
//   };

//   const handleSkipBack = () => {
//     if (!usingSystemTTS && audioRef.current) {
//       audioRef.current.currentTime = Math.max(
//         0,
//         audioRef.current.currentTime - 15
//       );
//     }
//   };

//   const handleSkipForward = () => {
//     if (!usingSystemTTS && audioRef.current) {
//       audioRef.current.currentTime = Math.min(
//         audioRef.current.duration,
//         audioRef.current.currentTime + 15
//       );
//     }
//   };

//   if (!isVisible) return null;

//   return (
//     <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
//       <Card className="max-w-4xl mx-auto fantasy-border bg-white/95 backdrop-blur-sm shadow-2xl">
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="font-cinzel text-lg font-semibold text-amber-900">
//                 Now Playing
//               </h3>
//               <p className="font-crimson text-amber-700 text-sm">
//                 {chapterTitle}
//               </p>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => {
//                 if (intervalRef.current) {
//                   clearInterval(intervalRef.current);
//                   intervalRef.current = null;
//                 }
//                 if (usingSystemTTS) {
//                   speechSynthesis.cancel();
//                 } else if (audioRef.current) {
//                   audioRef.current.pause();
//                 }
//                 setIsPlaying(false);
//                 onClose();
//               }}
//               className="text-amber-700 hover:text-amber-900"
//             >
//               ×
//             </Button>
//           </div>

//           {!usingSystemTTS && (
//             <>
//               <div className="mb-4">
//                 {audioUrl && (
//                   <audio
//                     ref={audioRef}
//                     src={audioUrl}
//                     preload="auto"
//                     onPlay={() => setIsPlaying(true)}
//                     onPause={() => setIsPlaying(false)}
//                     onEnded={() => setIsPlaying(false)}
//                     onLoadedMetadata={() => {
//                       if (audioRef.current) {
//                         setDuration(audioRef.current.duration);
//                       }
//                     }}
//                   />
//                 )}
//                 <Slider
//                   value={[currentTime]}
//                   max={duration || 1}
//                   step={1}
//                   onValueChange={(value) => {
//                     if (audioRef.current) {
//                       audioRef.current.currentTime = value[0];
//                       setCurrentTime(value[0]);
//                     }
//                   }}
//                   className="w-full"
//                 />
//                 <div className="flex justify-between text-xs text-amber-600 mt-1">
//                   <span>{formatTime(currentTime)}</span>
//                   <span>{formatTime(duration)}</span>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 {/* Playback Controls */}
//                 <div className="flex items-center space-x-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={handleSkipBack}
//                     className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
//                   >
//                     <SkipBack className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     onClick={handlePlayPause}
//                     className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
//                   >
//                     {isPlaying ? (
//                       <Pause className="w-4 h-4" />
//                     ) : (
//                       <Play className="w-4 h-4" />
//                     )}
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={handleSkipForward}
//                     className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
//                   >
//                     <SkipForward className="w-4 h-4" />
//                   </Button>
//                 </div>

//                 {/* Volume Control */}
//                 <div className="flex items-center space-x-2">
//                   <Volume2 className="w-4 h-4 text-amber-700" />
//                   <Slider
//                     value={volume}
//                     max={100}
//                     step={1}
//                     onValueChange={setVolume}
//                     className="w-20"
//                   />
//                 </div>

//                 {/* Voice & Music Toggle */}
//                 <div className="flex items-center space-x-2">
//                   <Select
//                     value={selectedVoice}
//                     onValueChange={setSelectedVoice}
//                     disabled={usingSystemTTS}
//                   >
//                     <SelectTrigger className="w-32 border-amber-200">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="wise-sage">Wise Sage</SelectItem>
//                       <SelectItem value="cheeky-bard">Cheeky Bard</SelectItem>
//                       <SelectItem value="stoic-chronicler">
//                         Stoic Chronicler
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setBackgroundMusic(!backgroundMusic)}
//                     className={`border-amber-300 ${
//                       backgroundMusic
//                         ? "bg-amber-50 text-amber-700"
//                         : "text-amber-600"
//                     }`}
//                     disabled={usingSystemTTS}
//                   >
//                     <Music className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}

//           {usingSystemTTS && (
//             <div className="flex justify-center">
//               <Button
//                 onClick={handlePlayPause}
//                 className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
//               >
//                 {isPlaying ? (
//                   <>
//                     <Pause className="w-4 h-4 mr-2" />
//                     Pause Narration
//                   </>
//                 ) : (
//                   <>
//                     <Play className="w-4 h-4 mr-2" />
//                     Resume Narration
//                   </>
//                 )}
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function formatTime(seconds: number) {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, "0")}`;
// }
