"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class AwsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // ============================================
        // PHASE 0: Create IAM User (CLI-only developer)
        // ============================================
        const devUser = new iam.User(this, "InvestorVaultDevUser", {
            userName: "investor-vault-dev",
        });
        // Attach Administrator policy for learning (⚠️ reduce in production)
        devUser.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"));
        // Create access key for CLI authentication
        const accessKey = new iam.AccessKey(this, "DevUserAccessKey", {
            user: devUser,
        });
        // Output the credentials (store these securely!)
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
            description: "AWS Secret Access Key - Save this safely! (Only shown once)",
        });
        // ============================================
        // PHASE 1: Create the Network (VPC)
        // ============================================
        const vpc = new ec2.Vpc(this, "InvestorVpc", {
            maxAzs: 2, // High availability across 2 data centers
            natGateways: 0, // CRITICAL: Set to 0 to stay within Free Tier/Credits
            subnetConfiguration: [
                {
                    name: "Public",
                    subnetType: ec2.SubnetType.PUBLIC, // For Load Balancers/Gateways
                    cidrMask: 24,
                },
                {
                    name: "Private",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // For our Postgres DB
                    cidrMask: 24,
                },
            ],
        });
        // Output the VPC ID so we can see it in the console
        new cdk.CfnOutput(this, "VpcId", {
            value: vpc.vpcId,
            description: "VPC ID for Investor Vault",
        });
    }
}
exports.AwsStack = AwsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXdzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx5REFBMkM7QUFDM0MseURBQTJDO0FBRzNDLE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsK0NBQStDO1FBQy9DLGdEQUFnRDtRQUNoRCwrQ0FBK0M7UUFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUN6RCxRQUFRLEVBQUUsb0JBQW9CO1NBQy9CLENBQUMsQ0FBQztRQUVILHFFQUFxRTtRQUNyRSxPQUFPLENBQUMsZ0JBQWdCLENBQ3RCLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMscUJBQXFCLENBQUMsQ0FDbEUsQ0FBQztRQUVGLDJDQUEyQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzVELElBQUksRUFBRSxPQUFPO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3JDLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUTtZQUN2QixXQUFXLEVBQUUseUJBQXlCO1NBQ3ZDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3JDLEtBQUssRUFBRSxTQUFTLENBQUMsV0FBVztZQUM1QixXQUFXLEVBQUUsdUNBQXVDO1NBQ3JELENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDekMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFO1lBQy9DLFdBQVcsRUFDVCw2REFBNkQ7U0FDaEUsQ0FBQyxDQUFDO1FBRUgsK0NBQStDO1FBQy9DLG9DQUFvQztRQUNwQywrQ0FBK0M7UUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDM0MsTUFBTSxFQUFFLENBQUMsRUFBRSwwQ0FBMEM7WUFDckQsV0FBVyxFQUFFLENBQUMsRUFBRSxzREFBc0Q7WUFDdEUsbUJBQW1CLEVBQUU7Z0JBQ25CO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSw4QkFBOEI7b0JBQ2pFLFFBQVEsRUFBRSxFQUFFO2lCQUNiO2dCQUNEO29CQUNFLElBQUksRUFBRSxTQUFTO29CQUNmLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLHNCQUFzQjtvQkFDbkUsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILG9EQUFvRDtRQUNwRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMvQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7WUFDaEIsV0FBVyxFQUFFLDJCQUEyQjtTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoRUQsNEJBZ0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5cbmV4cG9ydCBjbGFzcyBBd3NTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUEhBU0UgMDogQ3JlYXRlIElBTSBVc2VyIChDTEktb25seSBkZXZlbG9wZXIpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBjb25zdCBkZXZVc2VyID0gbmV3IGlhbS5Vc2VyKHRoaXMsIFwiSW52ZXN0b3JWYXVsdERldlVzZXJcIiwge1xuICAgICAgdXNlck5hbWU6IFwiaW52ZXN0b3ItdmF1bHQtZGV2XCIsXG4gICAgfSk7XG5cbiAgICAvLyBBdHRhY2ggQWRtaW5pc3RyYXRvciBwb2xpY3kgZm9yIGxlYXJuaW5nICjimqDvuI8gcmVkdWNlIGluIHByb2R1Y3Rpb24pXG4gICAgZGV2VXNlci5hZGRNYW5hZ2VkUG9saWN5KFxuICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQWRtaW5pc3RyYXRvckFjY2Vzc1wiKSxcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGFjY2VzcyBrZXkgZm9yIENMSSBhdXRoZW50aWNhdGlvblxuICAgIGNvbnN0IGFjY2Vzc0tleSA9IG5ldyBpYW0uQWNjZXNzS2V5KHRoaXMsIFwiRGV2VXNlckFjY2Vzc0tleVwiLCB7XG4gICAgICB1c2VyOiBkZXZVc2VyLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBjcmVkZW50aWFscyAoc3RvcmUgdGhlc2Ugc2VjdXJlbHkhKVxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiSUFNVXNlck5hbWVcIiwge1xuICAgICAgdmFsdWU6IGRldlVzZXIudXNlck5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJQU0gVXNlciBmb3IgQ0xJIGFjY2Vzc1wiLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJBY2Nlc3NLZXlJZFwiLCB7XG4gICAgICB2YWx1ZTogYWNjZXNzS2V5LmFjY2Vzc0tleUlkLFxuICAgICAgZGVzY3JpcHRpb246IFwiQVdTIEFjY2VzcyBLZXkgSUQgLSBTYXZlIHRoaXMgc2FmZWx5IVwiLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJTZWNyZXRBY2Nlc3NLZXlcIiwge1xuICAgICAgdmFsdWU6IGFjY2Vzc0tleS5zZWNyZXRBY2Nlc3NLZXkudW5zYWZlVW53cmFwKCksXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJBV1MgU2VjcmV0IEFjY2VzcyBLZXkgLSBTYXZlIHRoaXMgc2FmZWx5ISAoT25seSBzaG93biBvbmNlKVwiLFxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBQSEFTRSAxOiBDcmVhdGUgdGhlIE5ldHdvcmsgKFZQQylcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsIFwiSW52ZXN0b3JWcGNcIiwge1xuICAgICAgbWF4QXpzOiAyLCAvLyBIaWdoIGF2YWlsYWJpbGl0eSBhY3Jvc3MgMiBkYXRhIGNlbnRlcnNcbiAgICAgIG5hdEdhdGV3YXlzOiAwLCAvLyBDUklUSUNBTDogU2V0IHRvIDAgdG8gc3RheSB3aXRoaW4gRnJlZSBUaWVyL0NyZWRpdHNcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwiUHVibGljXCIsXG4gICAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDLCAvLyBGb3IgTG9hZCBCYWxhbmNlcnMvR2F0ZXdheXNcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIlByaXZhdGVcIixcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX0lTT0xBVEVELCAvLyBGb3Igb3VyIFBvc3RncmVzIERCXG4gICAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dCB0aGUgVlBDIElEIHNvIHdlIGNhbiBzZWUgaXQgaW4gdGhlIGNvbnNvbGVcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIlZwY0lkXCIsIHtcbiAgICAgIHZhbHVlOiB2cGMudnBjSWQsXG4gICAgICBkZXNjcmlwdGlvbjogXCJWUEMgSUQgZm9yIEludmVzdG9yIFZhdWx0XCIsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==