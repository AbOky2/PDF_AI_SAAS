"use server";

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

const FREE_LIMITE = 3;
const PRO_LIMMITE = 100;

export async function askQuestion(id: string, question : string) {
    auth.protect();
    const {userId} = await auth();

    const chatRef = adminDb
      .collection("users")
      .doc(userId!)
      .collection("files")
      .doc(id)
      .collection("chat");

      //check how many user messages are in the chat
      const ChatSnapshot = await chatRef.get();
      const userMessages = ChatSnapshot.docs.filter(
        (doc) => doc.data().role ==="human"
      );

      const userMessage : Message = {
        role : "human",
        message : question,
        createAt : new Date(),
      };

      await chatRef.add(userMessage); 

      //Generate AI response

      const reply = await generateLangchainCompletion(id, question);

      const aiMessage : Message ={
        role : "ai",
        message : reply,
        createAt : new Date(),
      }

      await chatRef.add(aiMessage);

      return {success : true, message : null};
}