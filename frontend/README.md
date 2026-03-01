# Investor Vault Frontend

A React-based frontend for the Secure Investor Vault built with AWS CDK, Lambda, RDS, and React.

## ✨ Features

- Query the secure Postgres database via Lambda API
- Modern, responsive UI built with React
- Displays real-time database information
- Error handling and loading states

## 📋 Prerequisites

- Node.js 16+ and npm
- AWS CLI configured with appropriate credentials
- Deployed AWS infrastructure (from the parent CDK project)

## 🚀 Local Development

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env.local` file with your API Gateway endpoint:

```
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📦 Deploy to AWS

### Upload to S3 and CloudFront

After building, you can deploy the frontend to your AWS S3 bucket:

```bash
# Build the app
npm run build

# Sync to S3 bucket (replace BUCKET_NAME with your actual bucket)
aws s3 sync build/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache (replace DISTRIBUTION_ID)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

The S3 bucket name and CloudFront distribution ID are outputs from the CDK deployment.

## 🔧 Architecture Integration

The frontend:

1. **Calls API Gateway** for database queries
2. **Invokes Lambda functions** that run in the VPC
3. **Accesses secure credentials** from Secrets Manager
4. **Queries the RDS Postgres database** for real-time data
5. **Served via CloudFront** with global caching

## 🛡️ Security Notes

- All API calls go through API Gateway with CORS configured
- Lambda functions authenticate with Secrets Manager
- Database connections are encrypted and isolated in a private VPC subnet
- CloudFront provides DDoS protection and caching optimization

## 📚 Available Routes

- `/` - Main dashboard
- `/query` - Database query endpoint (handled by the backend API)

## 🧪 Testing

```bash
npm test
```

## 📄 Environment Variables

- `REACT_APP_API_URL` - API Gateway endpoint URL (required for production)

## 🐛 Troubleshooting

- **API calls failing**: Check that API Gateway URL is correct and CORS is enabled
- **Lambda timeout**: Verify RDS security groups allow Lambda traffic on port 5432
- **Page not loading**: Ensure index.html is set as default root object in CloudFront

## 📞 Support

Refer to the parent AWS CDK project README for infrastructure documentation.
