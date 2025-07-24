"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import WebLinkDialogue from "@/components/ui/WebLinkDialogue";
import { Upload } from "lucide-react";

import { toast } from "sonner";
import { addURL } from "./action";

const StudySessions = () => {
  async function handleWebUrlResource(url: string): Promise<void> {
    toast("Indexing your document, please wait...", {
      duration: 5000,
      description:
        "This may take a few minutes depending on the document size.",
    });
    await addURL(url)
      .then(() => {
        toast.success("Document indexed successfully!");
      })
      .catch((error) => {
        console.error("Error indexing document:", error);
        toast.error("Failed to index the document. Please try again.");
      });
  }

  return (
    <div className="p-6">
      <Card className="border-dashed border-4 p-8">
        <CardContent>
          <div className="flex flex-col justify-center items-center mb-4">
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-[var(--border)]">
              <Upload size={64} />
            </div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
              Upload Your Study Materials
            </h3>
            <p className="leading-7  text-[16px]">
              Add your Documents (PDF, TXT, DOC), Web link, Youtube or
              Handwriting
            </p>
          </div>
          <div className="flex justify-center">
            <WebLinkDialogue onURLAdd={handleWebUrlResource} />
            <Button className="mx-2">Youtube Link</Button>
            <Button className="mx-2">Documents</Button>
            <Button className="mx-2">Handwriting</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudySessions;
