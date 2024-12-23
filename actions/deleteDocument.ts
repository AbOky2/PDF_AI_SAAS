"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import pineconeClient from "@/lib/pinecone";
import { indexName } from "@/lib/langchain";
import { adminDb, adminStorage } from "@/firebaseAdmin";

export async function deleteDocument(docId: string) { 
    auth.protect();
    const { userId } = await auth();

    //Delete the document from Firestore
    await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(docId) 
    .delete();

    //Delete the document from Firebase Storage
    await adminStorage
    .bucket(process.env.FIREBASE_STORAGE_BUCKET)
    .file(`users/${userId}/files/${docId}`)
    .delete();

    //Delete all embeddings associated with the document
    const index = await pineconeClient.index(indexName);
    await index.namespace(docId).deleteAll();

    //Revalidate the dashboard page to ensure the document is removed
    revalidatePath("/dashboard");

}


