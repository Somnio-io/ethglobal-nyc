"use client";

import React from "react";
import { ScrollArea, ScrollBar } from "@/(components)/ui/scroll-area";
import CarouselItem from "@/(components)/carousel/carousel-item";
import { EAudience } from "../video/input-video-upload";
import { Video } from "@/(lib)/utils";
import Link from "next/link";
import { Separator } from "@/(components)/ui/separator";

interface CarouselBaseProps {
  name: string;
  content: Video[];
}

function CarouselBase({ name, content }: CarouselBaseProps) {
  return (
    <section className="my-8 relative">
      <h3 className="text-2xl font-semibold tracking-tight max-w-md  text-current">{name}</h3>
      <Separator className="my-4" />
      <ScrollArea>
        <div className="ml-2 flex space-x-4 py-6 scroll-smooth">
          {content &&
            content.map((_content, i) => (
              <Link
                href={{
                  pathname: `/watch/${_content.id}`,
                  query: { publisher: _content.publisher },
                }}
                key={`link-${_content.id}`}
              >
                <CarouselItem
                  key={`${_content.id} + ${i}`}
                  title={_content.name}
                  className="w-[150px]"
                  aspectRatio="portrait"
                  width={150}
                  height={200}
                  placeholder={_content.placeholderUrl}
                />
              </Link>
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default CarouselBase;
