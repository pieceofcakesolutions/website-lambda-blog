import * as aws from '@pulumi/aws';
import { Bucket } from '@pulumi/aws/s3';
import * as pulumi from '@pulumi/pulumi';
import * as helpers from './helpers';


const stackConfig = new pulumi.Config("cake-aws-lambda-blog");

// targetDomain is the domain/host to serve content at.
const targetDomain = stackConfig.require("targetDomain");

// A DynamoDB table with a single primary key
const blogTable = new aws.dynamodb.Table("blog-db-table", {
  attributes: [
    { name: "Id", type: "S" },
  ],
  hashKey: "Id",
  readCapacity: 1,
  writeCapacity: 1,
});



// Read the config of whether to provision fixed concurrency for Lambda
const config = new pulumi.Config();
const bucketName = targetDomain;
const lambdaBucket = new aws.s3.Bucket("lambdaBucket",
  {
    bucket: bucketName,
    acl: "aws-exec-read",
    forceDestroy: true,
  }
);

// Give our Lambda access to the Dynamo DB table, CloudWatch Logs and Metrics.
const role = new aws.iam.Role("fn-blog-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});


const policy = new aws.iam.RolePolicy("fn-blog-policy", {
  role,
  policy: pulumi.output({
    Version: "2012-10-17",
    Statement: [{
      Action: ["dynamodb:UpdateItem", "dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DescribeTable", "dynamodb:Scan"],
      Resource: blogTable.arn,
      Effect: "Allow",
    }, {
      Action: ["logs:*", "cloudwatch:*"],
      Resource: "*",
      Effect: "Allow",
    }],
  }),
});
//    "cake-lambda-blog::cake_lambda_blog.Functions::GetBlogsAsync"
// Create a Lambda function, using code from the `./app` folder.

[
  'cake-lambda-blog::cake_lambda_blog.Functions::GetBlogsAsync',
  'cake-lambda-blog::cake_lambda_blog.Functions::GetBlogAsync',
  'cake-lambda-blog::cake_lambda_blog.Functions::AddBlogAsync',
  'cake-lambda-blog::cake_lambda_blog.Functions::DeleteBlogAsync',
].forEach((fn,index) => {

  const lambda = new aws.lambda.Function(`fn-blog-${index}`, {
    memorySize: 256,
    runtime: aws.lambda.Runtime.DotnetCore3d1,
    code: "../src/cake-lambda-blog/bin/Release/netcoreapp3.1/cake-lambda-blog.zip",
    handler: fn,
    name: `cake-blog-${fn.split("::").reverse()[0]}`,
    timeout: 15,
    role: role.arn,
    environment: {
      variables: {
        "BLOG_TABLE": blogTable.name,
      },
    },
  }, { dependsOn: [policy] });

  ///////////////////
  // APIGateway RestAPI
  ///////////////////

  // Create the API Gateway Rest API, using a swagger spec.
  const restApi = new aws.apigateway.RestApi(`fn-blog-api-${index}`, {
    body: lambda.arn.apply(lambdaArn => helpers.swaggerSpec(lambdaArn)),
  });

  // Create a deployment of the Rest API.
  const deployment = new aws.apigateway.Deployment(`fn-blog-api-deployment-${index}`, {
    restApi: restApi,
    // Note: Set to empty to avoid creating an implicit stage, we'll create it explicitly below instead.
    stageName: "",
  });

  // Create a stage, which is an addressable instance of the Rest API. Set it to point at the latest deployment.
  const stage = new aws.apigateway.Stage(`fn-blog-api-stage-${index}`, {
    restApi: restApi,
    deployment: deployment,
    stageName: pulumi.getStack(),
  });

  // Give permissions from API Gateway to invoke the Lambda
  const invokePermission = new aws.lambda.Permission(`fn-blog-api-lambda-permission-${index}`, {
    action: "lambda:invokeFunction",
    function: lambda,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${deployment.executionArn}*/*`,
  });
});
