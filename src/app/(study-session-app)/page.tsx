import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const HomePage = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <SidebarTrigger className="-ml-1" />
      content 1
    </div>
  );
};

export default HomePage;
