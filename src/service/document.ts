import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { z } from "zod";

import { urlToQualifiedId } from "@/lib/utils";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { DocumentLoader } from "./documentLoader";

export async function indexWebResource(url: string) {
  const docService = new DocumentService(DocumentLoader.fromUrl(url));
  const namespace = urlToQualifiedId(url);
  await docService.indexDocuments(namespace);

  return { namespace };
}

export async function indexYoutubeResource(url: string) {
  const docService = new DocumentService(
    DocumentLoader.fromYoutubeTranscript(url),
  );
  const namespace = urlToQualifiedId(url);
  await docService.indexDocuments(namespace);

  return { namespace };
}

export async function generateURLSummary(url: string) {
  const docService = new DocumentService(DocumentLoader.fromUrl(url));
  return await docService.generateSummary();
}

export async function generateYoutubeSummary(youtubeUrl: string) {
  const docService = new DocumentService(
    DocumentLoader.fromYoutubeTranscript(youtubeUrl),
  );
  return await docService.generateSummary();
}

class DocumentService {
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;

  constructor(private loader: BaseDocumentLoader) {
    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      dimensions: 1536,
    });
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });
  }

  async indexDocuments(namespace: string) {
    const docs = await this.loader.load();

    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX!),
      namespace,
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(allSplits);
  }

  async generateSummary() {
    const docs = await this.loader.load();
    const summarySchema = z.object({
      summary: z
        .string()
        .describe(
          "comprehensive summarization in markdown with large headers and spaces",
        ),
      title: z
        .string()
        .describe("title of the document preferably within 5 words"),
    });

    // Define prompt
    const prompt = PromptTemplate.fromTemplate(
      "Summarize the main themes which should be comprehensive and informative in these retrieved docs with a suitable title: {context}. \n{format_instructions}.",
    );

    const outputParser = StructuredOutputParser.fromZodSchema(summarySchema);
    // Instantiate
    const chain = await createStuffDocumentsChain({
      llm: this.llm,
      outputParser,
      prompt,
    });

    // Invoke
    return await chain.invoke({
      context: docs,
      format_instructions: outputParser.getFormatInstructions(),
    });
  }
}
