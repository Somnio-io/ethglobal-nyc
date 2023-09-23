"use client";

import React from "react";
import ClientOnly from "./clientOnly";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Wallet() {
  return (
    <div>
      <ClientOnly>
        <ConnectButton />
      </ClientOnly>
    </div>
  );
}
