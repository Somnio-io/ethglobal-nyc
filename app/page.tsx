import React from "react";
import CarouselBase from "./(components)/carousel/carousel-base";
import { CONTENT_URL, ContentKey, Video, transformData } from "./(lib)/utils";

export default async function Home() {
  const content = await getData();

  return (
    <>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter text-left my-4">Discover</h1>
      <p className="text-muted-foreground mb- max-w-sm">
        Find your favorite content creators on Linkt. Experience their exclusive, token-gated content and unique live streams firsthand.
      </p>

      <CarouselBase name="Trending" content={content} />
      <CarouselBase name="New Content" content={content.reverse()} />
    </>
  );
}

async function getData() {
  const getUrls = await fetch(`${CONTENT_URL}`, {
    method: "GET",
    next: { tags: ["discovery"], revalidate: 120 }, // 2 min - OR if someone uploads
    headers: {},
  });
  const jsonUrls = JSON.parse(await getUrls.json());

  console.log(jsonUrls);

  const groupedContent = jsonUrls.presignedUrls.reduce((acc: { [key: string]: ContentKey[] }, curr: ContentKey) => {
    if (!acc[curr.id]) {
      acc[curr.id] = [];
    }
    acc[curr.id].push(curr);
    return acc;
  }, {});
  return transformData(groupedContent);
}
