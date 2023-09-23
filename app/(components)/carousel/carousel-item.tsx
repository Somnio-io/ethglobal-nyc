"use client";

import React from "react";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { cn } from "@/(lib)/utils";

interface carouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  title: string;
  width?: number;
  height?: number;
  aspectRatio?: "portrait" | "square";
}
function carouselItem({
  title,
  placeholder,
  width,
  height,
  aspectRatio,
}: carouselItemProps) {
  if (!placeholder) {
    return <>Loading...</>;
  }

  return (
    <article className={`relative w-[${width}px] `}>
      <div className="overflow-hidden">
        <Image
          src={placeholder}
          alt={title}
          unoptimized={true}
          width={width}
          height={height}
          style={{ objectFit: "cover" }}
          className={cn(
            "h-auto w-auto transition-all hover:scale-105",
            aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
          )}
        />
      </div>
      <div className="mt-3 text-sm">
        <h3 className="text-left max-w-sm truncate text-ellipsis"> {title}</h3>
        {/* n.b showing likes is an option not the default */}
        {/* <HeartFilledIcon className="h-6 w-6 text-current hover:text-pink-500" /> */}
      </div>
    </article>
  );
}

export default carouselItem;
