import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Channel } from "@aws-cdk/aws-ivs-alpha";
import path from "path";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

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
    // Used mainly for confirmaations that a contract has content on the platform during the user signup phase.
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

    const handleCreateUserFunction = new NodejsFunction(this, `handleCreateUserFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/createUser.ts"),
      handler: "createUser",
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
    userTable.grantReadWriteData(handleCreateUserFunction);

    const handleUpdateUserFunction = new NodejsFunction(this, `handleUpdateUserFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/updateUser.ts"),
      handler: "updateUser",
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
    userTable.grantReadWriteData(handleUpdateUserFunction);

    const usersResource = api.root.addResource("user");
    const liveResource = api.root.addResource("live");
    const uploadResource = api.root.addResource("upload");
    const contentResource = api.root.addResource("assets");
    const likeResource = api.root.addResource("likes");

    const bucket = new Bucket(this, "UploadBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST, HttpMethods.HEAD],
          allowedOrigins: ["*"], // Probably change this later to use the vercel url
          allowedHeaders: ["*"],
        },
      ],
    });

    const handleGetContentFunction = new NodejsFunction(this, `handleGetContentFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/getPresignUrls.ts"),
      handler: "getPresignUrls",
      memorySize: 512,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        USERS_TABLE_NAME: userTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(15),
      bundling: {
        target: "es2020",
      },
    });
    userTable.grantReadData(handleGetContentFunction);
    bucket.grantRead(handleGetContentFunction);

    const handleUploadFunction = new NodejsFunction(this, `handleUploadFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/createUploadPresign.ts"),
      handler: "createUploadPresign",
      memorySize: 512,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        USERS_TABLE_NAME: userTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(15),
      bundling: {
        target: "es2020",
      },
    });
    userTable.grantReadData(handleUploadFunction);
    bucket.grantReadWrite(handleUploadFunction);

    // The Stream itself
    const channel = new Channel(this, "LinktMainChannel");
    const streamingKey = channel.addStreamKey("linkt");

    // Handle live streaming
    const handleGoLive = new NodejsFunction(this, `handleGoLiveFunction`, {
      entry: path.resolve(__dirname, "../src/handlers/handleGoLive.ts"),
      handler: "handleGoLive",
      memorySize: 512,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        USERS_TABLE_NAME: userTable.tableName,
        CHANNEL_ARN: channel.channelArn,
        STREAMING_KEY: streamingKey.streamKeyValue,
        STREAMING_PLAYBACK_URL: channel.channelPlaybackUrl,
        STREAMING_INGEST_URL: channel.channelIngestEndpoint,
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(60),
      bundling: {
        target: "es2020",
      },
    });

    const ivsPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["ivs:BatchGetStream", "ivs:StopStream"],
      resources: [channel.channelArn], // If we have more channels we remove this
    });

    handleGoLive.addToRolePolicy(ivsPolicy);
    userTable.grantReadWriteData(handleGoLive);
    bucket.grantReadWrite(handleGoLive);

    // Create Live Stream
    liveResource.addMethod("POST", new apigw.LambdaIntegration(handleGoLive), {
      requestParameters: {
        "method.request.header.Authorization": true,
      },
    });

    // Get Live Stream Data
    liveResource.addMethod("GET", new apigw.LambdaIntegration(handleGoLive), {
      requestParameters: {
        "method.request.header.Cache-Control": true,
        "method.request.header.Authorization": true,
      },
    });

    // Get content (return presign urls)
    contentResource.addMethod("GET", new apigw.LambdaIntegration(handleGetContentFunction), {
      requestParameters: {
        "method.request.header.Authorization": true,
        "method.request.header.Content-Type": true,
        "method.request.header.Cache-Control": true,
        // A user could request data from a contract address
        "method.request.querystring.requestedContract": true,
        // A user could request a single videoId (also pass the publisher)
        "method.request.querystring.videoId": true,
        // If the publisher is currently live
        "method.request.querystring.live": true,
        "method.request.querystring.publisher": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Cache-Control": true,
          },
        },
      ],
    });

    // Fetch upload (presign generation url)
    uploadResource.addMethod("GET", new apigw.LambdaIntegration(handleUploadFunction), {
      requestParameters: {
        "method.request.header.Authorization": true,
        "method.request.header.Content-Type": true,
        "method.request.header.x-amz-meta-md5": true,
        "method.request.header.x-amz-meta-audience": true,
        "method.request.header.x-amz-meta-name": true,
        "method.request.header.x-amz-meta-description": true,
        "method.request.header.Cache-Control": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Cache-Control": true,
          },
        },
      ],
    });

    // Fetch user route
    usersResource.addMethod("GET", new apigw.LambdaIntegration(handleFetchUserFunction), {
      requestParameters: {
        "method.request.header.Authorization": true,
      },
    });

    // Create user route
    usersResource.addMethod("POST", new apigw.LambdaIntegration(handleCreateUserFunction), {
      requestParameters: {
        "method.request.header.Authorization": true,
      },
    });

    // Update user route
    usersResource.addMethod("PUT", new apigw.LambdaIntegration(handleUpdateUserFunction), {
      requestParameters: {
        "method.request.header.Authorization": true,
      },
    });

    // Get Like Counter
    likeResource.addMethod("GET", new apigw.LambdaIntegration(handleLikeFunction), {
      requestParameters: {
        "method.request.header.Authorization": true,
        "method.request.header.Content-Type": true,
        "method.request.header.Cache-Control": true,
        "method.request.querystring.videoId": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Cache-Control": true,
          },
        },
      ],
    });

    const likeModel = new apigw.Model(this, "LikeModel", {
      restApi: api,
      contentType: "application/json",
      modelName: "LikeModel",
      schema: {
        schema: apigw.JsonSchemaVersion.DRAFT4,
        title: "likeModel",
        type: apigw.JsonSchemaType.OBJECT,
        properties: {
          videoId: { type: apigw.JsonSchemaType.STRING },
        },
        required: ["videoId"],
      },
    });

    // Create a Request Validator
    const requestValidator = new apigw.RequestValidator(this, "RequestValidator", {
      restApi: api,
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // Update Like Counter
    likeResource.addMethod("PUT", new apigw.LambdaIntegration(handleLikeFunction), {
      requestValidator: requestValidator,
      requestModels: {
        "application/json": likeModel,
      },
      requestParameters: {
        "method.request.header.Authorization": true,
        "method.request.header.Content-Type": true,
        "method.request.header.Cache-Control": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Cache-Control": true,
          },
        },
      ],
    });

    // Create video? Not sure we need this
    likeResource.addMethod("POST", new apigw.LambdaIntegration(handleLikeFunction), {
      requestValidator: requestValidator,
      requestModels: {
        "application/json": likeModel,
      },
      requestParameters: {
        "method.request.header.Authorization": true,
        "method.request.header.Content-Type": true,
        "method.request.header.Cache-Control": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Cache-Control": true,
          },
        },
      ],
    });
  }
}
