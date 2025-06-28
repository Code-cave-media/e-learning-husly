import React, { useState } from "react";
import TabNavigation from "@/components/shared/TabNavigation";
import EbookCard from "@/components/shared/EbookCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

// Mock data
const allEbooks = [
  {
    id: "1",
    title: "React Patterns & Best Practices",
    description: "Practical guide to writing maintainable React applications.",
    price: 19.99,
    thumbnail:
      "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&w=800",
    isFeatured: true,
  },
  {
    id: "2",
    title: "The Complete Guide to JavaScript",
    description:
      "Master modern JavaScript from fundamentals to advanced topics.",
    price: 24.99,
    thumbnail:
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&w=800",
    isNew: true,
  },
  {
    id: "3",
    title: "Python for Data Science",
    description:
      "Learn Python programming for data analysis and visualization.",
    price: 17.99,
    thumbnail:
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&w=800",
  },
  {
    id: "4",
    title: "Cloud Architecture Fundamentals",
    description:
      "Understand cloud computing models, services, and best practices.",
    price: 29.99,
    thumbnail:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&w=800",
    isNew: true,
  },
  {
    id: "5",
    title: "Web Security Handbook",
    description:
      "Practical guide for securing web applications and preventing attacks.",
    price: 22.99,
    thumbnail:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&w=800",
    isFeatured: true,
  },
];

// User's purchased ebooks
const myEbooks = allEbooks
  .slice(0, 1)
  .map((ebook) => ({ ...ebook, isPurchased: true }));

// New ebooks
const newEbooks = allEbooks.filter((ebook) => ebook.isNew);

// Featured ebooks
const featuredEbooks = allEbooks.filter((ebook) => ebook.isFeatured);

const EbooksPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const { isAuthenticated } = useAuth();
  const allTabs = [
    { id: "all", label: "All eBooks" },
    { id: "my", label: "My eBooks" },
    { id: "new", label: "New" },
    { id: "featured", label: "Featured" },
  ];
  const tabs = allTabs.filter((item) => {
    if (item.id == "my" && !isAuthenticated) {
      return false;
    }
    return true;
  });
  let ebooksToShow;
  switch (activeTab) {
    case "my":
      ebooksToShow = myEbooks;
      break;
    case "new":
      ebooksToShow = newEbooks;
      break;
    case "featured":
      ebooksToShow = featuredEbooks;
      break;
    default:
      ebooksToShow = allEbooks;
  }

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blueprints</h1>
        <p className="text-gray-600">
          Expand your knowledge with our professional eBooks.
        </p>
      </div>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-8">
        {ebooksToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooksToShow.map((ebook) => (
              <EbookCard key={ebook.id} {...ebook} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No eBooks found"
            description={
              activeTab === "my"
                ? "You haven't purchased any eBooks yet."
                : "No eBooks available in this category."
            }
            actionLabel={activeTab === "my" ? "Browse eBooks" : undefined}
            actionLink={activeTab === "my" ? "/ebooks" : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default EbooksPage;
