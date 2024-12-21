"use client";

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {useDocument, useCollection} from "react-firebase-hooks/firestore"

const PRO_LIMMITE = 20;
const FREE_LIMITE = 2;
function useSubscription(){
    const [hasActiveMembership, setHasActiveMembership] = useState(null);
    const [isOverFileLimite, setIsOverFileLimite] = useState(false);


    const {user} = useUser();

    //Listen to the user document  
    const [snapshot, loading, error] = useDocument(
        user && doc(db, 'users', user.id),
        {
            snapshotListenOptions : {includeMetadataChanges : true}
        }
    );

    //Listen to the user files collections 
    const [fileSnapshot, filesLoading] = useCollection(
        user && collection(db, 'users', user?.id, 'files')
    );

    useEffect(() => {
        if(!snapshot)return;

        const data = snapshot.data();

        if(!data) return;

        setHasActiveMembership(data.hasActiveMembership);

    }, [snapshot]);

    useEffect(()=>{

        if(!fileSnapshot || hasActiveMembership===null) return;

        const files = fileSnapshot.docs;

        const usersLimit = hasActiveMembership ? PRO_LIMMITE : FREE_LIMITE;

        console.log(
            "Checking if user is over limit",
            files.length,
            usersLimit,
        );

        setIsOverFileLimite(files.length >= usersLimit);

    }, [fileSnapshot, hasActiveMembership, PRO_LIMMITE, FREE_LIMITE])
    return {
        hasActiveMembership, loading, error, isOverFileLimite, filesLoading
    }
};

export default useSubscription;