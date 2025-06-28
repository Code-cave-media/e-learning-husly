import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/shared/CourseCard";
import EbookCard from "@/components/shared/EbookCard";
import EmptyState from "@/components/shared/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock data for courses
const courses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more with practical projects.",
    price: 49.99,
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=800",
    type: "Training",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Advanced React & Redux",
    description:
      "Master React hooks, context API, Redux and build professional applications.",
    price: 59.99,
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=800",
    type: "Training",
    isNew: true,
  },
  {
    id: "3",
    title: "Python Data Science Masterclass",
    description:
      "Learn Python for data analysis, visualization, machine learning and more.",
    price: 69.99,
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&w=800",
    type: "Training",
  },
];

// Mock data for ebooks
const ebooks = [
  {
    id: "1",
    title: "React Patterns & Best Practices",
    description: "Practical guide to writing maintainable React applications.",
    price: 19.99,
    thumbnail:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&w=800",
    type: "Blueprint",
    isFeatured: true,
  },
  {
    id: "2",
    title: "The Complete Guide to JavaScript",
    description:
      "Master modern JavaScript from fundamentals to advanced topics.",
    price: 24.99,
    thumbnail:
      "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&w=800",
    type: "Blueprint",
    isNew: true,
  },
];

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState("all");

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
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="blueprint">Blueprints</TabsTrigger>
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
