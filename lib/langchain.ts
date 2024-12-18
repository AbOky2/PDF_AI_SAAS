import {ChatOpenAI} from "@langchain/openai";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import {createStuffDocumentsChain, CreateStuffDocumentsChain} from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {createRetrievalChain} from "langchain/chains/retrieval";
import {createHistoryAwareRetriever} from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConfigurationError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
const model = new ChatOpenAI({
    apiKey : process.env.OPENAI_API_KEY,
    modelName : 'gpt-4o'
});

export const indexName = "papafam";

async function fetchMessagesFromDB(docId:string) {
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not found ");
    }
    console.log("--- Fetching Chat history from firestore db ... ---");
    const chats = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .collection("chat")
        .orderBy("createAt", "desc")
        .get();

    const chatHistory  = chats.docs.map((doc) =>
        doc.data().role==="human"
            ? new HumanMessage(doc.data().message)
            : new AIMessage(doc.data().message)
    );

    console.log(`--- fetched last ${chatHistory.length} messages successfuly ---`);

    console.log(chatHistory.map((msg) => msg.content.toString()));

    return chatHistory;
    
}

export async function generateDocs(docId:string) {
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not found ");
    }
    console.log("--- Fetching the download URL from firebase ... ---");
    const firebaseRef = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .get();

    const downloadUrl = firebaseRef.data()?.downloadUrl;
    if(!downloadUrl){
        throw Error("Download Url not found ");
    }

    console.log(`--- DownloadUrl fetched successfully: ${downloadUrl} ... ---`);
    //fecth the PDF from the specified URL
    const response = await fetch(downloadUrl);

    //load the PDF into PDFdocument object
    const data = await response.blob();

    //load the pdf from the specific path 
    console.log("--- Loading document ... ---");
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    //Split the documents into smaller part for easier process 
    console.log("--- Splitting the document into smaller parts ... ---");
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`--- Split into ${splitDocs.length} parts ---`);

    return splitDocs;
}

export async function namespaceExists(index:Index<RecordMetadata>, namespace : string) {
    if(namespace ==null) throw new Error("No namespace value provided");
    const {namespaces} = await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId:string) {
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not found");
    }
    let pineconeVectorStore;

    //Generate Embedding
    console.log("---Generating embeddings for the split documents...----");
    const embeddings = new OpenAIEmbeddings();

    const index = await pineconeClient.index(indexName);
    const nameSpaceAlreadyExists = await namespaceExists(index, docId);

    if(nameSpaceAlreadyExists){
        console.log(`--- Namespace ${docId} already exists, reusing existing embeddings ... ---`);
   

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex : index,
        namespace : docId,
    });
    return pineconeVectorStore; 
    }
    else{
        //if namespace doesn't exits, download the PDF from firestore via the stored download URL & generate the
        //embeddings and store them in the Pinecone vector store

        const splitDocs = await generateDocs(docId);
        console.log(`--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store... ---`);

        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs, 
            embeddings,
            {
                pineconeIndex : index,
                namespace : docId,
            }
        );
        return pineconeVectorStore;
    }
}

//Implementation de la methode generateLangchainCompletion

const generateLangchainCompletion = async(docId : string, question : string) => {
    let pineconeVectorStore;
    pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

    if(!pineconeVectorStore) {
        throw new Error("Pinecone Vector is not found");
    }

    //on crée un retriever pour chercher dans le vector store
    console.log("------ Creating retrevier... ------");
    const retriever = pineconeVectorStore.asRetriever(); 

    //Fetch de l'historique du chat 
    const chatHistory = await fetchMessagesFromDB(docId);

    //On definie une prompt template 

    console.log("-----Defining a prompt template...---");
    const historyAwarePrompt  =ChatPromptTemplate.fromMessages([
        ...chatHistory,
        ["user", "{input}"],
        ["user",
         "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
        ]
    ]);

    console.log("------ Creating a history-aware retriever chain -----");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm : model,
        retriever,
        rephrasePrompt : historyAwarePrompt,
    });

    //Definir un prompt template pour repondre aux questions basées sur le context retriever 
    console.log("------ Defining a prompt template for answering questions... -----");
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's questions based on below context :\n\n{context}",
        ],
        ...chatHistory, // Insere the actual history here 
        ["user", "{input}"],
    ]);

    //Create a chain to combines the retrieved documents into a coherent response
    console.log("------ Defining a prompt template for answering questions... -----");
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm : model,
        prompt : historyAwareRetrievalPrompt,
    });


    //Create the main retrieval chain that combines the history-aware retriever and document combining chain
    console.log("------ Creating the main retrieval chain... -----");
    const conversationalRetrievalChain = await createRetrievalChain({
        retriever : historyAwareRetrieverChain,
        combineDocsChain : historyAwareCombineDocsChain,
    });

    console.log("------Running the chain with a sample conversation... -----");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history : chatHistory,
        input : question,
    });

    // Print the result to the console
    console.log(reply.answer);
    return reply.answer;
};

//Export the model and the run function
export {model, generateLangchainCompletion};