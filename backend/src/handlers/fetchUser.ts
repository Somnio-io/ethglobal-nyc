import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { User, authUserToken, createApiGatewayResponse, getItem, queryItems } from "./utils";

const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME as string;

export const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ logger: console }));

export const fetchUser: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);
  const lowerCaseAddress = await authUserToken(event.headers["Authorization"]);
  if (!lowerCaseAddress) {
    return createApiGatewayResponse(403, JSON.stringify({ message: "Invalid Token" }));
  }
  let user: User | undefined | null;
  if (event.queryStringParameters?.lookupConnectedContract) {
    user = await getItem<User>(USERS_TABLE_NAME, { address: event.queryStringParameters?.lookupConnectedContract }, docClient);
    return createApiGatewayResponse(200, JSON.stringify({ message: "OK", user }));
  }
  if (event.queryStringParameters?.connectedContract) {
    const keyConditionExpression = "connectedContract = :c";
    const expressionAttributeValues = {
      ":c": event.queryStringParameters?.connectedContract,
    };
    const _user = await queryItems<User>(USERS_TABLE_NAME, keyConditionExpression, expressionAttributeValues, docClient, "byConnectedContract");
    user = _user?.find((user) => user);
  } else {
    user = await getItem<User>(USERS_TABLE_NAME, { address: lowerCaseAddress }, docClient);
  }

  if (user) {
    return createApiGatewayResponse(200, JSON.stringify({ message: "OK", user }));
  }
  return createApiGatewayResponse(404, JSON.stringify({ user: null, message: "Not Found" }));
};
