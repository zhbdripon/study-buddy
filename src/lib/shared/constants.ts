export const documentTypes = {
  webUrl: "webUrl",
  pdf: "pdf",
  docx: "docx",
  text: "text",
  youtube: "youtube",
} as const;

export type DocumentType = (typeof documentTypes)[keyof typeof documentTypes];
