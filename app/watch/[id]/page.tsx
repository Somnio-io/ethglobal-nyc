"use client";

import { CONTENT_URL, ContentKey, Video, transformData } from "@/(lib)/utils";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/(components)/ui/badge";
import { Button } from "@/(components)/ui/button";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { TipModal } from "@/(components)/tip-modal/tip-modal";
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

  return (
    content && (
      <div className="grid grid-cols-4">
        <div className="col-span-4">
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
        </div>
        <div className="col-start-1 col-span-2 justify-between mt-5 ">
          <h3 className="font-semibold capitalize text-wrap mb-1">{video?.name}</h3>
          <p className="text mb-2"> author</p>
          {/* {video?.live ? (
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
          )} */}

          <p className="mt-5 text-regular col-start-1 col-span-2 text-wrap">{video?.description}</p>

          {/* is the user subscribed to this? show badge if not null */}
          {/* <Badge className="col-start-4 flex items-center justify-center text-center border-primary max-h-xs max-w-xs" variant="outline">
          Subscribed
        </Badge> */}
        </div>
        <div className="row-start-2 col-start-3 space-x-4 justify-self-end col-span-2">
          <Button variant="outline" size="icon">
            <HeartFilledIcon className="h-4 w-4" />
          </Button>
          {!process.env.FEATURE_ENABLE_TIPPING_TOKEN ? <TipModal /> : null}
        </div>
      </div>
    )
  );
}
