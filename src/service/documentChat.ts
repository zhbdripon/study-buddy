import type { Document } from "@langchain/core/documents";
import "cheerio";

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { z } from "zod";

export class DocumentChat {
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;
  private graphWithMemory: any;
  private userId: string | undefined;

  constructor(
    private embeddingNameSpace: string,
    private summary?: string,
  ) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.2,
    });

    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      dimensions: 1536,
    });
  }

  async initializeChat(userId: string) {
    this.userId = userId;

    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX!),
      namespace: this.embeddingNameSpace,
    });

    const retrieveSchema = z.object({ query: z.string() });

    const retrieve = tool(
      async ({ query }: { query: string }): Promise<[string, Document[]]> => {
        const retrievedDocs: Document[] = await vectorStore.similaritySearch(
          query,
          3,
        );
        const serialized: string = retrievedDocs
          .map(
            (doc: Document) =>
              `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`,
          )
          .join("\n");
        return [serialized, retrievedDocs];
      },
      {
        name: "retrieve",
        description: "Retrieve information related to a query.",
        schema: retrieveSchema,
        responseFormat: "content_and_artifact",
      },
    );

    const summaryTool = tool(
      (): string => {
        return "Document summary: " + (this.summary ?? "No Summary Data");
      },
      {
        name: "summary",
        description:
          "summary of the document. Use to answer global questions about the document",
        responseFormat: "content",
        schema: z.object({}),
      },
    );

    const retrievalToolNode = new ToolNode([retrieve]);
    const summaryToolNode = new ToolNode([summaryTool]);

    const queryOrRespond = async (state: typeof MessagesAnnotation.State) => {
      const llmWithTools = this.llm.bindTools([retrieve, summaryTool]);

      const systemPrompt = new SystemMessage(
        "You can use tools to help answer the question. " +
          "Use 'retrieve' when the user asks about something in the document. " +
          "Use 'summary' when the question is about the overall document. " +
          "If neither applies, answer directly.",
      );

      const response = await llmWithTools.invoke([
        systemPrompt,
        ...state.messages,
      ]);
      // MessagesState appends messages to state instead of overwriting
      return { messages: [response] };
    };

    // Step 3: Generate a response using the retrieved content.
    const generate = async (state: typeof MessagesAnnotation.State) => {
      // Get generated ToolMessages
      const recentToolMessages: ToolMessage[] = [];
      for (let i = state["messages"].length - 1; i >= 0; i--) {
        const message = state["messages"][i];
        if (message instanceof ToolMessage) {
          recentToolMessages.push(message);
        } else {
          break;
        }
      }
      const toolMessages = recentToolMessages.reverse();

      // Format into prompt
      const docsContent = toolMessages.map((doc) => doc.content).join("\n");
      const systemMessageContent =
        "You are an assistant for question-answering tasks. " +
        "Use the following pieces of retrieved context to answer " +
        "the question. If you don't know the answer, say that you " +
        "don't know. Depending on the question the answer can be short or long but keep it not more than five sentences." +
        "\n\n" +
        `context: ${docsContent}`;

      const conversationMessages = state.messages.filter(
        (message: BaseMessage) =>
          message instanceof HumanMessage ||
          message instanceof SystemMessage ||
          (message instanceof AIMessage && message?.tool_calls?.length == 0),
      );
      const prompt = [
        new SystemMessage(systemMessageContent),
        ...conversationMessages,
      ];

      // Run
      const response = await this.llm.invoke(prompt);
      return { messages: [response] };
    };

    function toolsCondition(state) {
      const message = Array.isArray(state)
        ? state[state.length - 1]
        : state.messages[state.messages.length - 1];
      if ("tool_calls" in message && (message.tool_calls?.length ?? 0) > 0) {
        return message.tool_calls[0].name === "retrieve"
          ? "retrievalToolNode"
          : "summaryToolNode";
      } else {
        return END;
      }
    }

    const graphBuilder = new StateGraph(MessagesAnnotation)
      .addNode("queryOrRespond", queryOrRespond)
      .addNode("retrievalToolNode", retrievalToolNode)
      .addNode("summaryToolNode", summaryToolNode)
      .addNode("generate", generate)

      .addEdge("__start__", "queryOrRespond")
      .addConditionalEdges("queryOrRespond", toolsCondition, {
        __end__: "__end__",
        retrievalToolNode: "retrievalToolNode",
        summaryToolNode: "summaryToolNode",
      })
      .addEdge("summaryToolNode", "generate")
      .addEdge("retrievalToolNode", "generate")
      .addEdge("generate", "__end__");

    const checkPointer = PostgresSaver.fromConnString(
      process.env.DATABASE_URL!,
    );

    await checkPointer.setup();

    this.graphWithMemory = graphBuilder.compile({
      checkpointer: checkPointer as any,
    });
  }

  async sendMessage(threadId: string, message: string): Promise<BaseMessage[]> {
    const input = { messages: [new HumanMessage(message)] };
    const config = {
      configurable: { thread_id: threadId, user_id: this.userId! },
      streamMode: "values" as const,
    };

    const messages: BaseMessage[] = [];

    for await (const step of await this.graphWithMemory.stream(input, config)) {
      const lastMessage = step.messages[step.messages.length - 1];
      if (
        lastMessage instanceof HumanMessage ||
        lastMessage instanceof AIMessage
      ) {
        if (
          !messages.find((item) => item.id === lastMessage.id) &&
          lastMessage.content.length > 0
        ) {
          messages.push(lastMessage);
        }
      }
    }

    return messages;
  }
}
