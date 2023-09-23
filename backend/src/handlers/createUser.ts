import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { User, authUserToken, createApiGatewayResponse, getItem, putItem } from "./utils";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME as string;

export const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ logger: console }));

export const createUser: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);

  const lowerCaseAddress = await authUserToken(event.headers["Authorization"]);
  if (!lowerCaseAddress) {
    return createApiGatewayResponse(403, JSON.stringify({ message: "Invalid Token" }));
  }
  const newUser: User = {
    address: lowerCaseAddress,
    // name: event.body.name,
    // metafuseProjectId: event.body.metafuseProjectId,
    // mintSiteAddress: event.body.mintSiteAddress,
    // holders: 0,
  };
  const _user = await getItem<User>(USERS_TABLE_NAME, { address: lowerCaseAddress }, docClient);

  if (!_user) {
    await putItem<User>(USERS_TABLE_NAME, newUser, docClient);
  }

  return createApiGatewayResponse(201, JSON.stringify({ user: newUser, message: "User Created" }));
};
