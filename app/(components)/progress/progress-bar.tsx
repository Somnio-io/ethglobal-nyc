"use client";

import { Progress } from "@/(components)/ui/progress";

export function ProgressBar({ progress }: { progress: number }) {
  return <Progress value={progress} className="w-full" />;
}
