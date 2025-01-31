import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToCloudinary } from "@/config/cloudinary.config";

// A simple in-memory job tracking system
const jobs: { [key: string]: { status: string; originalUrl?: string; grayscaleUrl?: string } } = {};

export const config = {
  api: {
    bodyParser: true,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("imageFile") as File;

    // If no file is selected
    if (!imageFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Generate a jobId to track processing
    const jobId = Math.random().toString(36).substring(7);
    jobs[jobId] = { status: "processing" };

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the original image
    const originalUpload: any = await uploadToCloudinary(buffer, "original_images");
    jobs[jobId].originalUrl = originalUpload.secure_url;

   
    setTimeout(async () => {
     
      const grayscaleBuffer = await sharp(buffer).grayscale().toBuffer();

      // Upload the processed image
      const grayscaleUpload: any = await uploadToCloudinary(grayscaleBuffer, "grayscale_images");
      jobs[jobId].grayscaleUrl = grayscaleUpload.secure_url;
      jobs[jobId].status = "completed";
    }, 120000); 

    // Return jobId to the client
    return NextResponse.json({ jobId });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  // Check if jobId is provided and job exists
  if (!jobId || !jobs[jobId]) {
    return NextResponse.json({ error: "Invalid or expired job ID" }, { status: 400 });
  }

  // Return job status and URLs if completed
  return NextResponse.json(jobs[jobId]);
}
