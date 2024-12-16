import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

async function ChatToFilePage({ params }: { params: { id: string } }) {
  const { id } = params; // On récupère id après résolution de params

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
      </div>

      {/* Left */}
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        {/*PDFView*/}
        <PdfView url={url} />
      </div>
    </div>
  );
}

export default ChatToFilePage;
