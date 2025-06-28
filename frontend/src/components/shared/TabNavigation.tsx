import React from "react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  tabs: {
    id: string;
    label: string;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0",
              activeTab === tab.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
