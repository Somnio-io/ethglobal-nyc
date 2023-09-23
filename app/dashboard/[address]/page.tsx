"use client";

import { Separator } from "@/(components)/ui/separator";
import { CONTENT_URL, ContentKey, Video, transformData } from "@/(lib)/utils";
import CarouselBase from "@/(components)/carousel/carousel-base";
import { useEffect, useState } from "react";
import { TokenSelectorList } from "@/(components)/token-selector-list/token-selector-list";

export default function Page({ params }: { params: { address: string } }) {
  const [content, setContent] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const _fetch = async () => {
      const token = localStorage.getItem("token") || "unauthorized";

      const data = await fetch(
        `${CONTENT_URL}?requestedContract=${params.address}`, // Its not the owners contract we care about, its the contract they own
        {
          method: "GET",
          headers: {
            Authorization: token as string,
          },
        }
      );
      const jsonUrls = JSON.parse(await data.json());

      const groupedContent = jsonUrls.presignedUrls.reduce((acc: { [key: string]: ContentKey[] }, curr: ContentKey) => {
        if (!acc[curr.id]) {
          acc[curr.id] = [];
        }
        acc[curr.id].push(curr);
        return acc;
      }, {});
      setContent(transformData(groupedContent));
      setLoading(false);
    };
    _fetch();
  }, []);

  if (loading && !content.length) {
    return <p>Loading..</p>;
  }

  return (
    <>
      {true ? (
        <>
          <div className="grid grid-cols-4 gap-2">
            <div className="col-start-1 col-span-4 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight space-y-6">Dashboard</h2>
              <p className="text-muted-foreground  space-y-6">View your available content and checkout whats trending</p>
            </div>
            <article className="col-start-1 col-span-2 p-4  border-2  h-28 space-y-6">
              <h3 className="text-base font-medium tracking-tight "> Subscribers</h3>
              <p className="text-2xl font-bold tracking-tight text-primary"> 20 </p>
            </article>
            <article className="col-start-3 col-span-2 p-4  border-2   h-28 space-y-6">
              <h3 className="text-base font-medium tracking-tight ">Watch hours</h3>
              <p className="text-2xl font-bold tracking-tight text-primary"> +20 </p>
            </article>
            <article className="col-start-1 col-span-4 p-4  border-2  h-32 space-y-6">
              <h3 className="text-base font-medium tracking-tight "> Tips accrued in coin of choice</h3>
              <p className="text-2xl font-bold tracking-tight text-primary">10 coins</p>
            </article>

            {/* <CarouselBase name="Trending" content={[]} /> */}
          </div>
          <CarouselBase name="My Content" content={content} />
        </>
      ) : (
        <TokenSelectorList account={params.address} />
      )}
    </>
  );
}
