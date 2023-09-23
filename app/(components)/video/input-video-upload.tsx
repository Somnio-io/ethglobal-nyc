"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/(components)/ui/input";
import { Label } from "@/(components)/ui/label";
import { LINKT_ABI, UPLOAD_URL, USER_URL, uploadToS3 } from "@/(lib)/utils";
import { useFileWithSource } from "@/(hooks)/useFileWithSource";
import { Button } from "../ui/button";
import { DefaultInput } from "../input/default-input";
import { AudienceSelector } from "../audience-selector/audience-selector";
import SparkMD5 from "spark-md5";
import { ProgressBar } from "../progress/progress-bar";
// import ethers from 'ethers'
import { Contract } from "ethers";
import { useContractRead, useContractWrite, usePrepareContractWrite, useWalletClient } from "wagmi";

async function calculateMD5(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const blobSlice = File.prototype.slice;
    const chunkSize = 2097152; // Read 2MB chunks at a time
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    let currentChunk = 0;

    const reader = new FileReader();

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;

      reader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        spark.append(arrayBuffer); // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          const hash = spark.end();
          resolve(hash);
        }
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = (event) => {
      reject(new Error(`File could not be read: ${event.target?.error?.message}`));
    };

    loadNext(); // Start the read with the first chunk
  });
}

export enum EAudience {
  ALL = "ALL",
  HOLDERS = "HOLDERS",
  TRAIT = "TRAIT",
  TOKEN = "TOKEN",
}

export const audiences: EAudience[] = [EAudience.ALL, EAudience.HOLDERS, EAudience.TRAIT, EAudience.TOKEN];

export function UploadVideo() {
  // const { data: signer } = useSigner()
  // const { data: walletClient, isError, isLoading } = useWalletClient()

  // Bring in the transaction we want to call here from a useContract
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadDescription, setUploadDescription] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [selectedAudience, setSelectedAudience] = useState(EAudience.ALL);
  const [connectedContract, setConnectedContract] = useState("");
  const [loading, setLoading] = useState(true);
  const [nextPublicationId, setNextPublicationId] = useState(0);

  const [videoData, handleVideoFileChange] = useFileWithSource();
  const [placeholderData, handlePlaceholderFileChange] = useFileWithSource();

  useEffect(() => {
    const _fetch = async () => {
      const token = localStorage.getItem("token");
      const data = await fetch(`${USER_URL}`, {
        method: "GET",
        headers: {
          Authorization: token as string,
        },
      });
      const jsonData = JSON.parse(await data.json());
      console.log(jsonData);
      if (jsonData.user) {
        setConnectedContract(jsonData.user?.contractAddress);
      }
      setLoading(false);
    };
    _fetch();
    // Based on this publisher, look up their connected contract
    // Set state with that response setConnectedContract()
  }, []);
  console.log(`The Deployed Contract is ${process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS}`);

  const { data: publicationCount } = useContractRead({
    abi: LINKT_ABI,
    enabled: Boolean(connectedContract),
    functionName: "getPublicationCount",
    onSuccess(data: any) {
      setNextPublicationId(parseInt(data) + 1);
    },
    args: [connectedContract],
    address: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
  }) as any;

  // console.log(`Publication Count! `, publicationCount);
  const { config } = usePrepareContractWrite({
    abi: LINKT_ABI,
    functionName: "publishVideo",
    onSuccess(data) {
      console.log(data);
    },
    onError(err) {
      console.log(err);
    },
    // 2, "md5Hash2", erc721Mock.address, {
    //   audienceType: 0,
    //   tokenId: 0,
    // }
    enabled: Boolean(uploadName && uploadDescription && selectedAudience && fileHash && nextPublicationId > 0),
    args: [
      nextPublicationId, // VideoId - always just increment what is existing
      fileHash,
      connectedContract,
      {
        audienceType: audiences.indexOf(selectedAudience),
        tokenId: 0, // Only for token publishing
      },
    ],
    address: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
  });

  const { data, isLoading, isSuccess, write } = useContractWrite({
    ...config,
    onSuccess(data, variables, context) {
      console.log(data);
    },
    onError(error, variables, context) {
      console.log(error);
    },
  });

  const handleUpload = async () => {
    const token = localStorage.getItem("token");

    if (!videoData.file) {
      alert("Please select a file to upload.");
      return;
    }

    const md5Hash = await calculateMD5(videoData.file);
    console.log(md5Hash);
    setFileHash(`File hash is ${md5Hash}`);
    const videoPreSignedUrl = await fetch(UPLOAD_URL, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "content-type": videoData.file.type,
        "x-amz-meta-md5": md5Hash,
        "x-amz-meta-name": uploadName,
        "x-amz-meta-audience": selectedAudience,
        "x-amz-meta-description": uploadDescription,
        "Cache-Control": "max-age=86400", // Cache max-age 1 day
        Authorization: token as string,
      },
    });
    const videoPreSignedUrlData = JSON.parse(await videoPreSignedUrl.json());

    try {
      console.log(`Calling write!`);
      console.log(nextPublicationId, fileHash, connectedContract, selectedAudience);
      write?.(); // Publish Video content to contract
    } catch (error) {
      console.log(`Error!`, error);
      return; // Return, dont continue to upload anything
    }

    if (placeholderData.file) {
      const placeholderPresignUrl = await fetch(UPLOAD_URL, {
        method: "GET",
        cache: "no-cache",
        headers: {
          "content-type": placeholderData.file.type,
          "x-amz-meta-md5": md5Hash,
          "Cache-Control": "max-age=86400", // Cache max-age 1 day
          Authorization: token as string,
        },
      });
      const placeholderPresignUrlData = JSON.parse(await placeholderPresignUrl.json());
      await uploadToS3(placeholderPresignUrlData.uploadUrl, placeholderData.file, placeholderData.file.type, setProgress);
    }
    try {
      let response;
      if (token) {
        // Make a contract call here to publish video
        // If the user declines, dont upload.

        response = await fetch(videoPreSignedUrlData.uploadUrl, {
          method: "PUT",
          body: videoData.file,
          headers: {
            "Content-Type": videoData.file.type,
          },
        });
      }

      if (response?.ok) {
        // After a successful video being published, remove the discovery cache
        const revalidate = await fetch("/dashboard/api/revalidate?tag=discovery&secret=foobar", {
          method: "POST",
        });
        console.log(revalidate);
        setUploadStatus("Successfully uploaded file.");
      } else {
        setUploadStatus("Failed to upload file.");
      }
    } catch (error) {
      setUploadStatus(`An error occurred: ${error}`);
    }
  };

  if (loading) {
    return <p>Loading..</p>;
  }

  return (
    <div className="grid w-full lg:max-w-sm items-center gap-1.5 space-y-6">
      <DefaultInput type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="" required={true} name="Name" />

      <DefaultInput
        type="text"
        placeholder=""
        onChange={(e) => setUploadDescription(e.target.value)}
        value={uploadDescription}
        required={true}
        name="Description"
      />

      <Label htmlFor="placeholder">Upload Placeholder</Label>
      <Input id="placeholder-upload" type="file" className="cursor-pointer hover:opacity-70" onChange={handlePlaceholderFileChange} />

      {placeholderData.source ? <Image src={placeholderData.source} height={250} unoptimized={true} width={250} alt={"Placeholder Image"} /> : null}

      <Label htmlFor="video-upload">Upload Video</Label>
      <Input id="video-upload" className="cursor-pointer hover:opacity-70" type="file" onChange={handleVideoFileChange} />
      {videoData.source ? <video src={videoData.source} height={250} width={250} autoPlay={false} controls={true} muted={false} /> : null}

      <div className="flex space-x-2 flex-start ">
        {audiences.map((audience) => (
          <AudienceSelector key={audience} name={audience} isSelected={selectedAudience === audience} handler={setSelectedAudience} />
        ))}
      </div>

      <Button onClick={handleUpload} className="btn btn-primary">
        Upload
      </Button>
      {progress > 0 ? <ProgressBar progress={progress} /> : null}
      {uploadStatus ? <div className="text-sm text-white">{uploadStatus}</div> : null}
    </div>
  );
}
