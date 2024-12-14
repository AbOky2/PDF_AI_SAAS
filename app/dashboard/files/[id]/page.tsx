import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
function ChatToFilePage({
    params : {id},
}: {
    params : {id : string; }
})

{
    auth.protect();
    const {userId} = await auth();

    const ref = await adminDb
     .collection("users")
     .doc(userId!)
     .collection("files")
     .doc(id)
     .get();

  return (
    <div>
      Chat to file page {id}
    </div>
  )
}

export default ChatToFilePage
