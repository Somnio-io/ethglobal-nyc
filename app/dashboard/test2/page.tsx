"use client";

import StreamPlayer from "@/(components)/stream-player/player";
import { TokenSelectorList } from "@/(components)/token-selector-list/token-selector-list";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});

  useEffect(() => {
    const _fetch = async () => {
      const data = await fetch(`/dashboard/api/traits`, {
        method: "GET",
        headers: {},
      });
      const jsonData = await data.json();
      setContent(jsonData.tokens);
      setLoading(false);
    };
    _fetch();
  }, []);

  if (loading) {
    return <p>Loading..</p>;
  }

  console.log("Content => ", content);

  return <></>;
}
