"use client"
import { useRouter } from 'next/navigation'
import React from 'react'
import byteSize from "byte-size";
import useSubscription from '@/hooks/useSubscription';
import { CloudIcon, Download, DownloadCloud, Trash2Icon } from 'lucide-react';
import { useTransition } from 'react';
import { Button } from './ui/button';
import { deleteDocument } from '@/actions/deleteDocument';
function Document({
    id,
    name,
    size,
    downloadUrl
} : {
    id : string,
    name : string,
    size : number,
    downloadUrl  :string,
}) {

    const router = useRouter();
    const [isDeleting, startTransition] = useTransition();
    const {hasActiveMembership} = useSubscription();
  return (
    <div className='flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between transition-all p-4 transform hover:scale-105
    hover:bg-green-600 hover:text-white cursor-pointer group'>
      
      <div className='flex-1' 
      onClick={() =>{
        router.push(`/dashboard/files/${id}`);
      }}
      >
        <p className='font-semibold line-clamp-2'>
            {name}
        </p>
        <p className='text-sm text-gray-500 group-hover:text-green-100'>
            {byteSize(size).value} KB
        </p>
      </div>
      {/* Actions */}

      <div className='flex justify-end space-x-2'>

        <Button
        variant="outline"
        disabled={isDeleting || !hasActiveMembership}
        onClick={() =>{
            const prompt = window.confirm('Are you sure you want to delete this document?');
            if(prompt){                    
                //delete document
                startTransition(async() =>{
                    await deleteDocument(id);
                });
            }
        }}
        >
            <Trash2Icon className='h-6 w-6 text-red-500'/>
            {!hasActiveMembership && (
                <span className='text-red-500 ml-2'>PRO Feature</span>
                )}

        </Button>

            <Button asChild variant="outline">
                <a href={downloadUrl} download>
                    <DownloadCloud className='h-6 w-6 text-green-600'/>
                </a>
            </Button>
      </div>
    </div>
  )
}

export default Document
