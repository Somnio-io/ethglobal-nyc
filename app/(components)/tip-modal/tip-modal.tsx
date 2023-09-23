"use client";

import * as React from "react";

import { Button } from "@/(components)/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/(components)/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/(components)/ui/select";
import { Label } from "@/(components)/ui/label";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { ReloadIcon, CheckIcon } from "@radix-ui/react-icons";

export function TipModal() {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave a tip </DialogTitle>
          <DialogDescription>Select the token you would like to leave a tip with.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Currency
            </Label>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">USDC</SelectItem>
                <SelectItem value="light">GHO</SelectItem>
                <SelectItem value="dark">APE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button className={`${isSuccess && !isLoading}? 'bg-green-500':''`} type="submit" onClick={() => write?.()} disabled={!write || isLoading}>
            {isLoading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Tip"
            )}
            {isSuccess ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4 animate-bounce" />
                Successful
              </>
            ) : (
              "Tip"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
