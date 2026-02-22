import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
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
  }
}
