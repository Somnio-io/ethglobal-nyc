import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  User,
  authUserToken,
  createApiGatewayResponse,
  deleteFileFromS3,
  getItem,
  updateUserLiveStatus,
  writeFileToS3,
} from "./utils";
import { S3Client } from "@aws-sdk/client-s3";

import {
  IvsClient,
  BatchGetChannelCommand,
  BatchGetChannelCommandInput,
  BatchGetChannelCommandOutput,
  StopStreamCommand,
  StopStreamCommandOutput,
} from "@aws-sdk/client-ivs";
const { v4: uuidv4 } = require("uuid");

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME as string;
const BUCKET_NAME = process.env.BUCKET_NAME as string;
const STREAMING_PLAYBACK_URL = process.env.STREAMING_PLAYBACK_URL as string;

const ivs = new IvsClient({ region: "us-east-1" });
const s3 = new S3Client({ logger: console });

export const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ logger: console })
);

export const handleGoLive: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);
  const channelArn = process.env.CHANNEL_ARN as string;
  let data: StopStreamCommandOutput | Partial<User> | undefined;

  const body = JSON.parse(event.body!);

  const name = body.name || "";
  const description = body.description || "";
  const audience = body.audience || "ALL";

  if (event.httpMethod === "GET") {
    // First get all streams that are currently live (query user table)
    // for each user, get the arn of their channel

    const params: BatchGetChannelCommandInput = {
      arns: [channelArn],
    };
    const command = new BatchGetChannelCommand(params);
    const data = await ivs.send(command);

    // This will return all streams, depending on whos asking, we can return valid streams here based on their token/ownership or based on the streams audience
    return createApiGatewayResponse(200, JSON.stringify({ data }));
  }

  const lowerCaseAddress = await authUserToken(event.headers["Authorization"]);
  if (!lowerCaseAddress) {
    return createApiGatewayResponse(
      403,
      JSON.stringify({ message: "Invalid Token" })
    );
  }
  const user = await getItem<User>(
    USERS_TABLE_NAME,
    { address: lowerCaseAddress },
    docClient
  );
  if (!user) {
    return createApiGatewayResponse(
      403,
      JSON.stringify({ message: "Invalid User" })
    );
  }

  if (event.httpMethod === "POST" && lowerCaseAddress) {
    // Going Live here is only possible if a publication has been created + the user is registered + contract is linked
    // Check user
    // Check connected contract in dynamo
    // Check publication on-chain
    // Update the users live status

    const liveId = uuidv4();
    data = await updateUserLiveStatus<User>(
      USERS_TABLE_NAME,
      lowerCaseAddress,
      liveId,
      STREAMING_PLAYBACK_URL, // Each user will have their own playback url but in this case we just have one
      docClient
    );

    await writeFileToS3(
      {
        key: `uploads/${lowerCaseAddress}/${liveId}`,
        bucketName: BUCKET_NAME,
        body: STREAMING_PLAYBACK_URL,
        metadata: {
          audience, // scope to actual audience
          name,
          live: liveId,
          publisher: lowerCaseAddress,
          description,
        },
      },
      s3
    );
  }

  if (event.httpMethod === "DELETE") {
    const input = {
      channelArn,
    };
    const command = new StopStreamCommand(input);
    await ivs.send(command);

    data = await updateUserLiveStatus<User>(
      USERS_TABLE_NAME,
      lowerCaseAddress,
      "", // Remove Live ID
      "", // Remove STREAMING_PLAYBACK_URL
      docClient
    );
    if (user.liveId) {
      await deleteFileFromS3(
        {
          bucketName: BUCKET_NAME,
          key: `uploads/${lowerCaseAddress}/${user.liveId}`,
        },
        s3
      );
    }
  }
  // if (user) {
  return createApiGatewayResponse(200, JSON.stringify({ data }));
  // }
  return createApiGatewayResponse(
    404,
    JSON.stringify({ message: "Not Found" })
  );
};
