import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Clock,
  PlayCircle,
} from "lucide-react";
import RegistrationForm from "@/components/shared/RegistrationForm";
import { toast } from "sonner";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";

interface Chapter {
  id: number;
  title: string;
  description: string;
  video: File | null;
  videoUrl: string;
  duration: number;
}

interface Instructor {
  id: number;
  name: string;
  position: string;
  description: string;
  image_url: string;
}

interface LearningPoint {
  id: number;
  text: string;
}

interface Course {
  id: number;
  type: string;
  title: string;
  description: string;
  total_hours: number;
  level: string;
  commission: number;
  price: number;
  thumbnail: File | null;
  thumbnailUrl: string;
  introVideo: File | null;
  introVideoUrl: string;
  visible: boolean;
  chapters: Chapter[];
  instructor: Instructor;
  learning_points: LearningPoint[];
  duration: string;
  originalPrice: number;
  isPurchased: boolean;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const affiliateId = searchParams.get("ref");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { fetching, makeApiCall } = useAPICall();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);

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
    });
    console.log("Purchase response:", response);
    if (response.status === 200) {
      const data = response.data;
      const options = {
        key: "rzp_test_vXnn0IOMPtsYg0",
        amount: data.amount,
        currency: data.currency,
        name: "My Company",
        description: "Test Transaction",
        order_id: data.id,
        handler: function (response) {},
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

  // Dummy course data
  useEffect(() => {
    setCourse({
      id: 1,
      type: "Digital Marketing",
      title: "Digital Marketing Masterclass",
      description: "Learn digital marketing from scratch",
      total_hours: 20,
      level: "Beginner to Advanced",
      commission: 10,
      price: 4999,
      thumbnail: null,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      introVideo: null,
      introVideoUrl:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      visible: true,
      chapters: [
        {
          id: 1,
          title: "Introduction to Digital Marketing",
          description:
            "Learn the fundamentals of digital marketing and its importance in today's business landscape.",
          video: null,
          videoUrl: "",
          duration: 45,
        },
        {
          id: 2,
          title: "Search Engine Optimization (SEO)",
          description:
            "Master the art of optimizing your website for search engines and driving organic traffic.",
          video: null,
          videoUrl: "",
          duration: 60,
        },
        {
          id: 3,
          title: "Social Media Marketing",
          description:
            "Create and execute effective social media strategies across different platforms.",
          video: null,
          videoUrl: "",
          duration: 75,
        },
        {
          id: 4,
          title: "Content Marketing",
          description:
            "Learn how to create engaging content that resonates with your target audience.",
          video: null,
          videoUrl: "",
          duration: 90,
        },
        {
          id: 5,
          title: "Email Marketing",
          description:
            "Build and manage email campaigns that convert subscribers into customers.",
          video: null,
          videoUrl: "",
          duration: 60,
        },
      ],
      instructor: {
        id: 1,
        name: "John Doe",
        position: "Digital Marketing Expert",
        description:
          "10+ years of experience in digital marketing, specializing in SEO and social media strategy. Former marketing director at TechCorp and founder of DigitalGrowth Academy.",
        image_url: "https://example.com/instructor.jpg",
      },
      learning_points: [
        { id: 1, text: "Understand the core principles of digital marketing" },
        { id: 2, text: "Master SEO techniques to improve website visibility" },
        { id: 3, text: "Create effective social media marketing campaigns" },
        { id: 4, text: "Develop engaging content marketing strategies" },
        {
          id: 5,
          text: "Build and manage successful email marketing campaigns",
        },
        { id: 6, text: "Analyze and optimize marketing performance" },
        { id: 7, text: "Create a comprehensive digital marketing plan" },
        { id: 8, text: "Understand and implement marketing automation" },
      ],
      duration: "20 hours",
      originalPrice: 9999,
      isPurchased: false,
    });
  }, [id]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{course.type}</Badge>
                <Badge variant="outline">4.9 ★ (1,234 reviews)</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{course.title}</h1>
              <p className="text-xl text-muted-foreground">
                {course.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{course.total_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>{course.level}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
                {course.thumbnailUrl ? (
                  <video
                    className="w-full h-full object-cover"
                    poster={course.thumbnailUrl}
                    controls={isVideoPlaying}
                    onClick={() => setIsVideoPlaying(true)}
                    src={course.introVideoUrl}
                  >
                    <source src={course.introVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No media</span>
                  </div>
                )}
                {!isVideoPlaying && course.thumbnailUrl && (
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
            {/* Learning Points */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learning_points.map((point) => (
                  <div key={point.id} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    <span>{point.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Modules */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Course Modules</h2>
              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <Card key={chapter.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{chapter.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {chapter.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {chapter.duration} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About the Instructor</h2>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {course.instructor.name}
                </h3>
                <p className="text-muted-foreground">
                  {course.instructor.position}
                </p>
                <p>{course.instructor.description}</p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RegistrationForm
                type="course"
                itemId={id || ""}
                price={course.price}
                affiliateId={affiliateId || undefined}
                onSuccess={handlePurchaseSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
