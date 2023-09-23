"use client";

import * as React from "react";

import { Button } from "@/(components)/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/(components)/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/(components)/ui/select";
import { Label } from "@/(components)/ui/label";
import { Input } from "@/(components)/ui/input";

import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { ReloadIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export function TipModal() {
  const [selectedToken, setSelectedToken] = useState(null);
  const [inputTip, setInputTip] = useState("0");

  const { config } = usePrepareContractWrite({
    address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    abi: [
      {
        name: "tip",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [],
      },
    ],
    functionName: "tip",
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  let buttonText = "Tip";
  let buttonIcon = null;
  let buttonClass = "";

  if (isLoading) {
    buttonText = "Please wait";
    buttonIcon = <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />;
  } else if (isSuccess) {
    buttonText = "Successful";
    buttonIcon = <CheckIcon className="mr-2 h-4 w-4 animate-bounce" />;
    buttonClass = "bg-green-500";
  }

  const isDisabled = !selectedToken || !write || isLoading;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Tip</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-left">
        <DialogHeader>
          <DialogTitle>Leave a tip </DialogTitle>
          <DialogDescription>Select the token you would like to leave a tip with.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Currency
            </Label>
            <Select onSelect={(value) => setSelectedToken(value)} required>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="GHO">GHO</SelectItem>
                <SelectItem value="APE">APE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tip-value" className="text-right">
              How much
            </Label>
            <Input id="tip-value" value={inputTip} className="col-span-2" onChange={(e) => setInputTip(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className={buttonClass} type="submit" onClick={() => write?.()} disabled={isDisabled}>
            {buttonIcon}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
