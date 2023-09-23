"use client";

import { CONTENT_URL, ContentKey, Video, transformData } from "@/(lib)/utils";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  return <span>Hello Watch World</span>;
}
