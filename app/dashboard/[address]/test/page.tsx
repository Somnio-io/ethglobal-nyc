"use client";

import StreamPlayer from "@/(components)/stream-player/player";
import { TokenSelectorList } from "@/(components)/token-selector-list/token-selector-list";
import { Separator } from "@radix-ui/react-dropdown-menu";

export default function Page({ params }: { params: { address: string } }) {
  return (
    <>
      <div className="space-y-2">{/* <LoginButtonBox /> */}</div>

      <Separator className="my-4" />
      <TokenSelectorList account={params.address} />
      <Separator className="my-4" />
    </>
  );
}
