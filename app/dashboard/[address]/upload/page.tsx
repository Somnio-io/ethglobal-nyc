"use client";

import ContractLink from "@/(components)/contract-link/contract-link";
import { UploadVideo } from "@/(components)/video/input-video-upload";
import { User } from "@/(context)/AuthContext";
import { USER_URL } from "@/(lib)/utils";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { address: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [content, setContent] = useState<Partial<User>>({});
  const [showConnectContract, setShowConnectContract] =
    useState<boolean>(false);

  useEffect(() => {
    console.log(`Running UE`);
    const _fetch = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Login to upload content.");
        setLoading(false);
        return;
      }

      const data = await fetch(USER_URL, {
        method: "GET",
        headers: {
          Authorization: token as string,
        },
      });
      const jsonData = JSON.parse(await data.json());
      if (!jsonData.user?.contractAddress) {
        setShowConnectContract(true);
        setLoading(false);
        return;
      }
      setContent(jsonData);
      setLoading(false);
    };
    _fetch();
  }, []);

  const UploadForm = () => (
    <>
      <UploadVideo />
    </>
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {showConnectContract ? (
        <>
          <ContractLink address={params.address} />
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight space-y-6">
            Upload
          </h2>
          <p className="text-muted-foreground">
            Upload your content and pick the audience you want to share it with.
          </p>
          <UploadForm />
        </>
      )}
    </>
  );
}
