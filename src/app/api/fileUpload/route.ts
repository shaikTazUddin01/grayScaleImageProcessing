import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToCloudinary } from "@/config/cloudinary.config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("imageFile") as File;

    // If no file is selected
    if (!imageFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the original image
    const originalUpload: any = await uploadToCloudinary(
      buffer,
      "original_images"
    );

    // Convert the image to grayscale
    const grayscaleBuffer = await sharp(buffer).grayscale().toBuffer();

    // Upload processed image
    const grayscaleUpload: any = await uploadToCloudinary(
      grayscaleBuffer,
      "grayscale_images"
    );

    // simulate 10 minute delay
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // return response
    return NextResponse.json({
      success: true,
      originalFile: originalUpload.secure_url,
      grayscaleFile: grayscaleUpload.secure_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
