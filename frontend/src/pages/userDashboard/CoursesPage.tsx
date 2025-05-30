import React, { useEffect, useState } from "react";
import TabNavigation from "@/components/shared/TabNavigation";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { Loading } from "@/components/ui/loading";

const allTabs = [
  { id: "all", label: "All Trainings" },
  { id: "my", label: "My Trainings" },
  { id: "new", label: "New" },
  { id: "featured", label: "Featured" },
];
const UserDashboardCoursesPage = () => {
  const [filter, setFilter] = useState("all");
  const { makeApiCall, fetchType, fetching } = useAPICall();
  const [courseData, setCourseData] = useState([]);
  const { isAuthenticated, authToken } = useAuth();
  const [page, setPage] = useState(1);
  useEffect(() => {
    fetchCourseData();
  }, [filter, page]);
  const fetchCourseData = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_USER_DASHBOARD_COURSES(filter, page, 20),
      {},
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setCourseData(response.data.items);
    }
  };
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trainings</h1>
        <p className="text-gray-600">
          Discover and learn with our professional courses.
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
          {courseData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default UserDashboardCoursesPage;
