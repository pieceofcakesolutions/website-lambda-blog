import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

// Create the Swagger spec for a proxy which forwards all HTTP requests through to the Lambda function.
export function swaggerSpec(lambdaArn: string): string {
    const swaggerSpec = {
        swagger: "2.0",
        info: { title: "api", version: "1.0" },
        paths: {
            "/{proxy+}": swaggerRouteHandler(lambdaArn),
        },
    };
    return JSON.stringify(swaggerSpec);
  }
  
  // Create a single Swagger spec route handler for a Lambda function.
export function swaggerRouteHandler(lambdaArn: string) {
    const region = aws.config.requireRegion();
    return {
        "x-amazon-apigateway-any-method": {
            "x-amazon-apigateway-integration": {
                uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
                passthroughBehavior: "when_no_match",
                httpMethod: "POST",
                type: "aws_proxy",
            },
        },
    };
  }