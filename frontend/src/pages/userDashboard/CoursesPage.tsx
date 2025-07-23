/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import TabNavigation from "@/components/shared/TabNavigation";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";

const allTabs = [
  { id: "all", label: "All Trainings" },
  { id: "my", label: "My Trainings" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
];
const UserDashboardCoursesPage = () => {
  const [filter, setFilter] = useState("all");
  const { makeApiCall, fetchType, fetching, isFetched } = useAPICall();
  const [courseData, setCourseData] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [search, setSearch] = useState("");
  const { isAuthenticated, authToken } = useAuth();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    total: 0,
    totalPages: 0,
  });
  const pageSize = 20;
  useEffect(() => {
    fetchCourseData();
  }, [filter, page, search]);
  const fetchCourseData = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_USER_DASHBOARD_COURSES(filter, page, pageSize, search),
      {},
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setCourseData(response.data.items);
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
      // fetchCourseData();
    }
    if (!e) {
      setPage(1);
      setSearch(currentQuery);
      // fetchCourseData();
    }
  };
  return (
    <div className=" px-2 sm:px-4 mx-auto py-4 sm:py-8 max-sm:py-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          Trainings
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Discover and learn with our professional courses.
        </p>
      </div>
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
      <TabNavigation
        tabs={allTabs}
        activeTab={filter}
        onTabChange={setFilter}
      />
      {(fetching || !isFetched) && <Loading />}
      {!fetching && (
        <div className="mt-6 sm:mt-8">
          {courseData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courseData.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={"No courses found"}
              description={
                filter === "my"
                  ? "You haven't purchased any courses yet."
                  : "No courses available in this category."
              }
              actionLabel={filter === "my" ? "Browse Courses" : undefined}
              actionLink={filter === "my" ? "/courses" : undefined}
            />
          )}
        </div>
      )}
      {!fetching && courseData.length > 0 && (
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

export default UserDashboardCoursesPage;
