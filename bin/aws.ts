#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AwsStack } from "../lib/aws-stack";

const app = new cdk.App();

new AwsStack(app, "AwsStack", {
  env: {
    account: "365172055476",
    region: "us-east-1",
  },
});
