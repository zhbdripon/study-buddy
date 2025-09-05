"use client";
import { useRouter, useParams } from "next/navigation";

import { TabsTrigger } from "@/components/ui/tabs";
import React from "react";

const TabButton = ({ value, label }: { value: string; label: string }) => {
  const router = useRouter();
  const params = useParams();

  const handleTabChange = () => {
    router.push(`/study-sessions/${params.id}?tab=${value}`);
  };
  return (
    <TabsTrigger value={value} onClick={handleTabChange}>
      {label}
    </TabsTrigger>
  );
};

export default TabButton;
