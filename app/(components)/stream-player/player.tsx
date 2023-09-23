"use client";

import React, { useState, useRef, useEffect } from "react";

declare global {
  interface Window {
    IVSPlayer?: any;
  }
}

const DEFAULT_POSITION = "auto";
const TRANSITION = "200ms ease-in-out";

const IvsPlayer = () => {
  const videoPlayer = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({
    top: DEFAULT_POSITION,
    right: DEFAULT_POSITION,
    bottom: DEFAULT_POSITION,
    left: DEFAULT_POSITION,
  });

  const [playerSize, setPlayerSize] = useState({
    width: "500",
    height: "500",
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.IVSPlayer) {
        setIsScriptLoaded(true);
        clearInterval(intervalId);
      }
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isScriptLoaded) {
      // Your existing code to initialize player
      const { IVSPlayer } = window;
      const { isPlayerSupported } = IVSPlayer;
      if (isPlayerSupported) {
        const player = IVSPlayer.create(videoPlayer.current);
        player.attachHTMLVideoElement(videoPlayer.current);
        player.load(
          "https://b9e19e28061f.us-east-1.playback.live-video.net/api/video/v1/us-east-1.127823924650.channel.N6ahTinoLXBp.m3u8"
        );
        player.setMuted(false);
        player.play();
        videoPlayer.current = player;
      }
    }
  }, [isScriptLoaded]); // Dependency on isScriptLoaded

  return (
    <div className="">
      <video
        className=""
        playsInline
        ref={videoPlayer}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default IvsPlayer;
