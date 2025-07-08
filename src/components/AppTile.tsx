import { BookOpenText } from "lucide-react";
import Link from "next/link";

const AppTile = () => {
  return (
    <Link href="/" className="flex items-center gap-2 font-medium">
      <div className="bg-neutral-900 text-neutral-50 flex size-6 items-center justify-center rounded-md dark:bg-neutral-50 dark:text-neutral-900">
        <BookOpenText className="size-4" />
      </div>
      Study Buddy
    </Link>
  );
};

export default AppTile;
