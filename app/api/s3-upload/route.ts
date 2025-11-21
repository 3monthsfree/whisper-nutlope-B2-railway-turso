// app/api/s3-upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

// Create S3 client with Backblaze B2 configuration
// Explicitly disable checksum calculation that B2 doesn't support
const s3Client = new S3Client({
  endpoint: `https://s3.${process.env.S3_UPLOAD_REGION}.backblazeb2.com`,
  region: "us-east-1", // Dummy region, endpoint overrides
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY!,
    secretAccessKey: process.env.S3_UPLOAD_SECRET!,
  },
  forcePathStyle: true,
  // Disable request checksums completely for B2 compatibility
  requestChecksumCalculation: "WHEN_REQUIRED" as any,
});

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    // Generate unique key
    const key = `${Date.now()}-${fileName}`;

    // Create presigned URL for upload without checksums
    const command = new PutObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    const fileUrl = `https://s3.${process.env.S3_UPLOAD_REGION}.backblazeb2.com/${process.env.S3_UPLOAD_BUCKET}/${key}`;

    return NextResponse.json({ uploadUrl, key, url: fileUrl });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
