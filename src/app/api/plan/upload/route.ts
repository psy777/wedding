import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
import { getDb } from "@/db";
import { budgetAttachments } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const budgetItemId = formData.get("budgetItemId") as string | null;

    if (!file || !budgetItemId) {
      return NextResponse.json(
        { error: "Missing file or budget item ID" },
        { status: 400 }
      );
    }

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    const db = getDb();
    const [attachment] = await db
      .insert(budgetAttachments)
      .values({
        budgetItemId: parseInt(budgetItemId),
        fileName: file.name,
        fileUrl: response.data.ufsUrl,
        fileSize: file.size,
        contentType: file.type,
      })
      .returning();

    revalidatePath("/plan/budget");

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Ensure UPLOADTHING_TOKEN is set." },
      { status: 500 }
    );
  }
}
