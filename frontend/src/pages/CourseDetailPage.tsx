/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Video,
  PlayCircle,
} from "lucide-react";
import RegistrationForm from "@/components/shared/RegistrationForm";
import { toast } from "sonner";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";

// Add Razorpay type to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Mock data - In a real app, this would come from an API
const courseData = {
  id: "1",
  title: "The Complete Guide to Digital Marketing",
  description:
    "A comprehensive guide to mastering digital marketing strategies, tools, and techniques for business growth.",
  price: 49.99,
  originalPrice: 99.99,
  imageUrl:
    "https://www.hostinger.in/tutorials/wp-content/uploads/sites/2/2022/07/the-structure-of-a-url.png",
  instructor: "Jane Smith",
  videoUrl:
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  duration: "12 hours",
  level: "Beginner to Advanced",
  isPurchased: false,
  modules: [
    {
      title: "Introduction to Digital Marketing",
      description: "Understanding the digital marketing landscape",
      lessons: 5,
      duration: "2 hours",
    },
    {
      title: "Content Marketing Strategy",
      description: "Creating and distributing valuable content",
      lessons: 8,
      duration: "3 hours",
    },
    {
      title: "Social Media Marketing",
      description: "Building and engaging your social media presence",
      lessons: 6,
      duration: "2.5 hours",
    },
    {
      title: "Email Marketing",
      description: "Creating effective email campaigns",
      lessons: 4,
      duration: "1.5 hours",
    },
    {
      title: "SEO Fundamentals",
      description: "Optimizing your content for search engines",
      lessons: 7,
      duration: "3 hours",
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
};

export default function EbookAffiliateLandingPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const affiliateId = searchParams.get("ref");
  const loggedUser = false;
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { fetching, makeApiCall } = useAPICall();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (affiliateId) {
      console.log(`Affiliate visit from ID: ${affiliateId}`);
    }
  }, [affiliateId]);
  const handlePurchaseSuccess = async (data: {
    email: string;
    password: string;
  }) => {
    console.log("Purchase data:", data, isAuthenticated);
    const response = await makeApiCall("POST", API_ENDPOINT.PURCHASE_NEW_USER, {
      item_id: 1,
      item_type: "course",
      ...data,
      // affiliate_user_id: affiliateId,
    });
    console.log("Purchase response:", response);
    if (response.status === 200) {
      const data = response.data;
      const options = {
        key: "rzp_test_vXnn0IOMPtsYg0", // Replace with your public key
        amount: data.amount,
        currency: data.currency,
        name: "My Company",
        description: "Test Transaction",
        order_id: data.id,
        handler: function (response) {
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">Digital Marketing</Badge>
                <Badge variant="outline">4.9 ★ (1,234 reviews)</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {courseData.title}
              </h1>
              <p className="text-xl text-muted-foreground">
                {courseData.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{courseData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>{courseData.level}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
                <video
                  className="w-full h-full object-cover"
                  poster={courseData.imageUrl}
                  controls={isVideoPlaying}
                  onClick={() => setIsVideoPlaying(true)}
                  src={courseData.videoUrl}
                >
                  <source src={courseData.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white rounded-full p-6"
                      onClick={() => setIsVideoPlaying(true)}
                    >
                      <PlayCircle className="w-8 h-8" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container px-4 mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Modules */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Course Modules</h2>
              <div className="space-y-4">
                {courseData.modules.map((module, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {module.lessons} lessons
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {module.duration}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Module {index + 1}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About the Instructor</h2>
              <div className="flex items-start gap-6">
                <img
                  src="/author.jpg"
                  alt={courseData.instructor}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {courseData.instructor}
                  </h3>
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
                  type="course"
                  itemId={id || ""}
                  price={courseData.price}
                  affiliateId={affiliateId || undefined}
                  onSuccess={handlePurchaseSuccess}
                />
              ) : (
                <Card className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">${courseData.price}</h3>
                    <p className="text-muted-foreground line-through">
                      ${courseData.originalPrice}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {!courseData.isPurchased ? (
                      <>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() =>
                            handlePurchaseSuccess({ email: "", password: "" })
                          }
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
                          onClick={() => navigate(`/course/${id}`)}
                        >
                          Go to Course
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
