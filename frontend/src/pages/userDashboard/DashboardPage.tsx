import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Loading } from "@/components/ui/loading";
import EbookCard from "@/components/shared/EbookCard";
import Pagination from "@/components/Pagination";

// Mock data for demonstration

interface CardData {
  total_purchase: number;
  total_progressing_course: number;
  total_ebooks: number;
  total_courses: number;
}

interface CourseEbookData {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  is_new: boolean;
  is_featured: boolean;
  is_purchased: boolean;
  type: "course" | "ebook";
  has_affiliate_link: boolean;
}

const DashboardPage = () => {
  const [currentFilter, setCurrentFilter] = useState("all");
  const { authToken, user } = useAuth();
  const { fetchType, fetching, makeApiCall } = useAPICall();
  const [isFetched, setIsFetched] = useState(false);
  const [page, setPage] = useState(1);
  const [cardData, setCardData] = useState<CardData>({
    total_purchase: -1,
    total_progressing_course: -1,
    total_ebooks: -1,
    total_courses: -1,
  });
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    total: 0,
    totalPages: 0,
  });
  const pageSize = 20;
  const [courseEbookData, setCourseEbookData] = useState<CourseEbookData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCourseEbook();
      await fetchCardData();
      setIsFetched(true);
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (isFetched) {
      fetchCourseEbook();
    }
  }, [currentFilter, page]);
  const fetchCourseEbook = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_USER_DASHBOARD_LIST(currentFilter, page, pageSize),
      {},
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setCourseEbookData(response.data.items);
      setPagination({
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
        total: response.data.total,
        totalPages: response.data.total_pages,
      });
    } else {
      toast.error("Error fetching user dashboard");
    }
  };
  const fetchCardData = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_USER_DASHBOARD_CARD,
      {},
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setCardData(response.data);
    } else {
      toast.error("Error fetching user dashboard");
    }
  };
  if (!isFetched) {
    return <Loading />;
  }
  return (
    <div className=" px-4 mx-auto py-8 max-sm:py-0">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Track your progress and continue learning.
        </p>
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              {/* Responsive text size for card titles */}
              <span className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                Total purchase
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {/* Responsive text size for card numbers */}
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                {cardData.total_purchase}
              </span>
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              <span className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                Training Progress
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                {cardData.total_progressing_course}
              </span>
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              <span className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                Total Blueprints
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                {cardData.total_ebooks}
              </span>
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              <span className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                Total Trainings
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                {cardData.total_courses}
              </span>
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <Tabs
        defaultValue="all"
        value={currentFilter}
        onValueChange={setCurrentFilter}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="courses">My Trainings</TabsTrigger>
          <TabsTrigger value="ebooks">My Blueprints</TabsTrigger>
        </TabsList>
        {fetching && <Loading />}
        <TabsContent value={currentFilter} className="mt-6">
          {!fetching && (
            <>
              {courseEbookData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseEbookData.map((course) =>
                    course.type === "course" ? (
                      <CourseCard
                        key={course.id}
                        {...course}
                        is_purchased={true}
                      />
                    ) : (
                      <EbookCard
                        key={course.id}
                        {...course}
                        is_purchased={true}
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyState
                  title={`No ${
                    currentFilter === "all"
                      ? "Purchased Training or Blueprint"
                      : currentFilter === "course"
                      ? "Trainings"
                      : "Blueprints"
                  } found`}
                  description={
                    currentFilter === "all"
                      ? "You haven't purchased any training or blueprint yet."
                      : currentFilter === "course"
                      ? "You haven't purchased any trainings yet."
                      : "You haven't purchased any Blueprints yet."
                  }
                  // actionLabel={
                  //   currentFilter === "all"
                  //     ? "Browse Courses"
                  //     : currentFilter === "course"
                  //     ? "Browse Trainings"
                  //     : "Browse Blueprints"
                  // }
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      {!fetching && courseEbookData.length > 0 && (
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

export default DashboardPage;
