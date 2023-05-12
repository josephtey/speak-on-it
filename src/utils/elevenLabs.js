// AudioStream.tsx
import React, { useState } from "react";
import axios from "axios";

const textToSpeech = async (voiceId, text, apiKey, voiceSettings) => {
  const baseUrl = "https://api.elevenlabs.io/v1/text-to-speech";
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": apiKey,
  };

  const requestBody = {
    text,
    voice_settings: voiceSettings,
  };

  try {
    const response = await axios.post(`${baseUrl}/${voiceId}`, requestBody, {
      headers,
      responseType: "blob",
    });

    if (response.status === 200) {
      const audio = new Audio(URL.createObjectURL(response.data));
      audio.play();
    } else {
      console.error("Error: Unable to stream audio.");
    }
  } catch (error) {
    console.error("Error: Unable to stream audio.");
  }
};

export default textToSpeech;
