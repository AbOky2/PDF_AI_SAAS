'use client'
import React from 'react'
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import {Document, Page, pdfjs} from "react-pdf"
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

// We need to configure CORS
//gsutil cors set cors.json gs://<app-name>.appspot.com
//gsutil cors set cors.json gs://chat-with-pdf-1a9f5.appspot.com
//go here >>> https://console.cloud.google.com/
//create new file in editor calls cor.json
//run >>> // gsutil cors set cors.json gs://chat-with-pdf-1a9f5.appspot.com
//https://firebase.google.com/docs/storage/web/download-files#cors_configuration

pdfjs.GlobalWorkerOptions.workerSrc = ​​`//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({url} : {url : string}) {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [file, setFile] = useState<Blob|null>(null);
    const [rotation, setRotation] = useState<number>();
    const [scale, setScale] = useState<number>(1);

    useEffect(() => {
        const fetchFile = async  () => {
            const response = await fetch(url);
            const file = await response.blob();

            setFile(file);
        };
        fetchFile();
    }, [url]);

    const onDocumentLoadSuccess = ({numPages} : {numPages : number}) : void =>{
            setNumPages(numPages); 
    }

  return (
    <div>
        <Document>
            <Page/>
        </Document>
    </div>
  )
}

export default PdfView
 