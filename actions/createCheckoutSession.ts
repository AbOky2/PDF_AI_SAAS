"use server";

import { UserDetails } from "@/app/dashboard/upgrade/page";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

export async function createCheckoutSession(userDetails:UserDetails) {
    
    const {userId} = await auth();

    if(!userId){
        throw new Error("User not found");
    }

    let stripeCustomerId;

    const user = await adminDb.collection("users").doc(userId).get();
    stripeCustomerId = user.data?.stripeCustomerId;

    if(!stripeCustomerId){
        //Create new Stripe customer
    }
}