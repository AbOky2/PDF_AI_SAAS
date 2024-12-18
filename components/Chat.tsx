"use client";
import React, { useEffect,useState, FormEvent,useRef, useTransition } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import {useCollection} from "react-firebase-hooks/firestore";
import { useUser } from '@clerk/nextjs';
import {collection, orderBy, query} from "firebase/firestore";
import { db } from '@/firebase';
import { Loader2Icon } from 'lucide-react';
import { askQuestion } from '@/actions/askQuestion';

export type Message = {
    id?: string;
    role : "human" | "ai" | "placeholder";
    message : string;
    createAt : Date;
};

function Chat({id} : {id : string}) {
    const {user} = useUser();
    const [input, setInput] = useState("");
    const [messages, SetMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();
    const bottomOfChatRef = useRef<HTMLDivElement>(null);
    const [snapshot, loading, error] = useCollection(
        user && 
        query(
            collection(db, "users", user?.id, "files", id, "chat"),
            orderBy("createAt","asc")
        )
    );

    useEffect(() =>{

        bottomOfChatRef.current?.scrollIntoView({
            behavior : 'smooth',
        });
    }, [messages]);

    useEffect(() => {
        if(!snapshot)return;
        console.log("Updated snapshot ", snapshot.docs);

        //get second last message to check if the AI is thinking...
        const lastMessage = messages.pop();
        if(lastMessage?.role=== "ai" && lastMessage.message==="thinking ..." ){
            //return as this is a dummy placeholder message
            return ;
        }

        const newMessages = snapshot.docs.map(doc => {
            const {role, message, createAt} = doc.data();
            return {
                id : doc.id,
                role,
                message,
                createAt : createAt.toDate(),
            }; 

        })
        SetMessages(newMessages);

        //Ingnorer le warning pour eviter une boucle infinie ex en faisant [message, snapshot ]
    }, [snapshot])

    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();

        const q = input;
        setInput("");
        SetMessages((prev) => [
            ...prev,
            {
                role : "human",
                message : q,
                createAt : new Date(),
            },
            {
                role : "ai",
                message : "Thinking ...",
                createAt : new Date(),
            }
        ]);

        startTransition(async () => {
            const {success, message}  = await askQuestion(id, q);
            if(!success){
                //  

                SetMessages((prev) =>
                prev.slice(0, prev.length -1).concat([
                    {
                        role : "ai",
                        message : `Whoops ... ${message}`,
                        createAt : new Date(),
                    }
                ])
                )
            }
        })
    }
    
  return (
    <div className='flex flex-col h-full overflow-scroll'>
        {/*Chat contet*/}
      <div className='flex-1 w-full'>
        {/*Chat message*/}
        {loading?(
            <div className='flex items-center justify-center'>
                <Loader2Icon className='animate-spin h-20 w-20 mt-20 text-indigo-600'/>
            </div>
        ) : (
            <div>
                {messages.length === 0 && (
                    <ChatMessage 
                    key = {"placeholder"}
                    message ={{
                        role : "AI",
                        message : "Ask me anything about the document!",
                        createAt : new Date(),
                    }}/>
                )}
            {messages.map((message, index) => (
                <ChatMessage key={index} message = {message}/>
            ))}

            <div ref={bottomOfChatRef}/>

            </div>
            
        )}
        

      </div>
      <form className=' sticky flex bottom-0 space-x-2 p-5 bg-indigo-600/75' onSubmit={handleSubmit} action="">
        <Input
        placeholder='Ask a Question ...'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        />
        <Button
        disabled = {!input || isPending }
        type="submit"
         >
            {isPending?(
                <Loader2Icon className='animate-spin text-indigo-600'/>
            ) : 
            ("Ask")
        }

        </Button>

      </form>
    </div>
  )
}

export default Chat
