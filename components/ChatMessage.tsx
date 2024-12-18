"use client"
import { useUser } from '@clerk/nextjs';
import React from 'react'
import { Message } from './Chat';
import Markdown from "react-ma rkdown";
import { BotIcon, Loader2Icon } from 'lucide-react';

function ChatMessage({message}: {message : Message}) {

    const isHuman = message.role ==="human";
    const {user} = useUser(); 
  return (
    <div>
      
    </div>
  )
}

export default ChatMessage
