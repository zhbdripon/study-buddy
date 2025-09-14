"use client";
import { useParams, useRouter } from "next/navigation";

import { TabsTrigger } from "@/components/ui/tabs";

const TabButton = ({ value, label }: { value: string; label: string }) => {
  const router = useRouter();
  const params = useParams();

  const handleTabChange = () => {
    router.push(`/study-sessions/${params.id}?tab=${value}`);
  };
  return (
    <TabsTrigger
      value={value}
      onClick={handleTabChange}
      className="cursor-pointer"
    >
      {label}
    </TabsTrigger>
  );
};

export default TabButton;
