import { useEffect, useState } from "react";
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
  Trophy,
  AlertCircle,
} from "lucide-react";
import useDownloader from "react-use-downloader";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Loading } from "@/components/ui/loading";

interface Chapter {
  id: number;
  course_id: number;
  video: string;
  title: string;
  description: string;
  duration: string;
  pdf: string;
  completed: boolean;
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  price: number;
  commission: number;
  visible: boolean;
  thumbnail: string;
  chapters: Chapter[];
  course_progress: {
    id: number;
    course_id: number;
    user_id: number;
    completed: boolean;
    chapters: number[];
  };
}

const CourseWatchPage = () => {
  const { fetchType, fetching, isFetched, makeApiCall } = useAPICall();
  const { courseId, chapterId } = useParams();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const { authToken } = useAuth();
  const [showCompletion, setShowCompletion] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.GET_COURSE_WATCH_PAGE(courseId),
        null,
        "application/json",
        authToken,
        "getCourseWatchPage"
      );
      if (response.status === 200) {
        // Ensure first chapter is marked as completed
        const data = response.data;

        setCourseData(data);
        const initialChapter =
          data.chapters.find(
            (chapter: Chapter) => chapter.id === Number(chapterId)
          ) || data.chapters[0];
        setCurrentChapter(initialChapter);
      }
    };
    fetchData();
  }, [courseId]);

  const handleChapterChange = (chapterId: number) => {
    const chapter = courseData?.chapters.find((c) => c.id === chapterId);
    if (chapter) {
      setCurrentChapter(chapter);
      // If it's the first chapter, ensure it's marked as completed
      if (chapterId === courseData?.chapters[0].id && courseData) {
        if (!courseData.course_progress.chapters.includes(chapterId)) {
          setCourseData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              course_progress: {
                ...prev.course_progress,
                chapters: [...prev.course_progress.chapters, chapterId],
              },
            };
          });
        }
      }
    }
  };

  const handleNextChapter = () => {
    if (!courseData || !currentChapter) return;

    const currentIndex = courseData.chapters.findIndex(
      (c) => c.id === currentChapter.id
    );

    if (currentIndex < courseData.chapters.length - 1) {
      handleChapterChange(courseData.chapters[currentIndex + 1].id);
    }
  };

  const handlePreviousChapter = () => {
    if (!courseData || !currentChapter) return;

    const currentIndex = courseData.chapters.findIndex(
      (c) => c.id === currentChapter.id
    );
    if (currentIndex > 0) {
      handleChapterChange(courseData.chapters[currentIndex - 1].id);
    }
  };

  const handleVideoTimeUpdate = async () => {
    if (!videoRef || !courseData || !currentChapter || currentChapter.completed)
      return;

    const duration = videoRef.duration;
    const currentTime = videoRef.currentTime;
    // Check if we're in the last 5 seconds
    if (duration - currentTime <= 2 && !currentChapter.completed) {
      const response = await makeApiCall(
        "POST",
        API_ENDPOINT.COURSE_CHAPTER_COMPLETE(currentChapter.id.toString()),
        {},
        "application/json",
        authToken
      );
      if (response.status === 200) {
        setCourseData((prev) => {
          if (!prev) return prev;
          const updatedChapters = prev.chapters.map((chapter) =>
            chapter.id === currentChapter.id
              ? { ...chapter, completed: true }
              : chapter
          );

          return {
            ...prev,
            chapters: updatedChapters,
          };
        });

        setCourseData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            course_progress: {
              ...prev.course_progress,
              chapters: [
                ...prev.course_progress.chapters,
                response.data.course_chapter_completion,
              ],
            },
          };
        });
        if (response.data.course_completed) {
          console.log("enter");
          setShowCompletion(true);
          setCourseData((prev) => {
            return {
              ...prev,
              course_progress: { ...prev.course_progress, completed: true },
            };
          });
        }
      }
    }
  };

  const progress = courseData
    ? Math.min(
        (courseData.course_progress.chapters.length /
          courseData.chapters.length) *
          100,
        100
      )
    : 0;
  if (fetching && fetchType == "getCourseWatchPage") {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (isFetched && !courseData) {
    return (
      <div className="container px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-2xl font-bold">Course Not Found</h2>
              <p className="text-muted-foreground">
                This course is either not visible or doesn't exist.
              </p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courseData || !currentChapter) {
    return null;
  }

  return (
    <div className="container px-4 py-8">
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Course Completed!</h2>
            <p className="text-muted-foreground mb-4">
              Congratulations on completing {courseData.title}!
            </p>
            <Button onClick={() => setShowCompletion(false)}>Continue</Button>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={setVideoRef}
                  src={currentChapter.video}
                  controls
                  className="w-full h-full"
                  poster={courseData.thumbnail}
                  onTimeUpdate={handleVideoTimeUpdate}
                />
              </div>
              <div className="mt-4">
                <h2 className="text-2xl font-bold">{currentChapter.title}</h2>
                <p className="text-md text-muted-foreground mt-2">
                  {currentChapter.description}
                </p>
                {currentChapter.pdf && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => window.open(currentChapter.pdf, "_blank")}
                      className="gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-file-text"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" x2="8" y1="13" y2="13" />
                        <line x1="16" x2="8" y1="17" y2="17" />
                        <line x1="10" x2="8" y1="9" y2="9" />
                      </svg>
                      Download PDF
                    </Button>
                  </div>
                )}
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
                          {chapter.duration} min
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
