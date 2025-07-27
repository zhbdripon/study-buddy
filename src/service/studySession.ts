import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import { urlToQualifiedId } from "@/lib/utils";

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
    const summary = await generateURLSummary(allSplits);

    return { namespace, summary };
  } catch (e) {
    console.log(e);
  }
}

async function generateURLSummary(docs: Document[]) {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  // Define prompt
  const prompt = PromptTemplate.fromTemplate(
    "Summarize the main themes in markdown in these retrieved docs: {context}",
  );

  // Instantiate
  const chain = await createStuffDocumentsChain({
    llm: llm,
    outputParser: new StringOutputParser(),
    prompt,
  });

  // Invoke
  return await chain.invoke({ context: docs });
}
