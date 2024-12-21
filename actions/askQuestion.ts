"use server";

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

const PRO_LIMMITE = 20;
const FREE_LIMITE = 2;

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

      //Check membership limits for message documents 
      const userRef = await adminDb.collection("users").doc(userId!).get();

      // PRO/Free tier

      //Check if user is on free tier and has asked more than FREE questions
      if(!userRef.data()?.hasActiveMembership){
        if(userMessages.length >= FREE_LIMITE){
          return {
            success : false,
            message : `You have reached the limit of 5 questions on the free tier. Please upgrade to ask more than ${FREE_LIMITE} questions`,
          };
        }
      }

      // Check if user is on PRO tier and has asked more than 100 questions
      if(userRef.data()?.hasActiveMembership){
        if(userMessages.length >= PRO_LIMMITE){
          return {
            success : false,
            message : `You have reached the limit of 100 questions on the PRO tier. Please upgrade to ask more than ${PRO_LIMMITE} questions`,
          };
        }
      }

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