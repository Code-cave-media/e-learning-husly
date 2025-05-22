import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  Award,
} from "lucide-react";
import useDownloader from "react-use-downloader";

import { useParams, useNavigate } from "react-router-dom";

// Mock data - In a real app, this would come from an API
const courseData = {
  id: "1",
  title: "Web Development Bootcamp",
  description: "Learn full-stack web development from scratch",
  thumbnail:
    "https://marketplace.canva.com/EAEqfS4X0Xw/1/0/1600w/canva-most-attractive-youtube-thumbnail-wK95f3XNRaM.jpg",
  chapters: [
    {
      id: "1",
      title: "Introduction to Web Development",
      description:
        "Learn the fundamentals of web development, including how the web works, client-server architecture, and basic concepts.",
      videoUrl:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "15:30",
      completed: true,
    },
    {
      id: "2",
      title: "HTML Fundamentals",
      description:
        "Master HTML5 elements, semantic markup, forms, and accessibility best practices for creating well-structured web pages.",
      videoUrl:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "20:45",
      completed: true,
    },
    {
      id: "3",
      title: "CSS Styling",
      description:
        "Explore CSS3 features, including flexbox, grid, animations, and responsive design techniques for modern web layouts.",
      videoUrl:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "25:15",
      completed: true,
    },
    {
      id: "4",
      title: "JavaScript Basics",
      description:
        "Understand JavaScript fundamentals, including variables, functions, objects, and DOM manipulation for interactive web applications.",
      videoUrl:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "30:00",
      completed: true,
    },
  ],
  hasCertificate: true,
  certificateUrl:
    "https://cdn-ghkoj.nitrocdn.com/kjYfdEBKRwdYwvHQyjaYBdTGFpFGjqYW/assets/images/optimized/rev-87469d3/sertifier.com/blog/wp-content/uploads/2024/01/1-2-scaled.jpg",
};

const CourseWatchPage = () => {
  const { download } = useDownloader();

  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(
    courseData.chapters.find((chapter) => chapter.id === chapterId) ||
      courseData.chapters[0]
  );

  const handleChapterChange = (chapterId: string) => {
    const chapter = courseData.chapters.find((c) => c.id === chapterId);
    if (chapter) {
      setCurrentChapter(chapter);
    }
  };

  const handleNextChapter = () => {
    const currentIndex = courseData.chapters.findIndex(
      (c) => c.id === currentChapter.id
    );
    if (currentIndex < courseData.chapters.length - 1) {
      handleChapterChange(courseData.chapters[currentIndex + 1].id);
    }
  };

  const handlePreviousChapter = () => {
    const currentIndex = courseData.chapters.findIndex(
      (c) => c.id === currentChapter.id
    );
    if (currentIndex > 0) {
      handleChapterChange(courseData.chapters[currentIndex - 1].id);
    }
  };

  const progress =
    (courseData.chapters.filter((c) => c.completed).length /
      courseData.chapters.length) *
    100;

  const isAllChaptersCompleted = courseData.chapters.every(
    (chapter) => chapter.completed
  );

  const handleCertificateAction = () => {
    if (courseData.hasCertificate) {
      // Navigate to certificate view page
      navigate(`/course/${courseId}/certificate`);
    } else {
      // Show certificate claim modal or navigate to claim page
      navigate(`/course/${courseId}/claim-certificate`);
    }
  };

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={currentChapter.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={courseData.thumbnail}
                />
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold">{currentChapter.title}</h2>

                <p className="text-md text-muted-foreground mt-2">
                  {currentChapter.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousChapter}
                  disabled={courseData.chapters[0].id === currentChapter.id}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Chapter
                </Button>
                <Button
                  onClick={handleNextChapter}
                  disabled={
                    courseData.chapters[courseData.chapters.length - 1].id ===
                    currentChapter.id
                  }
                >
                  Next Chapter
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chapters List Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Course Progress</h3>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}% Complete
                </p>
              </div>

              {isAllChaptersCompleted && courseData.hasCertificate && (
                <Button
                  className="w-full mb-4"
                  onClick={() =>
                    download(courseData.certificateUrl, "certificate.jpg")
                  }
                >
                  <Award className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              )}
              {isAllChaptersCompleted && !courseData.hasCertificate && (
                <Button className="w-full mb-4" onClick={() => {}}>
                  <Award className="mr-2 h-4 w-4" />
                  Claim Certificate
                </Button>
              )}

              <div className="space-y-4">
                {courseData.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterChange(chapter.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentChapter.id === chapter.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {chapter.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-1" />
                      )}
                      <div>
                        <p className="font-medium">{chapter.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {chapter.duration}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseWatchPage;
