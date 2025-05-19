import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Download,
  Clock,
} from "lucide-react";
import RegistrationForm from "@/components/shared/RegistrationForm";
import { toast } from "sonner";

// Mock data - In a real app, this would come from an API
const ebookData = {
  id: "1",
  title: "The Complete Guide to Digital Marketing",
  description:
    "A comprehensive guide to mastering digital marketing strategies, tools, and techniques for business growth.",
  price: 49.99,
  originalPrice: 99.99,
  imageUrl:
    "https://www.hostinger.in/tutorials/wp-content/uploads/sites/2/2022/07/the-structure-of-a-url.png",
  author: "Jane Smith",
  videoUrl:
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  pdf: "",
  pages: 250,
  format: "PDF, EPUB, MOBI",
  chapters: [
    {
      title: "Introduction to Digital Marketing",
      description: "Understanding the digital marketing landscape",
    },
    {
      title: "Content Marketing Strategy",
      description: "Creating and distributing valuable content",
    },
    {
      title: "Social Media Marketing",
      description: "Building and engaging your social media presence",
    },
    {
      title: "Email Marketing",
      description: "Creating effective email campaigns",
    },
    {
      title: "SEO Fundamentals",
      description: "Optimizing your content for search engines",
    },
  ],
  features: [
    "Comprehensive digital marketing strategies",
    "Step-by-step implementation guides",
    "Case studies and real-world examples",
    "Actionable templates and checklists",
    "Expert tips and best practices",
    "Future trends and predictions",
  ],
  isPurchased: false,
};

export default function EbookAffiliateLandingPage() {
  const loggedUser = true;
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const affiliateId = searchParams.get("ref");

  useEffect(() => {
    // In a real app, you would track the affiliate visit here
    if (affiliateId) {
      console.log(`Affiliate visit from ID: ${affiliateId}`);
    }
  }, [affiliateId]);

  const handlePurchaseSuccess = () => {
    // Redirect to the e-book page after successful purchase
    navigate(`/ebook/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">Digital Marketing</Badge>
                <Badge variant="outline">4.9 ★ (1,234 reviews)</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {ebookData.title}
              </h1>
              <p className="text-xl text-muted-foreground">
                {ebookData.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>{ebookData.pages} Pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>{ebookData.format}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
                <img
                  src={ebookData.imageUrl}
                  alt={ebookData.title}
                  className="w-full h-full object-fit"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container px-4 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What's Inside</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ebookData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapters */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Table of Contents</h2>
              <div className="space-y-4">
                {ebookData.chapters.map((chapter, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{chapter.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {chapter.description}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Chapter {index + 1}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About the Author</h2>
              <div className="flex items-start gap-6">
                <img
                  src="/author.jpg"
                  alt={ebookData.author}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{ebookData.author}</h3>
                  <p className="text-muted-foreground">
                    Digital Marketing Expert
                  </p>
                  <p>
                    With over 15 years of experience in digital marketing, Jane
                    has helped numerous businesses achieve their marketing goals
                    and grow their online presence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {!loggedUser ? (
                <RegistrationForm
                  type="ebook"
                  itemId={id || ""}
                  price={ebookData.price}
                  affiliateId={affiliateId || undefined}
                  onSuccess={handlePurchaseSuccess}
                />
              ) : (
                <Card className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">${ebookData.price}</h3>
                    <p className="text-muted-foreground line-through">
                      ${ebookData.originalPrice}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {!ebookData.isPurchased ? (
                      <>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handlePurchaseSuccess}
                        >
                          Buy Now
                        </Button>
                        <Button className="w-full" variant="outline" size="lg">
                          Create Affiliate Link
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => navigate(`/ebook/${id}`)}
                        >
                          Go to Ebook
                        </Button>
                        <Button className="w-full" variant="outline" size="lg">
                          Create Affiliate Link
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
