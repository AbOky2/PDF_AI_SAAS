"use client"
import React from 'react'
import { Button } from './ui/button'
import { Frown, FrownIcon, PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSubscription from '@/hooks/useSubscription'

function PlaceholderDocument() {
    const {isOverFileLimite} = useSubscription();
    const router = useRouter();
    const handleClick = () =>{
      if(isOverFileLimite){
        router.push("/dashboard/upgrade");
      }
      else{
        router.push("/dashboard/upload");
      }
    }
  return (
    <Button 
    onClick={handleClick}
    className='flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400'>
        
        {isOverFileLimite ? (<FrownIcon className='w-16 h-16 '/>)
        :(<PlusCircleIcon className='h-16 w-16'/>)
        }
        <p>{isOverFileLimite?"Upgrade to add more documents : " : "Add a document"}</p>
    </Button>
  )
}

export default PlaceholderDocument
