"use client";
import { useEffect, useRef, useState } from "react";

import { addDocument } from "@/app/(study-session-app)/study-sessions/action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { DualRangeSlider } from "./ui/dual-range-slider";
import { Input } from "./ui/input";

const MAX_PDF_PAGE_TO_INDEX = 15;

let pdfjsLib;

async function getPageCount(file) {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const pdfData = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;

  return pdf.numPages;
}

const DocumentUploadDialog = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [pageRange, setPageRange] = useState<{ start: number; end: number }>({
    start: 1,
    end: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpToPage, setJumpToPage] = useState("");
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetStates = () => {
    setFiles(null);
    setTotalPages(0);
    setCurrentPage(0);
    setPageRange({ start: 1, end: 1 });
    setShowRangeSelector(false);
    setCurrentPdf(null);
    setError(null);
    fileInputRef.current = null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length < 1) {
      resetStates();
      return;
    }

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const invalidFiles = Array.from(selectedFiles).filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      setError("Only PDF, TXT, DOC, and DOCX files are allowed.");
      setFiles(null);
      return;
    }

    setFiles(selectedFiles);
    setError(null);

    const file = selectedFiles[0];
    if (file.type === "application/pdf") {
      const pageCount = await getPageCount(file);
      setTotalPages(pageCount);
      setCurrentPage(1);
      setPageRange({
        start: 1,
        end: Math.min(pageCount, MAX_PDF_PAGE_TO_INDEX),
      });
      setShowRangeSelector(pageCount > MAX_PDF_PAGE_TO_INDEX);

      // Create URL for PDF preview
      const pdfUrl = URL.createObjectURL(file);
      setCurrentPdf(pdfUrl);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup PDF URL when component unmounts
      if (currentPdf) {
        URL.revokeObjectURL(currentPdf);
      }
    };
  }, [currentPdf]);

  async function handleDocumentUpload(files: FileList): Promise<void> {
    toast("Analyzing your documents, please wait...", {
      duration: 5000,
      description:
        "This may take a few minutes depending on the document size.",
    });

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("file", file);
      });

      // Add page range information if it's a PDF
      if (files[0].type === "application/pdf") {
        formData.append("startPage", JSON.stringify(pageRange.start));
        formData.append("endPage", JSON.stringify(pageRange.end));
      }
      setShowModal(false);
      const studySessionId = await addDocument(formData);
      toast.success("Document summarized successfully!");
      router.push(`/study-sessions/${studySessionId}?tab=summary`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to analyze the documents. Please try again.");
    } finally {
      resetStates();
    }
  }

  const handleUpload = () => {
    if (!files || files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    handleDocumentUpload(files);
  };

  return (
    <Dialog open={showModal}>
      <DialogTriggerButton
        type="button"
        className="mx-2 px-3"
        onClick={() => setShowModal(true)}
      >
        Documents
      </DialogTriggerButton>
      <DialogContent
        onClose={() => {
          resetStates();
          setShowModal(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileChange}
            ref={fileInputRef}
            aria-invalid={!!error}
          />
          {!showRangeSelector && (
            <p className="text-sm text-gray-500">
              Supported formats: PDF, TXT, DOC, DOCX
            </p>
          )}

          {showRangeSelector && (
            <div className="grid grid-cols-2 gap-2">
              <p className="col-span-2 text-sm">
                Selected Range {pageRange.start} - {pageRange.end}
              </p>
              <DualRangeSlider
                className="col-span-2"
                value={[pageRange.start, pageRange.end]}
                onValueChange={(newVal) => {
                  const newStart = newVal[0];
                  const newEnd = newVal[1];

                  setPageRange((prev) => {
                    const oldStart = prev.start;

                    if (newEnd - newStart + 1 <= MAX_PDF_PAGE_TO_INDEX) {
                      return {
                        start: newStart,
                        end: newEnd,
                      };
                    } else {
                      if (oldStart !== newStart) {
                        return {
                          start: newStart,
                          end: Math.min(
                            newStart + MAX_PDF_PAGE_TO_INDEX - 1,
                            totalPages,
                          ),
                        };
                      } else {
                        return {
                          start: Math.max(
                            newEnd - MAX_PDF_PAGE_TO_INDEX + 1,
                            1,
                          ),
                          end: newEnd,
                        };
                      }
                    }
                  });
                }}
                min={1}
                max={totalPages}
                step={1}
              />
              <p className="col-span-2 text-sm text-gray-500">
                Total pages: {totalPages}. For better performance, consider
                selecting a range of {MAX_PDF_PAGE_TO_INDEX} pages or less.
              </p>
            </div>
          )}

          {currentPdf && (
            <div className="flex flex-col items-center justify-center">
              <iframe
                key={currentPage}
                src={`${currentPdf}#page=${currentPage}&toolbar=0`}
                className="w-full h-[400px]"
                title="PDF Preview"
                style={{
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              />
              <div className="flex items-center gap-4 mt-4">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2 ml-4">
                    <Input
                      type="number"
                      value={jumpToPage}
                      onChange={(e) => setJumpToPage(e.target.value)}
                      className="w-20"
                      min={1}
                      max={totalPages}
                      placeholder="Page #"
                    />
                    <Button
                      onClick={() => {
                        const page = parseInt(jumpToPage);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                          setJumpToPage("");
                        }
                      }}
                      disabled={
                        !jumpToPage ||
                        parseInt(jumpToPage) < 1 ||
                        parseInt(jumpToPage) > totalPages
                      }
                    >
                      Jump
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
        <Button onClick={handleUpload} disabled={!files || files.length === 0}>
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
