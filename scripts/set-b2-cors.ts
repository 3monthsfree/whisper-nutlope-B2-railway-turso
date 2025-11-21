// Script to set CORS rules on Backblaze B2 bucket using S3-Compatible API
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const s3Client = new S3Client({
  endpoint: `https://s3.${process.env.S3_UPLOAD_REGION}.backblazeb2.com`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY!,
    secretAccessKey: process.env.S3_UPLOAD_SECRET!,
  },
  forcePathStyle: true,
});

async function setCorsRules() {
  try {
    // Get production URL from environment variable
    const productionUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!productionUrl) {
      console.warn("⚠ NEXT_PUBLIC_APP_URL not set. CORS will only allow localhost origins.");
    }

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    // Add production URL if it exists
    if (productionUrl) {
      allowedOrigins.unshift(productionUrl);
    }

    const command = new PutBucketCorsCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: allowedOrigins,
            ExposeHeaders: ["ETag", "x-amz-request-id"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await s3Client.send(command);
    console.log("✓ CORS rules successfully applied to bucket:", process.env.S3_UPLOAD_BUCKET);
    console.log("✓ Allowed origins:", allowedOrigins.join(", "));
  } catch (error) {
    console.error("✗ Failed to set CORS rules:", error);
    process.exit(1);
  }
}

setCorsRules();
