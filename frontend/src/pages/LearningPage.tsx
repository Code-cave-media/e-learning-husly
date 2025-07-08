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

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { fetchType, fetching, isFetched, makeApiCall } = useAPICall();
  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const affiliateUserId = useRef(null);
  console.log("Affiliate User ID:", affiliateUserId.current);
  useEffect(() => {
    const getAllItems = async () => {
      try {
        const courseResponse = await makeApiCall(
          "GET",
          API_ENDPOINT.LIST_COURSES(1, 20),
          {},
          "application/json"
        );
        if (courseResponse.status === 200) {
          affiliateUserId.current = courseResponse.data.affiliate_user_id;
          setCourses(
            courseResponse.data.items.map((course: any) => ({
              ...course,
              type: "course",
            }))
          );
        }
        const ebookResponse = await makeApiCall(
          "GET",
          API_ENDPOINT.LIST_EBOOKS(1, 20),
          {},
          "application/json"
        );
        if (ebookResponse.status === 200) {
          setEbooks(
            ebookResponse.data.items.map((ebook) => ({
              ...ebook,
              type: "ebook",
            }))
          );
        }
      } catch (error) {
        toast.error(
          "Failed to fetch learning resources. Please try again later."
        );
      }
    };
    getAllItems();
  }, []);

  // Combine courses and ebooks into a single array
  const allContent = [
    ...courses.map((course) => ({ ...course, contentType: "course" })),
    ...ebooks.map((ebook) => ({ ...ebook, contentType: "ebook" })),
  ];

  // Filter content based on active tab
  const filteredContent = allContent.filter((item) => {
    if (activeTab === "all") return true;
    return item.type.toLowerCase() === activeTab.toLowerCase();
  });
  if (!isFetched) {
    return <Loading />;
  }
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Learning Resources</h1>
      </div>

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

        <TabsContent value={activeTab} className="mt-6">
          {filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) =>
                item.contentType === "course" ? (
                  <CourseCard key={item.id} {...item} isHomePage={true} />
                ) : (
                  <EbookCard key={item.id} {...item} isHomePage={true} />
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
    </div>
  );
};

export default LearningPage;
