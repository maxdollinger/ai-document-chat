"use server";

export async function uploadFiles(formData: FormData): Promise<{ message: string }> {
  try {
    const files = formData.values();
    let totalSize = 0;
    let fileCount = 0;

    console.log("--- File Upload Log (Server Action) ---");
    for (const file of files) {
      if (file instanceof File) {
        // In a real application, you would process the file here (e.g., save to a blob store).
        // For this example, we're just logging the details.
        console.log(`Received file: ${file.name}, size: ${file.size} bytes`);
        totalSize += file.size;
        fileCount++;
      }
    }
    console.log("---------------------------------------");

    if (fileCount === 0) {
      return { message: "No files were uploaded." };
    }

    return {
      message: `${fileCount} file(s) with a total of ${totalSize} bytes uploaded successfully.`,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { message: "File upload failed." };
  }
} 