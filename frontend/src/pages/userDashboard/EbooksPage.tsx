import React, { useEffect, useState } from "react";
import TabNavigation from "@/components/shared/TabNavigation";
import EbookCard from "@/components/shared/EbookCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { Loading } from "@/components/ui/loading";

const allTabs = [
  { id: "all", label: "All Trainings" },
  { id: "my", label: "My Trainings" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
];
const UserDashboardEbooksPage = () => {
  const [filter, setFilter] = useState("all");
  const { makeApiCall, fetchType, fetching } = useAPICall();
  const [ebookData, setEbookData] = useState([]);
  const { isAuthenticated, authToken } = useAuth();
  const [page, setPage] = useState(1);
  useEffect(() => {
    fetchEbookData();
  }, [filter, page]);
  const fetchEbookData = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_USER_DASHBOARD_EBOOKS(filter, page, 20),
      {},
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setEbookData(response.data.items);
    }
  };

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blueprints</h1>
        <p className="text-gray-600">
          Expand your knowledge with our professional eBooks.
        </p>
      </div>
      <TabNavigation
        tabs={allTabs}
        activeTab={filter}
        onTabChange={setFilter}
      />
      {fetching && <Loading />}
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
    </div>
  );
};

export default UserDashboardEbooksPage;
