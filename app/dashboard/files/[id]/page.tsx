/* eslint-disable @typescript-eslint/ban-ts-comment */
import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ChatToFilePage(props: any) {
  const { id } = props.params; // On récupère id après résolution de params

  // Protéger l'accès
  auth.protect();

  const { userId } = await auth();

  // Charger les données depuis Firestore
  const ref = await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .get();

  const url = ref.data()?.downloadUrl;

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/*Right*/}
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        {/* Chat */}
        <Chat id = {id}/> 
      </div>

      {/* Left */}
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-green-600 lg:-order-1 overflow-auto">
        {/*PDFView*/}
        <PdfView url={url} />
      </div>
    </div>
  );
}

export default ChatToFilePage;
