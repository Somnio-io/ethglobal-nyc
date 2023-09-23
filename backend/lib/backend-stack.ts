import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Channel } from "@aws-cdk/aws-ivs-alpha";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

import path from "path";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, `ApiGateway`, {
      restApiName: `core-api`,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Cache-Control",
          "x-Amz-Meta-MD5",
          "max-age",
          "s-maxage",
          "x-Amz-Meta-Name",
          "x-Amz-Meta-Audience",
          "x-Amz-Meta-Description",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: ["GET", "PUT", "POST", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"], // TODO update to suit vercel
      },
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.ERROR,
      },
      cloudWatchRole: true,
    });

    const userTable = new Table(this, "UserTable", {
      partitionKey: { name: "address", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    userTable.addGlobalSecondaryIndex({
      indexName: "byConnectedContract",
      partitionKey: { name: "connectedContract", type: AttributeType.STRING },
    });
    userTable.addGlobalSecondaryIndex({
      indexName: "byLiveId",
      partitionKey: { name: "liveId", type: AttributeType.STRING },
    });

    const likesTable = new Table(this, "LikesTable", {
      partitionKey: { name: "videoId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const handleLikeFunction = new NodejsFunction(this, `handleLikeFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/handleLike.ts"),
      handler: "handleLike",
      memorySize: 512,
      environment: {
        LIKES_TABLE_NAME: likesTable.tableName,
        USERS_TABLE_NAME: userTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(6),
      bundling: {
        target: "es2020",
      },
    });
    likesTable.grantReadWriteData(handleLikeFunction);
    userTable.grantReadData(handleLikeFunction);

    const handleFetchUserFunction = new NodejsFunction(this, `handleFetchUserFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/fetchUser.ts"),
      handler: "fetchUser",
      memorySize: 512,
      environment: {
        USERS_TABLE_NAME: userTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(15),
      bundling: {
        target: "es2020",
      },
    });
    userTable.grantReadData(handleFetchUserFunction);
  }
}
