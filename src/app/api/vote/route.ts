import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { votedBy, voteStatus, type, typeId } = await request.json();
    const response = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("votedBy", votedBy),
    ]);

    if (response.documents.length > 0) {
      await databases.deleteDocument(
        db,
        voteCollection,
        response.documents[0].$id
      );

      // decrease the reputation
      const QuestionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );
      const authorPrefs = await users.getPrefs<UserPrefs>(
        QuestionOrAnswer.authorId
      );
      await users.updatePrefs(QuestionOrAnswer.authorId, {
        reputation:
          response.documents[0].voteStatus === "upvoted"
            ? Number(authorPrefs.reputation) - 1
            : Number(authorPrefs.reputation) + 1,
      });
    }

    if (response.documents[0]?.voteStatus !== voteStatus) {
      const doc = await databases.createDocument(
        db,
        voteCollection,
        ID.unique(),
        {
          type,
          typeId,
          voteStatus,
          votedBy,
        }
      );

      // Increate/Decrease the reputation of the question/answer author accordingly
      const questionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      const authorPrefs = await users.getPrefs<UserPrefs>(
        questionOrAnswer.authorId
      );
      if (response.documents[0]) {
        await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
          reputation:
            // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
            response.documents[0].voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) - 1
              : Number(authorPrefs.reputation) + 1,
        });
      } else {
        await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
          reputation:
            // that means the new value is "downvoted" so we have to decrease the reputation
            voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) + 1
              : Number(authorPrefs.reputation) - 1,
        });
      }

      const [upvotes, downvotes] = await Promise.all([
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "upvoted"),
          Query.equal("votedBy", votedBy),
          Query.limit(1), 
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "downvoted"),
          Query.equal("votedBy", votedBy),
          Query.limit(1), // for optimization as we only need total
        ]),
      ]);

      return NextResponse.json(
        {
          data: { document: doc, voteResult: upvotes.total - downvotes.total },
          message: response.documents[0] ? "Vote Status Updated" : "Voted",
        },
        {
          status: 201,
        }
      );
    }

    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "upvoted"),
        Query.equal("votedBy", votedBy),
        Query.limit(1),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "downvoted"),
        Query.equal("votedBy", votedBy),
        Query.limit(1),
      ]),
    ]);

    const upvotesTotal = upvotes?.total ?? 0;
    const downvotesTotal = downvotes?.total ?? 0;

    return NextResponse.json(
      {
        data: {
          document: null,
          voteResult: upvotesTotal - downvotesTotal,
        },
        message: "Vote withdrawn successfully!",
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred in voting";

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
