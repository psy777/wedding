import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
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

    const blob = await put(
      `wedding-receipts/${budgetItemId}/${file.name}`,
      file,
      { access: "public" }
    );

    const db = getDb();
    const [attachment] = await db
      .insert(budgetAttachments)
      .values({
        budgetItemId: parseInt(budgetItemId),
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        contentType: file.type,
      })
      .returning();

    revalidatePath("/plan/budget");

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Ensure BLOB_READ_WRITE_TOKEN is set." },
      { status: 500 }
    );
  }
}
