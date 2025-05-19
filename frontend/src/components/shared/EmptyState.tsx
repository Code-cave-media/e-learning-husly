
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
}

const EmptyState = ({
  title,
  description,
  actionLabel,
  actionLink,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4 flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-brand-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Button asChild>
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
