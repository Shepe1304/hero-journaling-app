export async function fetchElevenLabsAudio({
  text,
  tone,
  narrator,
}: {
  text: string;
  tone: string;
  narrator: string; // e.g. "wise-sage"
}): Promise<string> {
  const narratorVoiceMap: Record<string, string> = {
    "wise-sage": "EXAVITQu4vr4xnSDxMaL", // Rachel
    "cheeky-bard": "21m00Tcm4TlvDq8ikWAM", // Adam
    "stoic-chronicler": "AZnzlk1XvdvUeBnXmlld", // Bella
  };

  const voiceId = narratorVoiceMap[narrator] || narratorVoiceMap["wise-sage"];

  const prompt = `Narrated by a ${narrator.replace(/-/g, " ")}, using a ${tone} tone: ${text}`;

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
        text: prompt,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) throw new Error("TTS generation failed");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
