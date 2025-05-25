import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";

// Mock data for demonstration
const mockCourses = [
  {
    id: "1",
    title: "Web Development Bootcamp",
    description: "Learn full-stack web development from scratch",
    price: 99.99,
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3",
    isNew: true,
    isFeatured: true,
    isPurchased: true,
  },
  {
    id: "2",
    title: "Digital Marketing Masterclass",
    description: "Master the art of digital marketing and grow your business",
    price: 79.99,
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3",
    isNew: true,
    isFeatured: false,
    isPurchased: false,
  },
  {
    id: "3",
    title: "Data Science Fundamentals",
    description: "Learn data science and machine learning basics",
    price: 129.99,
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3",
    isNew: false,
    isFeatured: true,
    isPurchased: false,
  },
];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Filter courses based on active tab
  const getFilteredCourses = () => {
    switch (activeTab) {
      case "my":
        return mockCourses.filter((course) => course.isPurchased);
      case "new":
        return mockCourses.filter((course) => course.isNew);
      case "featured":
        return mockCourses.filter((course) => course.isFeatured);
      default:
        return mockCourses;
    }
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="container px-4 mx-auto py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, User!</h1>
        <p className="text-gray-600">
          Track your progress and continue learning.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Total purchase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">10</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">2</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">
              Certificates Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">3</span>
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="course">My Trainings</TabsTrigger>
          <TabsTrigger value="ebook">My BluePrints</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
