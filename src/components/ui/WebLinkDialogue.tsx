"use client";
import { useState } from "react";
import { z } from "zod";

import { addURL } from "@/app/(study-session-app)/study-sessions/action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./button";
import { Input } from "./input";

const urlSchema = z.string().url();

const WebLinkDialogue = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  async function handleWebUrlResource(url: string): Promise<void> {
    toast("Analyzing your document, please wait...", {
      duration: 5000,
      description:
        "This may take a few minutes depending on the document size.",
    });
    addURL(url)
      .then((studySessionId: number) => {
        if (studySessionId == null) {
          throw new Error("Something went wrong");
        }
        toast.success("Document summarized successfully!");
        router.push(`/study-sessions/${studySessionId}?tab=summary`);
      })
      .catch((err) => {
        toast.error(err.message);
        // toast.error("Failed to analyzing the document. Please try again.");
      })
      .finally(() => {
        setShowModal(false);
        setUrl("");
        setError(null);
      });
  }

  const handleAdd = () => {
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      setError("Please enter a valid URL.");
      return;
    }
    handleWebUrlResource(url);
    setUrl("");
    setError(null);
    setShowModal(false);
  };

  return (
    <Dialog open={showModal}>
      <DialogTriggerButton
        type="button"
        className="mx-2 px-3"
        onClick={() => setShowModal(true)}
      >
        Web Link
      </DialogTriggerButton>
      <DialogContent onClose={() => setShowModal(false)}>
        <DialogHeader>
          <DialogTitle>Enter Web Link</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          <Input
            type="url"
            placeholder="Enter public url containing your study material"
            value={url}
            onChange={handleInputChange}
            aria-invalid={!!error}
          />
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
        <Button onClick={handleAdd} disabled={!url}>
          Add
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WebLinkDialogue;
