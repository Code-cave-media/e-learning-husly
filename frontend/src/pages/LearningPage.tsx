/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/shared/CourseCard";
import EbookCard from "@/components/shared/EbookCard";
import EmptyState from "@/components/shared/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const {  fetching, isFetched, makeApiCall } = useAPICall();
  const affiliateUserId = useRef(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [AllItems, setAllItems] = useState([]);
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    total: 0,
    totalPages: 0,
  });
  const pageSize = 20;
  useEffect(() => {
    const getAllItems = async () => {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.PUBLIC_ALL_ITEMS(page, pageSize, search, activeTab),
        {},
        "application/json"
      );
      if (response.status == 200) {
        setAllItems(response.data.items);
        setPagination({
          hasNext: response.data.has_next,
          hasPrev: response.data.has_prev,
          total: response.data.total,
          totalPages: response.data.total_pages,
        });
        affiliateUserId.current = response.data.affiliate_user_id;
      } else {
        toast.error(
          "Failed to fetch learning resources. Please try again later."
        );
      }
    };
    getAllItems();
  }, [search, page, activeTab]);

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
    <div className="container px-4 mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Learning Resources</h1>
      </div>
      <div className="relative flex items-center flex-1 mb-4">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search training and blueprints"
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-8 w-full sm:w-[300px]"
        />
        <Button
          variant="ghost"
          size="icon"
          className="right-2 hover:bg-inherit"
          onClick={() => handleKeyPress(null)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {!fetching && (
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="course">Training</TabsTrigger>
            <TabsTrigger value="ebook">Blueprints</TabsTrigger>
          </TabsList>
          {fetching && !isFetched && <Loading />}
          <TabsContent value={activeTab} className="mt-6">
            {AllItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AllItems.map((item) =>
                  item.contentType === "course" ? (
                    <CourseCard
                      key={item.id}
                      {...item}
                      isHomePage={true}
                      affiliate_user_id={affiliateUserId.current}
                    />
                  ) : (
                    <EbookCard
                      key={item.id}
                      {...item}
                      isHomePage={true}
                      affiliate_user_id={affiliateUserId.current}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState
                title="No content found"
                description="No learning resources available in this category."
              />
            )}
          </TabsContent>
        </Tabs>
      )}
      {!(fetching || !isFetched)&& AllItems.length!=0 && (
        <Pagination
          currentPage={page}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsSize={pageSize}
          onPageChange={setPage}
          pageSize={pageSize}
          total={pagination.total}
        />
      )}
    </div>
  );
};

export default LearningPage;
