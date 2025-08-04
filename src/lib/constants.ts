export const documentType = {
  webUrl: "webUrl",
  pdf: "pdf",
  docx: "docx",
  text: "text",
} as const;

export type DocumentType = (typeof documentType)[keyof typeof documentType];
