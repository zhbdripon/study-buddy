import { OpenAIEmbeddings } from "@langchain/openai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

function urlToQualifiedId(url: string) {
  try {
    const parsed = new URL(url);

    // Combine hostname and path
    const host = parsed.hostname.replace(/\./g, "_");
    const path = parsed.pathname.replace(/[^a-zA-Z0-9]/g, "_");

    // Remove leading/trailing underscores, collapse multiple underscores
    const qualifiedId = `${host}${path}`
      .replace(/_+/g, "_") // Collapse multiple underscores
      .replace(/^_+|_+$/g, "") // Trim leading/trailing underscores
      .toLowerCase();

    return qualifiedId;
  } catch (e) {
    console.error("Invalid URL:", url, e);
    throw new Error(`Invalid URL: ${url}`);
  }
}

export async function indexWebResource(url: string) {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    dimensions: 1536,
  });

  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const namespace = urlToQualifiedId(url);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX!),
    namespace,
  });

  try {
    const pTagSelector = "article, main, .content, #main, #post";
    const cheerioLoader = new CheerioWebBaseLoader(url, {
      selector: pTagSelector,
    });

    const docs = await cheerioLoader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(allSplits);

    return { namespace };
  } catch (e) {
    console.log(e);
  }
}
