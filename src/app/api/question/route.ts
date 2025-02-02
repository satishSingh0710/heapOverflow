import { questionCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { storage } from "@/models/server/config";
import { questionAttachmentBucket } from "@/models/name";

export async function POST(request: NextRequest) {
  try {
    const { authorId } = await request.json();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tags = formData.get("tags") as string;

    if (!file || !title || !content || !tags) {
      return NextResponse.json(
        { success: false, error: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const imageUpload = await storage.createFile(
      questionAttachmentBucket,
      ID.unique(),
      file
    );

    if (!imageUpload) {
      return NextResponse.json(
        { success: false, error: "Error uploading image" },
        { status: 500 }
      );
    }

    const dataUpload = await databases.createDocument(
      db,
      questionCollection,
      ID.unique(),
      {
        title,
        content,
        tags: tags.split(","),
        authorId,
      }
    );

    if(!dataUpload) {
      return NextResponse.json(
        { success: false, error: "Error uploading data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: dataUpload, status: 201 });
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred in creation of answer";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Error response
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
