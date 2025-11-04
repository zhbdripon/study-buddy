"use server";

import pdf from "pdf-parse";
import { isNumber } from "remeda";

let selectedText = "";

const getOptions = (startPage: number, endPage: number) => {
  return {
    pagerender: function (pageData) {
      const currentPage = pageData.pageIndex + 1; // 1-based index

      if (currentPage >= startPage && currentPage <= endPage) {
        // extract text of this page only
        return pageData.getTextContent().then((textContent) => {
          const pageText = textContent.items.map((item) => item.str).join(" ");
          selectedText += `\n\n--- Page ${currentPage} ---\n${pageText}`;
          return pageText;
        });
      }

      // skip pages outside range
      return "";
    },
  };
};

export async function extractPdfText(
  buffer,
  startPage: number | undefined = undefined,
  endPage: number | undefined = undefined,
) {
  // const buffer = fs.readFileSync("file.pdf");

  if (isNumber(startPage) && isNumber(endPage) && startPage <= endPage) {
    await pdf(buffer, getOptions(startPage, endPage));
    return selectedText;
  } else {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (err) {
      console.error("Error reading PDF:", err);
    }
  }
}
