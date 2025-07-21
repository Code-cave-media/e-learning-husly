import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const Pagination = ({
  currentPage,
  hasNext,
  hasPrev,
  total,
  pageSize,
  itemsSize,
  onPageChange,
}: {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  pageSize: number;
  itemsSize?: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="flex items-center justify-center mt-4">
      {/* <div className="text-sm text-muted-foreground max-sm:hidden">
        Showing {itemsSize} of {total} purchases
      </div> */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
