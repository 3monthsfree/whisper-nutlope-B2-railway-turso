// Script to get CORS rules from Backblaze B2 bucket
import { S3Client, GetBucketCorsCommand } from "@aws-sdk/client-s3";
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

async function getCorsRules() {
  try {
    const command = new GetBucketCorsCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET!,
    });

    const response = await s3Client.send(command);
    console.log("Current CORS rules:");
    console.log(JSON.stringify(response.CORSRules, null, 2));
  } catch (error: any) {
    if (error.name === "NoSuchCORSConfiguration") {
      console.log("No CORS rules configured");
    } else {
      console.error("Failed to get CORS rules:", error);
    }
  }
}

getCorsRules();
