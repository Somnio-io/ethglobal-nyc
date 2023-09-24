"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DefaultLoader() {
  const facts = [
    "2020's League of Legends Championship peaked at 3.8M live viewers!",
    "Severe Tire Damage was the first to stream a concert in 1993.",
    "Lifecast's 161-hour webcast in 2019 is the longest live stream ever.",
    "Over 17 billion hours watched on Twitch in 2020.",
    "A woman's Chewbacca mask test got 170M views on Facebook Live.",
    'Astronaut Chris Hadfield streamed "Space Oddity" from space in 2013.',
    "2017 had live streams from the Great Barrier Reef's depths.",
    "Streamer DrLupo raised $2.3M for St. Jude's in 24 hours.",
    '"The End" event had 1.6M+ watching just on Twitch.',
    "TheGrefg hit 2.4M live viewers in 2021, a Twitch record.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % facts.length);
        setFadeIn(true);
      }, 500); // Half the interval time to switch fact after fade out -
    }, 5000); // change the fact every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-primary/10 backdrop-blur-md flex justify-center items-center z-90">
      <div className="text-center">
        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        {/* <p className={`mt-4 text-white transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}></p> */}
      </div>
    </div>
  );
}
