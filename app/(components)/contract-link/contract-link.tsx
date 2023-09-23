"use client";

import * as z from "zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/(components)/ui/form";
import { Input } from "@/(components)/ui/input";
import { Button } from "@/(components)/ui/button";
import { useContractRead } from "wagmi";
import { LINKT_ABI, USER_URL } from "@/(lib)/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  contract: z.string().min(42).max(42),
});

interface IContractLink {
  address: string;
}

export function ContractLink({ address }: IContractLink) {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [verified, setVerified] = useState<boolean>(false);

  useContractRead({
    address: contractAddress as `0x${string}`,
    enabled: contractAddress ? true : false,
    onSuccess: async (data: string) => {
      if (data.toLowerCase() === address.toLowerCase()) {
        const token = localStorage.getItem("token");
        const req = await fetch(USER_URL, {
          method: "PUT",
          headers: {
            Authorization: token as string,
          },
          body: JSON.stringify({
            connectedContract: contractAddress,
          }),
        });
        if (req.ok) {
          setVerified(true);
          return router.replace(`/dashboard/${address}`);
        }
      }
    },
    abi: LINKT_ABI,
    functionName: "owner", // Assumes OpenZep Ownable is being used
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setContractAddress(values.contract as `0x${string}`);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="contract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Collection Address</FormLabel>
                <FormControl>
                  <Input placeholder="0x234" {...field} />
                </FormControl>
                <FormDescription>Enter your contract address to link it to your profile.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
}

export default ContractLink;
