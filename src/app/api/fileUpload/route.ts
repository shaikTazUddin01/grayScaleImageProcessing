import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("imageFile") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, "_") 
      .replace(/\s+/g, "_")  
      .replace(/:/g, "_");

    const originalFileName = `${timestamp}_${sanitizedFileName}`;

    // Convert file to a Buffer
    const fileData = Buffer.from(await file.arrayBuffer());
  


    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save original file
    const originalFilePath = path.join(uploadsDir, originalFileName);
    await fs.writeFile(originalFilePath, fileData);

    // simulate 10 minute delay
    await new Promise((resolve) => setTimeout(resolve, 60000));
    
    // save grayscale file
    const grayscaleFilePath = path.join(
      uploadsDir,
      `grayscale-${originalFileName}`
    );
    await sharp(fileData).grayscale().toFile(grayscaleFilePath);

    return NextResponse.json({
        message: "File uploaded and processed successfully",
        originalFile: `/uploads/${originalFileName}`,
        grayscaleFile: `/uploads/grayscale-${originalFileName}`,
    });
  } catch (error) {
    console.error("Error uploading or processing file:", error);
    return NextResponse.json(
      { error: "Failed to upload or process file" },
      { status: 500 }
    );
  }
}
