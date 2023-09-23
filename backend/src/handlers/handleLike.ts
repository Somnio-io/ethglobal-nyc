import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  authUserToken,
  createApiGatewayResponse,
  getItem,
  putItem,
  updateLikes,
} from "./utils";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME as string;
const LIKES_TABLE_NAME = process.env.LIKES_TABLE_NAME as string;

interface Video {
  id: string;
  likes: number;
  publisher: string;
  createdAtDate: string;
  lastLikedField: string | null;
}

export const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ logger: console })
);

export const handleLike: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);
  const lowerCaseAddress = await authUserToken(event.headers["Authorization"]);
  if (!lowerCaseAddress) {
    return createApiGatewayResponse(
      403,
      JSON.stringify({ message: "Invalid Token" })
    );
  }

  const user = await getItem<Video>(
    USERS_TABLE_NAME,
    { address: lowerCaseAddress },
    docClient
  );

  let videoId: string | undefined;
  let likes: Partial<Video | null> | undefined;

  if (event.httpMethod === "GET") {
    videoId = event.queryStringParameters?.videoId;
    likes = await getItem<Video>(LIKES_TABLE_NAME, { id: videoId }, docClient);
  }

  if (event.body) {
    const body = JSON.parse(event.body);
    videoId = body.videoId;
  }

  if (event.httpMethod === "PUT" && videoId) {
    likes = await updateLikes<Video>(LIKES_TABLE_NAME, videoId, docClient);
  }
  if (event.httpMethod === "POST" && videoId) {
    likes = await putItem<Video>(
      LIKES_TABLE_NAME,
      {
        id: videoId,
        likes: 0,
        createdAtDate: new Date().toISOString(),
        publisher: user?.id,
        lastLikedField: null,
      },
      docClient
    );
  }

  if (user && likes) {
    return createApiGatewayResponse(200, JSON.stringify({ likes }));
  }
  return createApiGatewayResponse(
    404,
    JSON.stringify({ message: "Not Found" })
  );
};
