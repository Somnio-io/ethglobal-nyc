import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { authUserToken, createApiGatewayResponse, getItem, getObjectMetadata, getPreSignedUrl, listS3Objects, readFileFromS3 } from "./utils";
import { S3Client } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.BUCKET_NAME as string;

const s3 = new S3Client();

function getLastPartOfPath(path: string) {
  const parts = path.split("/");
  const lastPart = parts.pop();
  if (!lastPart) {
    return "";
  }

  const lastDotIndex = lastPart.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return lastPart.substring(0, lastDotIndex);
  }

  return lastPart;
}

function getExtensionOfPath(path: string) {
  const parts = path.split("/");
  const lastPart = parts.pop();

  if (lastPart) {
    const lastDotIndex = lastPart.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      return lastPart.substring(lastDotIndex + 1);
    }
  }

  return null;
}

interface ContentKey {
  id: string;
  data: Content;
  name: string;
  audience: string;
  description: string;
  publisher: string;
  live: string;
}

interface Content {
  url: string;
  created: Date | undefined;
  size: number | undefined;
  extension: string | undefined;
}

export const docClient = DynamoDBDocumentClient.from(new DynamoDBClient());

export const getPresignUrls: APIGatewayProxyHandler = async (event) => {
  console.log(event);

  const token = event.headers["Authorization"] as string;

  // If someone wants to view all of someones content
  let requestedContract: string | undefined;

  // If someone requests a specific videoId (they also pass a publisher)
  let videoId: string | undefined;
  let publisher: string | undefined;

  if (event.queryStringParameters?.requestedContract) {
    requestedContract = event.queryStringParameters?.requestedContract;
  }

  if (event.queryStringParameters?.videoId) {
    videoId = event.queryStringParameters?.videoId;
    publisher = event.queryStringParameters?.publisher;
  }

  const presignedUrls: ContentKey[] = [];
  let action = await determineAction(requestedContract, videoId, publisher, token);

  if (!action) {
    return createApiGatewayResponse(403, JSON.stringify({ message: "Invalid User" }));
  }

  // query contract with ethers.
  //

  try {
    const s3Objects = await listS3Objects(BUCKET_NAME, action.path, s3);

    for (const item of s3Objects) {
      if (item.Key) {
        const { name, description, audience, publisher, live } = await getObjectMetadata(BUCKET_NAME, item.Key, s3);

        // We are in discovery, dont add things that are not available to ALL audiences
        if (action.path === `uploads/` && audience !== "ALL") {
          continue;
        }

        // Generate presigned URL for each file
        const expiresIn = 60 * 60; // URL will expire in 1 hour
        // For the item, get its metadata and from the metadata get
        const presignedUrl = await getPreSignedUrl(BUCKET_NAME, item.Key, expiresIn, s3, "GET");

        presignedUrls.push({
          id: getLastPartOfPath(item.Key) as string,
          name,
          description,
          audience,
          publisher,
          live,
          data: {
            url: live ? await readFileFromS3({ bucketName: BUCKET_NAME, key: item.Key }, s3) : presignedUrl,
            created: item.LastModified,
            size: item.Size,
            extension: getExtensionOfPath(item.Key) as string,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    return createApiGatewayResponse(500, JSON.stringify({ message: "Internal Server Error" }));
  }

  return createApiGatewayResponse(200, JSON.stringify({ message: "OK", presignedUrls }));
};

interface Action {
  request: "ALL" | "HOLDERS" | "PROFILE";
  path: string;
  lowerCaseAddress?: string;
}

async function determineAction(requestedContract: string | undefined, videoId: string | undefined, publisher: string | undefined, token: string) {
  let action;

  if (requestedContract) {
    const lowerCaseAddress = await authUserToken(token);
    if (!lowerCaseAddress || lowerCaseAddress !== requestedContract.toLowerCase()) {
      return null;
    }
    action = {
      path: `uploads/${requestedContract}/`,
      request: "HOLDERS",
      lowerCaseAddress,
    };
  } else if (videoId && publisher && token !== "unauthorized") {
    const lowerCaseAddress = await authUserToken(token);
    if (!lowerCaseAddress) {
      return null;
    }
    action = {
      path: `uploads/${publisher}/${videoId}`,
      request: "HOLDERS",
      lowerCaseAddress,
    };
  } else if (videoId && publisher && token === "unauthorized") {
    action = {
      path: `uploads/${publisher}/${videoId}`,
      request: "ALL",
    };
  } else {
    action = {
      path: `uploads/`,
      request: "ALL",
    };
  }

  return action as Action;
}
