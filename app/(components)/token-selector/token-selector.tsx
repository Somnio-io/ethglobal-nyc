import Image from "next/image";
import { AlchemyNFT, FormattedCollections } from "../token-selector-list/token-selector-list";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";
import { FormattedToken } from "@/dashboard/api/tokens/route";

export function TokenSelector(tokens: any[]) {
  const [selected, setSelected] = useState<FormattedToken>();
  const _tokens = Object.values(tokens);

  //console.log("Collection =>", _tokens)

  if (!_tokens) {
    return <p>Loading...</p>;
  }

  if (!_tokens.length) return null;

  return (
    <div
      className={`flex items-center gap-10 hover:opacity-50 h-[50px] cursor-pointer stroke-primary stroke-2 bg-transparent border ${
        selected ? "border-green-500" : "border-red-500"
      }`}
    >
      {/* <Checkbox /> */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`w-full m-5`} asChild>
          <span>
            {_tokens[0].name} {selected ? selected.id : null}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {_tokens.map((token) => (
            <DropdownMenuItem key={token.id} onClick={() => setSelected(token)}>
              <Image unoptimized={true} src={token.thumbnail} height={50} width={50} alt={token.id} />
              {token.id}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
