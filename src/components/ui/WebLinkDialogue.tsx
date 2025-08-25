"use client";
import { useState } from "react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Input } from "./input";

interface Props {
  onURLAdd: (url: string) => void;
}

const urlSchema = z.string().url();

const WebLinkDialogue = ({ onURLAdd }: Props) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleAdd = () => {
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      setError("Please enter a valid URL.");
      return;
    }
    onURLAdd(url);
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
