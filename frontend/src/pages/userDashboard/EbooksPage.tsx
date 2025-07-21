/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import TabNavigation from "@/components/shared/TabNavigation";
import EbookCard from "@/components/shared/EbookCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { Loading } from "@/components/ui/loading";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";

const allTabs = [
  { id: "all", label: "All Trainings" },
  { id: "my", label: "My Trainings" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
];
const UserDashboardEbooksPage = () => {
  const [filter, setFilter] = useState("all");
  const { makeApiCall, fetchType, fetching, isFetched } = useAPICall();
  const [currentQuery, setCurrentQuery] = useState("");
  const [search, setSearch] = useState("");
  const [ebookData, setEbookData] = useState([]);
  const { authToken } = useAuth();
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    total: 0,
    totalPages: 0,
  });
  const pageSize = 20;
  const [page, setPage] = useState(1);
  useEffect(() => {
    fetchEbookData();
  }, [filter, page, search]);
  const fetchEbookData = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_USER_DASHBOARD_EBOOKS(filter, page, pageSize, search),
      {},
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setEbookData(response.data.items);
      setPagination({
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
        total: response.data.total,
        totalPages: response.data.total_pages,
      });
    }
  };

  const handleKeyPress = (e: any = null) => {
    if (e && e.key === "Enter") {
      setPage(1);
      setSearch(currentQuery);
    }
    if (!e) {
      setPage(1);
      setSearch(currentQuery);
    }
  };
  return (
    <div className="px-4 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blueprints</h1>
        <p className="text-gray-600">
          Expand your knowledge with our professional eBooks.
        </p>
      </div>
      {/* Search Bar */}
      <div className="relative flex items-center flex-1">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by courses"
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-8 w-full sm:w-[300px]"
        />
        <Button
          variant="ghost"
          size="icon"
          className="right-2 hover:bg-inherit"
          onClick={(e) => handleKeyPress(e)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {/* Filtering Tabs */}
      <TabNavigation
        tabs={allTabs}
        activeTab={filter}
        onTabChange={setFilter}
      />
      {(fetching || !isFetched) && <Loading />}
      {!fetching && (
        <div className="mt-8">
          {ebookData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ebookData.map((ebook) => (
                <EbookCard key={ebook.id} {...ebook} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No eBooks found"
              description={
                filter === "my"
                  ? "You haven't purchased any eBooks yet."
                  : "No eBooks available in this category."
              }
            />
          )}
        </div>
      )}
      {!fetching && ebookData.length > 0 && (
        <Pagination
          currentPage={page}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          total={pagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default UserDashboardEbooksPage;
