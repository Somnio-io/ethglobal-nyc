"use client";

import { AudienceSelector } from "@/(components)/audience-selector/audience-selector";
import { DefaultInput } from "@/(components)/input/default-input";
import { Button } from "@/(components)/ui/button";
import { EAudience, audiences } from "@/(components)/video/input-video-upload";
import { LIVE_URL } from "@/(lib)/utils";
import { useState } from "react";

export default function Page({ params }: { params: { address: string } }) {
  const [streamName, setStreamName] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [selectedAudience, setSelectedAudience] = useState(EAudience.ALL);

  return (
    <>
      <h2 className="text-2xl font-bold tracking-tight space-y-6 mb-4">Go Live!</h2>
      <p className="text-muted-foreground mb-8">Stream in real-time to your linked audience</p>
      <DefaultInput
        type="text"
        className="mb-2"
        value={streamName}
        onChange={(e) => setStreamName(e.target.value)}
        placeholder=""
        required={true}
        name="Name"
      />
      <DefaultInput
        type="text"
        placeholder=""
        className="mb-2"
        onChange={(e) => setStreamDescription(e.target.value)}
        value={streamDescription}
        required={true}
        name="Description"
      />
      Stream Input URL:
      <p className="text-muted-foreground mb-2">{process.env.FEATURE_ENABLE_STREAMING_ENDPOINT}</p>
      Stream Key:
      <p className="text-muted-foreground mb-2">{process.env.NEXT_PUBLIC_FEATURE_ENABLE_STREAM_KEY}</p>
      <div className="flex space-x-2 flex-start mb-2">
        {audiences.map((audience) => (
          <AudienceSelector key={audience} name={audience} isSelected={selectedAudience === audience} handler={setSelectedAudience} />
        ))}
      </div>
      <Button
        className="mt-4"
        onClick={async () => {
          const token = localStorage.getItem("token");
          const data = await fetch(
            `${LIVE_URL}`, // Its not the owners contract we care about, its the contract they own
            {
              method: "POST",
              body: JSON.stringify({
                name: streamName,
                description: streamDescription,
                audience: selectedAudience,
              }),
              headers: {
                Authorization: token as string,
              },
            }
          );
          if (data.ok) {
            const revalidate = await fetch("/dashboard/api/revalidate?tag=discovery&secret=foobar", {
              method: "POST",
            });
            console.log(revalidate);
            console.log(`User is now live..`);
          }
        }}
      >
        Go Live
      </Button>
    </>
  );
}
