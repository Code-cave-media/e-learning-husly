import React, { useState } from "react";
import TabNavigation from "@/components/shared/TabNavigation";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

// Mock data
const allCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more with practical projects.",
    price: 49.99,
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=800",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Advanced React & Redux",
    description:
      "Master React hooks, context API, Redux and build professional applications.",
    price: 59.99,
    imageUrl:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&w=800",
    isNew: true,
  },
  {
    id: "3",
    title: "Python Data Science Masterclass",
    description:
      "Learn Python for data analysis, visualization, machine learning and more.",
    price: 69.99,
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&w=800",
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description:
      "Master Figma, design principles, and create stunning user interfaces.",
    price: 39.99,
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&w=800",
    isNew: true,
  },
  {
    id: "5",
    title: "DevOps for Beginners",
    description:
      "Learn Docker, Kubernetes, CI/CD pipelines and cloud infrastructure.",
    price: 79.99,
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&w=800",
  },
  {
    id: "6",
    title: "Flutter App Development",
    description:
      "Build cross-platform mobile apps with Flutter and Dart programming.",
    price: 54.99,
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&w=800",
    isFeatured: true,
  },
];

// User's purchased courses
const myCourses = allCourses
  .slice(0, 2)
  .map((course) => ({ ...course, isPurchased: true }));

// New courses
const newCourses = allCourses.filter((course) => course.isNew);

// Featured courses
const featuredCourses = allCourses.filter((course) => course.isFeatured);

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const allTabs = [
    { id: "all", label: "All Courses" },
    { id: "my", label: "My Courses" },
    { id: "new", label: "New" },
    { id: "featured", label: "Featured" },
  ];

  const { isAuthenticated } = useAuth();

  const tabs = allTabs.filter((item) => {
    if (item.id == "my" && !isAuthenticated) {
      return false;
    }
    return true;
  });

  let coursesToShow;
  switch (activeTab) {
    case "my":
      coursesToShow = myCourses;
      break;
    case "new":
      coursesToShow = newCourses;
      break;
    case "featured":
      coursesToShow = featuredCourses;
      break;
    default:
      coursesToShow = allCourses;
  }

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Courses</h1>
        <p className="text-gray-600">
          Discover and learn with our professional courses.
        </p>
      </div>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-8">
        {coursesToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesToShow.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No courses found"
            description={
              activeTab === "my"
                ? "You haven't purchased any courses yet."
                : "No courses available in this category."
            }
            actionLabel={activeTab === "my" ? "Browse Courses" : undefined}
            actionLink={activeTab === "my" ? "/courses" : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
