import { createRequest } from "@aws-sdk/util-create-request";
import { formatUrl } from "@aws-sdk/util-format-url";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Readable } from "stream";

const Web3Token = require("web3-token");

export interface User {
  address: string;
  connectedContract?: string;
  liveId?: string;
  liveUrl?: string;
}

export interface S3FileOptions {
  bucketName: string;
  key: string;
  body: Buffer | Readable | Uint8Array | string;
  contentType?: string;
  acl?: string;
  metadata?: { [key: string]: string };
}

export const getObjectMetadata = async (
  bucketName: string,
  objectKey: string,
  s3: S3Client
) => {
  try {
    const input = {
      Bucket: bucketName,
      Key: objectKey,
    };

    // Fetch object metadata
    const result = await s3.send(new HeadObjectCommand(input));

    // Retrieve name and description metadata tags
    const metadata = result.Metadata || {};
    const name = metadata.name || "";
    const description = metadata.description || "";
    const audience = metadata.audience || "ALL";
    const publisher = metadata.publisher || "";
    const live = metadata.live || ""; // Only for live streaming content

    return { name, description, audience, publisher, live };
  } catch (error) {
    console.error("An error occurred while fetching metadata:", error);
    throw error;
  }
};

export interface ObjectMetadata {
  hash: string;
  name: string;
  description: string;
  audience: string;
  publisher: string;
}

export const getPreSignedUrl = async (
  bucketName: string,
  key: string,
  expires: number,
  s3: S3Client,
  operation: "PUT" | "GET",
  metadata?: ObjectMetadata
): Promise<string> => {
  const signer = new S3RequestPresigner({ ...s3.config });

  let command;

  if (operation === "PUT") {
    if (!metadata) {
      throw "Metadata require for PUT calls";
    }
    const { hash, name, audience, description, publisher } = metadata;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Metadata: {
        md5: hash || "",
        name: name || "",
        audience: audience || "ALL",
        description: description || "",
        publisher: publisher || "",
        // live doesnt need to go here since we upload this is a different manner
      },
    });
  } else if (operation === "GET") {
    command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseCacheControl: `max-age=3600`,
    });
  } else {
    throw new Error("Unsupported operation");
  }

  const request = await createRequest(s3, command);
  const signedUrl = formatUrl(
    await signer.presign(request, { expiresIn: expires })
  );

  return signedUrl;
};

export const listS3Objects = async (
  bucketName: string,
  prefix: string,
  s3Client: S3Client
) => {
  const listParams = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  try {
    const listResponse = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );
    return listResponse.Contents || [];
  } catch (error) {
    console.error("Error listing S3 objects: ", error);
    throw new Error("Internal Server Error");
  }
};

interface S3ReadFileOptions {
  bucketName: string;
  key: string;
}

export const readFileFromS3 = async (
  options: S3ReadFileOptions,
  s3: S3Client
): Promise<string> => {
  const params: GetObjectCommandInput = {
    Bucket: options.bucketName,
    Key: options.key,
  };

  try {
    const result = await s3.send(new GetObjectCommand(params));

    if (!result.Body) {
      throw new Error(
        `No body found for ${options.key} in ${options.bucketName}`
      );
    }

    return await result.Body.transformToString();
  } catch (error) {
    console.error(
      `Error reading ${options.key} from ${options.bucketName}:`,
      error
    );
    throw error;
  }
};

export const mimeTypeToExtension = (mimeType: string) => {
  const mimeToExt: { [key: string]: string } = {
    // Images
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/svg+xml": ".svg",
    "image/tiff": ".tif",
    "image/x-icon": ".ico",

    // Videos
    "video/mp4": ".mp4",
    "video/mpeg": ".mpeg",
    "video/ogg": ".ogv",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
    "video/x-ms-wmv": ".wmv",
    "video/x-flv": ".flv",
    "video/3gpp": ".3gp",
  };

  return mimeToExt[mimeType] || null;
};

export const authUserToken = async (
  authroizationHeader: string | undefined
) => {
  try {
    const { address } = await Web3Token.verify(authroizationHeader, {});
    const lowerCaseAddress = address.toLowerCase();
    return lowerCaseAddress;
  } catch (error) {
    return null;
  }
};

export const queryItems = async <T>(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: { [key: string]: any },
  client: DynamoDBDocumentClient,
  indexName?: string
): Promise<T[] | null> => {
  const queryInput: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    IndexName: indexName,
  };

  try {
    const { Items } = await client.send(new QueryCommand(queryInput));
    return Items as T[];
  } catch (error) {
    console.error("An error occurred while querying items:", error);
    return null;
  }
};

export const getItem = async <T>(
  tableName: string,
  key: { [key: string]: any },
  client: DynamoDBDocumentClient
): Promise<T | null> => {
  const getItemInput = {
    TableName: tableName,
    Key: key,
  };

  const { Item } = await client.send(new GetCommand(getItemInput));
  return Item as T;
};

export const updateUserConnectedContract = async <T>(
  tableName: string,
  address: string,
  contractAddress: string,
  client: DynamoDBDocumentClient
): Promise<Partial<T>> => {
  const updateItemInput = {
    TableName: tableName,
    Key: {
      address,
    },
    UpdateExpression: "set contractAddress = :contractAddress",
    ExpressionAttributeValues: {
      ":contractAddress": contractAddress.toLowerCase(),
    },
    ReturnValues: "UPDATED_NEW",
  };

  const { Attributes } = await client.send(new UpdateCommand(updateItemInput));
  console.log("Item updated:", Attributes);
  return Attributes as Partial<T>;
};

export const updateUserLiveStatus = async <T>(
  tableName: string,
  address: string,
  liveId: string,
  liveUrl: string,
  client: DynamoDBDocumentClient
): Promise<Partial<T>> => {
  const updateItemInput = {
    TableName: tableName,
    Key: {
      address,
    },
    UpdateExpression: "set liveUrl = :liveUrl, liveId = :liveId",
    ExpressionAttributeValues: {
      ":liveUrl": liveUrl,
      ":liveId": liveId,
    },
    ReturnValues: "UPDATED_NEW",
  };

  const { Attributes } = await client.send(new UpdateCommand(updateItemInput));
  console.log("Item updated:", Attributes);
  return Attributes as Partial<T>;
};

export const updateLikes = async <T>(
  tableName: string,
  videoId: string,
  client: DynamoDBDocumentClient
): Promise<Partial<T>> => {
  const updateItemInput = {
    TableName: tableName,
    Key: {
      id: videoId,
    },
    UpdateExpression: "set likes = likes + :val, lastLikedField = :time",
    ExpressionAttributeValues: {
      ":val": 1,
      ":time": new Date().toISOString(),
    },
    ReturnValues: "UPDATED_NEW",
  };

  const { Attributes } = await client.send(new UpdateCommand(updateItemInput));
  console.log("Item updated:", Attributes);
  return Attributes as Partial<T>;
};

export const createApiGatewayResponse = (status: number, body: any) => {
  return {
    isBase64Encoded: false,
    statusCode: status,
    body: JSON.stringify(body),
    headers: {
      "Cache-Control": "must-revalidate",
      "max-age": "10",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Or specify your specific origin, like "http://localhost:3000"
      "Access-Control-Allow-Credentials": true, // For cookies, authorization headers, etc.
      "Access-Control-Allow-Headers":
        "Content-Type,Cache-Control,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token", // What headers the client is allowed to send
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS", // What methods are allowed
    },
  };
};

export const putItem = async <T>(
  tableName: string,
  item: Partial<T>,
  client: DynamoDBDocumentClient
): Promise<Partial<T>> => {
  const putItemInput = {
    TableName: tableName,
    Item: item,
  };

  await client.send(new PutCommand(putItemInput));
  return item;
};

export const writeFileToS3 = async (
  options: S3FileOptions,
  s3: S3Client
): Promise<void> => {
  const params: PutObjectCommandInput = {
    Bucket: options.bucketName,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType,
    ACL: options.acl,
    Metadata: options.metadata,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    console.log(
      `Successfully uploaded ${options.key} to ${options.bucketName}`
    );
  } catch (error) {
    console.error(
      `Error uploading ${options.key} to ${options.bucketName}:`,
      error
    );
    throw error;
  }
};

interface S3DeleteFileOptions {
  bucketName: string;
  key: string;
}

export const deleteFileFromS3 = async (
  options: S3DeleteFileOptions,
  s3: S3Client
): Promise<void> => {
  const params: DeleteObjectCommandInput = {
    Bucket: options.bucketName,
    Key: options.key,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    console.log(
      `Successfully deleted ${options.key} from ${options.bucketName}`
    );
  } catch (error) {
    console.error(
      `Error deleting ${options.key} from ${options.bucketName}:`,
      error
    );
    throw error;
  }
};
