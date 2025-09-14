"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StudySession } from "@/drizzle/types";
import { getFormattedDateAndTime } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { deleteStudySession } from "./[id]/action";

export const SessionCard = ({ session }: { session: StudySession }) => {
  const router = useRouter();
  return (
    <Card
      key={session.id}
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => router.push(`/study-sessions/${session.id}?tab=summary`)}
    >
      <CardHeader className="flex justify-between">
        <label className="text-ellipsis">{session.name}</label>
        <SessionActionMenu session={session} onSessionDelete={() => {}} />
      </CardHeader>
      <CardFooter>
        <blockquote className="mt-6 border-l-2 pl-6 italic text-xs text-muted-foreground">
          {"created at:" + getFormattedDateAndTime(new Date(session.createdAt))}
        </blockquote>
      </CardFooter>
    </Card>
  );
};

const SessionActionMenu = ({
  session,
  onSessionDelete,
}: {
  session: StudySession;
  onSessionDelete: (session: StudySession) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical
          className="p-2 size-8 text-muted-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteStudySession(session.id)
                .then((res) => {
                  if (res.success) {
                    toast.success("Study session deleted successfully");
                    onSessionDelete(session);
                  } else {
                    toast.error("Failed to delete the study session");
                  }
                })
                .catch((error) => {
                  console.error("Error deleting study session:", error);
                  toast.error("Failed to delete the study session");
                });
            }}
          >
            Delete
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
