"use client";
import React from 'react'
import {useDropzone} from 'react-dropzone'
import { CircleArrowDown, RocketIcon, } from 'lucide-react';
function FileUploader() {
    // const onDrop = useCallback((acceptedFiles : File[]) => {
    //     // Do something with the files
    //   }, []);
      const {getRootProps, getInputProps, isDragActive, isFocused} = useDropzone({})
    
  return (
    <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
        <div {...getRootProps()}
        className={`p-10 border-indigo-600 text-indigo-600 border-2 border-dashed mt-10 w-[90%] rounded-lg h-96 flex
            items-center justify-center ${isFocused || isDragActive ?"bg-indigo-300" : "bg-indigo-100"}`}
        >
        <input {...getInputProps()} />
        <div className='flex flex-col justify-center items-center'>
             {
            isDragActive ?(
                <>
                <RocketIcon className='h-20 w-20 animate-ping'/>
                <p>Drop the files here ...</p>
                </>
            ) :(
                <>
                <CircleArrowDown className='h-20 w-20 animate-bounce'/>
                <p>Drag and drop some files here, or click to select files</p>
                </>
            )
        }
        </div>
       
        </div>
    </div>
  )
}

export default FileUploader
