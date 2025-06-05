import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const Pagination = ({
  currentPage,
  hasNext,
  hasPrev,
  total,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">Page</span>
        <span className="text-sm">{currentPage}</span>
        <span className="text-sm text-muted-foreground">of</span>
        <span className="text-sm">{totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
