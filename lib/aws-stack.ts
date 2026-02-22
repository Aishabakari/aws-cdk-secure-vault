import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // PHASE 0: Create IAM User

    const devUser = new iam.User(this, "InvestorVaultDevUser", {
      userName: "investor-vault-dev",
    });

    // Attach Administrator policy for learning
    devUser.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
    );

    // Create access key for CLI authentication
    const accessKey = new iam.AccessKey(this, "DevUserAccessKey", {
      user: devUser,
    });

    // Output the credentials
    new cdk.CfnOutput(this, "IAMUserName", {
      value: devUser.userName,
      description: "IAM User for CLI access",
    });

    new cdk.CfnOutput(this, "AccessKeyId", {
      value: accessKey.accessKeyId,
      description: "AWS Access Key ID - Save this safely!",
    });

    new cdk.CfnOutput(this, "SecretAccessKey", {
      value: accessKey.secretAccessKey.unsafeUnwrap(),
      description: "AWS Secret Access Key",
    });

    // PHASE 1: Create the Network (VPC)

    const vpc = new ec2.Vpc(this, "InvestorVpc", {
      maxAzs: 2, // High availability across 2 data centers
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC, // For Load Balancers/Gateways
          cidrMask: 24,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // For Postgres DB
          cidrMask: 24,
        },
      ],
    });

    // Output the VPC ID so we can see it in the console
    new cdk.CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      description: "VPC ID for Investor Vault",
    });

    // PHASE 2: Create Database & Secrets Manager
    const dbSecret = new secretsmanager.Secret(this, "InvestorDbSecret", {
      secretName: "InvestorDbCredentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "investor_admin" }),
        generateStringKey: "password",
        excludePunctuation: true,
        includeSpace: false,
      },
    });

    //Create Postges Database
    const dbInstance = new rds.DatabaseInstance(this, "InvestorPostgres", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      credentials: rds.Credentials.fromSecret(dbSecret),
      allocatedStorage: 20, //GB
      maxAllocatedStorage: 100,
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Output the database hostname
    new cdk.CfnOutput(this, "DatabaseHost", {
      value: dbInstance.dbInstanceEndpointAddress,
      description: "RDS Database Host",
    });

    // PHASE 3: Lambda Functions (API & Compute Layer)

    // 1. Create Lambda Execution Role with least-privilege permissions
    const lambdaExecutionRole = new iam.Role(
      this,
      "LambdaExecutionRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Lambda execution role for DB access",
      }
    );

    // Allow Lambda to write logs to CloudWatch
    lambdaExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );

    // Allow Lambda to read the DB secret from Secrets Manager
    dbSecret.grantRead(lambdaExecutionRole);

    // 2. Create Security Group for Lambda
    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      "LambdaSecurityGroup",
      {
        vpc,
        description: "Security group for Lambda functions",
        allowAllOutbound: true,
      }
    );

    // 3. Allow Lambda to connect to the database
    // Add inbound rule to RDS security group to accept traffic from Lambda
    dbInstance.connections.allowFrom(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow Lambda to query Postgres"
    );

    // 4. Create a basic Lambda function that queries the database
    const queryDbFunction = new lambda.Function(this, "QueryDbFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      role: lambdaExecutionRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DB_HOST: dbInstance.dbInstanceEndpointAddress,
        DB_PORT: "5432",
        DB_NAME: "postgres",
        SECRET_ARN: dbSecret.secretArn,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Output Lambda function ARN
    new cdk.CfnOutput(this, "QueryDbFunctionArn", {
      value: queryDbFunction.functionArn,
      description: "ARN of the Query DB Lambda function",
    });

    new cdk.CfnOutput(this, "QueryDbFunctionName", {
      value: queryDbFunction.functionName,
      description: "Name of the Query DB Lambda function",
    });
  }
}
