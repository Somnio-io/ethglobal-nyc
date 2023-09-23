import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  ObjectMetadata,
  User,
  authUserToken,
  createApiGatewayResponse,
  getItem,
  getPreSignedUrl,
  mimeTypeToExtension,
} from "./utils";
import { S3Client } from "@aws-sdk/client-s3";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME as string;
const BUCKET_NAME = process.env.BUCKET_NAME as string;

const s3 = new S3Client({ logger: console });

export const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ logger: console })
);

export const createUploadPresign: APIGatewayProxyHandler = async (
  event,
  context
) => {
  const lowerCaseAddress = await authUserToken(event.headers["Authorization"]);
  if (!lowerCaseAddress) {
    return createApiGatewayResponse(
      403,
      JSON.stringify({ message: "Invalid Token" })
    );
  }

  const contentType = event.headers["content-type"];
  const hash = event.headers["x-amz-meta-md5"] || "";
  const audience = event.headers["x-amz-meta-audience"] || "";
  const name = event.headers["x-amz-meta-name"] || "";
  const description = event.headers["x-amz-meta-description"] || "";
  const publisher = lowerCaseAddress; // If the user has defined a name use that over this.

  if (!contentType) {
    return createApiGatewayResponse(
      400,
      JSON.stringify({ message: "Unknown File Type" })
    );
  }
  const extension = mimeTypeToExtension(contentType);

  const user = await getItem<User>(
    USERS_TABLE_NAME,
    { address: lowerCaseAddress },
    docClient
  );

  const metadata: ObjectMetadata = {
    hash,
    name,
    description,
    audience,
    publisher,
  };

  let uploadUrl;
  if (user) {
    const expiresIn = 60; // URL will expire in 60 seconds
    const objectKey = `uploads/${lowerCaseAddress}/${hash}${extension}`;
    uploadUrl = await getPreSignedUrl(
      BUCKET_NAME,
      objectKey,
      expiresIn,
      s3,
      "PUT",
      metadata
    );
  }

  if (user) {
    return createApiGatewayResponse(
      200,
      JSON.stringify({ message: "OK", uploadUrl })
    );
  }
  return createApiGatewayResponse(
    404,
    JSON.stringify({ message: "Not Found" })
  );
};
