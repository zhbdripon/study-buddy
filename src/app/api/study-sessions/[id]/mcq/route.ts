import { db } from "@/drizzle/index";
import { documentSummary, studySession, document } from "@/drizzle";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { MCQGenerator } from "@/service/mcqGenerator";
import { documentType } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const resolvedParams = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 401 });
  }

  const id = Number(resolvedParams.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const query = await db
      .select({
        id: document.id,
        summary: documentSummary.summary,
        documentMeta: document.meta,
      })
      .from(studySession)
      .innerJoin(document, eq(studySession.id, document.sessionId))
      .innerJoin(documentSummary, eq(documentSummary.documentId, document.id))
      .execute();

    const documentData = query[0];
    const summary = documentData?.summary;
    const documentMeta = documentData?.documentMeta as {
      type: string;
      url: string;
    };

    if (documentData && summary && documentMeta.type === documentType.webUrl) {
      const mcqGen = new MCQGenerator(summary, documentMeta.url);
      await mcqGen.initialize();
      const mcq = await mcqGen.generateMcq(10);

      return NextResponse.json(mcq);
    }
    throw Error("Couldn't generate MCQ");
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to generate MCQ" },
      { status: 500 },
    );
  }
}
