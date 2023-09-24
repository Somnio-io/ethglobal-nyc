"use client";

import * as React from "react";

import { Button } from "@/(components)/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/(components)/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/(components)/ui/select";
import { Label } from "@/(components)/ui/label";
import { Input } from "@/(components)/ui/input";

import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useContractRead, erc20ABI } from "wagmi";
import { ReloadIcon, CheckIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { LINKT_ABI } from "@/(lib)/utils";
import { MaxInt256 } from "ethers";

export function TipModal({ target, usersWalletAddress }: any) {
  console.log(usersWalletAddress);
  const [selectedToken, setSelectedToken] = useState(null);
  const [inputTip, setInputTip] = useState<bigint>(0n);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Approve");

  const { refetch } = useContractRead({
    address: process.env.NEXT_PUBLIC_FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS as `0x${string}`,
    enabled: true,
    onSuccess: async (data: string) => {
      console.log(`Data!!!`, data);
      console.log(data.toString());
      if (parseInt(data.toString()) > 0) {
        setIsApproved(true);
      }
    },
    abi: erc20ABI,
    args: [usersWalletAddress!, process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`],
    functionName: "allowance",
  });

  const {
    write: approveSpend,
    isLoading: loadingApprove,
    isSuccess: successApproved,
  } = useContractWrite({
    address: process.env.NEXT_PUBLIC_FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    onSuccess(data, variables, context) {
      console.log(data);
      refetch();
    },
    onError(error, variables, context) {
      console.log(error);
    },
    functionName: "approve",
    args: [process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`, MaxInt256],
  });

  const { write, isLoading, isSuccess } = useContractWrite({
    address: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
    abi: LINKT_ABI,
    functionName: "tipContentCreator",
    onSettled(data, error, variables, context) {
      console.log(data, error);
    },
    args: [inputTip, target],
  });

  useEffect(() => {
    if (isLoading) {
      setButtonText("Please wait");
    } else if (isSuccess) {
      setButtonText("Successful");
    }
    setButtonText(isApproved ? "Tip" : "Approve");
  }, [isApproved, isLoading, isSuccess]);

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
            <Select onValueChange={(value: any) => setSelectedToken(value)} required>
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
              Amount
            </Label>
            <Input id="tip-value" value={inputTip.toString()} className="col-span-2" onChange={(e) => setInputTip(BigInt(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="default" type="submit" onClick={() => (isApproved ? write?.() : approveSpend?.())} disabled={isDisabled}>
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
