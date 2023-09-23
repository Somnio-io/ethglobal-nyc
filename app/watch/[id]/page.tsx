"use client";

import { CONTENT_URL, ContentKey, Video, transformData } from "@/(lib)/utils";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import IvsPlayer from "@/(components)/stream-player/player";

export default function Page({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const publisher = searchParams.get("publisher");

  useEffect(() => {
    const _fetch = async () => {
      const token = localStorage.getItem("token") || "unauthorized";

      const data = await fetch(`${CONTENT_URL}?videoId=${params.id}&publisher=${publisher}`, {
        method: "GET",
        headers: {
          Authorization: token as string,
        },
      });
      const jsonUrls = JSON.parse(await data.json());
      console.log(jsonUrls);
      if (jsonUrls.presignedUrls.length) {
        const groupedContent = jsonUrls.presignedUrls.reduce((acc: { [key: string]: ContentKey[] }, curr: ContentKey) => {
          if (!acc[curr.id]) {
            acc[curr.id] = [];
          }
          acc[curr.id].push(curr);
          return acc;
        }, {});
        setContent(transformData(groupedContent));
      } else {
        setContent([]);
      }
      setLoading(false);
    };
    _fetch();
  }, []);

  // TODO check the response
  if (loading && !content.length) {
    return <p>Loading..</p>;
  }

  if (!loading && !content.length) {
    // We need to prompt the user here to Login.
    // If they Login we present the select token
    return <p>{"You don't have access to this content..."}</p>;
  }

  const video = content.find((video) => video);
  console.log(`Hello video!`, video, content);
  return (
    content && (
      <div className="grid grid-cols-1">
        <div className="justify-between">
          <p>{video?.name}</p>
        </div>
        {video?.live ? (
          <IvsPlayer />
        ) : (
          <video
            controls={true}
            muted={false}
            autoPlay={true}
            width={550}
            height={550}
            loop={false}
            playsInline={true}
            poster={video?.placeholderUrl}
          >
            <source src={video?.url} type="video/mp4" />
          </video>
        )}
        <div className="flex justify-between">
          <p>Likes Section</p>
          {process.env.FEATURE_ENABLE_TIPPING_TOKEN ? <p>Tips Section</p> : null}
        </div>
        <p className="mt-4">{video?.description}</p>
      </div>
    )
  );
}
