"use client";
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link';
import { Loader2Icon, StarIcon } from 'lucide-react';
import { createStripePortal } from '@/actions/createStripePortal';
import { useTransition } from 'react';
import useSubscription from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';
function UpgradeButton() {
    const {hasActiveMembership, loading} = useSubscription();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAccount = () =>{
        startTransition(async() =>{
            const stripePortalUrl = await createStripePortal();

            router.push(stripePortalUrl);
        });
    };

    if(!hasActiveMembership && !loading)
        return(
            <Button asChild variant="default" className='bg-green-600'>
                <Link href='/dashboard/upgrade'>
                        <StarIcon className='ml-3 fill-green-600 text-white'/>
                        Upgrade
                </Link>
            </Button>);
        
    
    if(loading)
        return(
            <Button variant="default" className='bg-green-600'>
                <Loader2Icon className='animate-spin'/>
                Loading
            </Button>);
        
    
  return (
    <Button
    onClick={handleAccount}
    disabled={isPending}
    variant="default"
    className='bg-green-600 border-green-600'
    >
        {isPending ? (
            <Loader2Icon className='animate-spin'/>
        ) : (
            <p>
                <span className='font-extrabold'>PRO</span>
                Account
            </p>
        )}

    </Button>
  )
}

export default UpgradeButton
