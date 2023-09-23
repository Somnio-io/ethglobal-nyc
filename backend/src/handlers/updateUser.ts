import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  User,
  authUserToken,
  createApiGatewayResponse,
  updateUserConnectedContract,
} from "./utils";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME as string;

export const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ logger: console })
);

export const updateUser: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);
  const body = JSON.parse(event.body!);
  const { connectedContract } = body;
  const lowerCaseAddress = await authUserToken(event.headers["Authorization"]);
  if (!lowerCaseAddress) {
    return createApiGatewayResponse(
      403,
      JSON.stringify({ message: "Invalid Token" })
    );
  }

  const user = await updateUserConnectedContract<User>(
    USERS_TABLE_NAME,
    lowerCaseAddress,
    connectedContract,
    docClient
  );

  return createApiGatewayResponse(
    201,
    JSON.stringify({ user, message: "User Updated" })
  );
};
