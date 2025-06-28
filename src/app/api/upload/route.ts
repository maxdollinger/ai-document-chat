import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.values();

    let totalSize = 0;
    let fileCount = 0;

    console.log("--- File Upload Log ---");
    for (const file of files) {
      if (file instanceof File) {
        console.log(`Received file: ${file.name}, size: ${file.size} bytes`);
        totalSize += file.size;
        fileCount++;
      }
    }
    console.log("-----------------------");

    if (fileCount === 0) {
      return NextResponse.json(
        { message: "No files were uploaded." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `${fileCount} file(s) with a total of ${totalSize} bytes uploaded successfully.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "File upload failed." },
      { status: 500 }
    );
  }
} 