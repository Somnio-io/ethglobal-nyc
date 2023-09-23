"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { LINKT_ABI } from "@/(lib)/utils";
import { FormattedCollection, FormattedToken } from "@/dashboard/api/tokens/route";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

interface TokenSelectorListProps {
  account: string;
}

interface FormattedSelection {
  contracts: string[];
  tokens: string[];
}

export function TokenSelector(tokens: any[]) {
  const [selected, setSelected] = useState<FormattedToken>();
  const _tokens = Object.values(tokens);

  //console.log("Collection =>", _tokens)

  if (!_tokens) {
    return <p>Loading...</p>;
  }

  if (!_tokens.length) return null;

  return (
    // <div
    //   className={`flex items-center gap-10 hover:opacity-50 h-[50px] cursor-pointer stroke-primary stroke-2 bg-transparent border ${
    //     selected ? "border-green-500" : "border-red-500"
    //   }`}
    // >
    <>
      {/* <Checkbox /> */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`w-full m-5`} asChild>
          <span>
            {_tokens[0].name} {_tokens[0].selected}
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
    </>
  );
}

export function TokenSelectorList({ account }: TokenSelectorListProps) {
  const [loading, setLoading] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<FormattedSelection>({ contracts: [], tokens: [] });
  const [content, setContent] = useState<FormattedCollection>({});
  const [saveSelection, setSaveSelection] = useState([[], []]);

  useEffect(() => {
    const _fetch = async () => {
      const data = await fetch(`/dashboard/api/tokens?account=${account}`, {
        method: "GET",
        headers: {},
      });

      if (data.ok) {
        console.log("API: ", data);
        const jsonData = await data.json();
        setContent(jsonData.tokens);
      }

      setLoading(false);
    };
    _fetch();
  }, []);

  useEffect(() => {
    const formatted = Object.entries(content).map((item) => [[item[0]], [item[1].selected]]);
    setSaveSelection(formatted as any);
  }, [content]);

  const { data, write } = useContractWrite({
    address: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
    abi: LINKT_ABI,
    functionName: "addUserTokenMapping",
    args: saveSelection[0],
  });

  const handleSave = () => {
    console.log(saveSelection[0]);
    write?.();
  };

  useContractRead({
    abi: LINKT_ABI,
    enabled: Boolean(true),
    functionName: "getUserTokenMapping",
    onSuccess(data: any) {
      console.log("DATAAAAA ::::", data);
      if (data[0].length && data[1].length) {
        for (let i = 0; i < data[0].length; i++) {
          content[data[0][i]].selected = data[1][i];
        }
      }
    },
    args: [account],
    address: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
  }) as any;

  if (loading) {
    return <p>Loading..</p>;
  }

  console.log("Content => ", content);

  return (
    <>
      <div className={`max-h-[225px] overflow-y-scroll`}>
        {Object.values(content).length
          ? Object.values(content).map((tokens, i) => (
              <div
                key={tokens.tokens[0].address}
                className={`flex items-center gap-10 hover:opacity-50 h-[50px] cursor-pointer stroke-primary stroke-2 bg-transparent border ${
                  tokens.selected !== "" ? "border-green-500" : "border-red-500"
                }`}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger className={`w-full m-5`} asChild>
                    <span>
                      {tokens.tokens[0].name} {tokens.selected}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {tokens.tokens.map((token) => (
                      <DropdownMenuItem
                        key={token.id}
                        onClick={() => {
                          setContent((prev) => {
                            return {
                              ...prev,
                              [token.address]: {
                                ...prev[token.address],
                                selected: token.id,
                              },
                            };
                          });
                        }}
                      >
                        <Image unoptimized={true} src={token.thumbnail} height={50} width={50} alt={token.id} />
                        {token.id}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          : null}
      </div>
      <button className="mt-5 border border-white h-[50px]" onClick={() => handleSave()}>
        SAVE
      </button>
    </>
  );
}
