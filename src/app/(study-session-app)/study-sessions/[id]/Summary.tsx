import { DocSummary } from "@/drizzle/types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { summaries: DocSummary[] };

const Summary = ({ summaries }: Props) => {
  return (
    <>
      {summaries.map((data) => (
        <div key={data.id} className="prose dark:prose-invert lg:prose-md">
          <Markdown remarkPlugins={[remarkGfm]}>{data.summary}</Markdown>
        </div>
      ))}
    </>
  );
};

export default Summary;
