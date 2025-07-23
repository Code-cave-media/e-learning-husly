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
  intro_video: string;
  completed: boolean;
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
        const data = response.data;
        console.log(data);

        // Create intro chapter from intro_video if it exists
        let introChapter: Chapter | null = null;
        if (data.intro_video) {
          introChapter = {
            id: 0, // Use 0 as special ID for intro chapter
            course_id: data.id,
            video: data.intro_video,
            title: "Introduction",
            description: "Course introduction and overview",
            duration: "5", // Default duration
            pdf: "",
            completed: true, // Always completed
          };
        }

        // Combine intro chapter with existing chapters
        const allChapters = introChapter
          ? [introChapter, ...data.chapters]
          : data.chapters;

        const courseDataWithIntro = {
          ...data,
          chapters: allChapters,
        };

        setCourseData(courseDataWithIntro);

        // Set current chapter - prefer intro chapter if no specific chapter requested
        if (introChapter && (!chapterId || chapterId === "0")) {
          setCurrentChapter(introChapter);
        } else if (allChapters.length > 0) {
          const initialChapter =
            allChapters.find(
              (chapter: Chapter) => chapter.id === Number(chapterId)
            ) || allChapters[0];
          setCurrentChapter(initialChapter);
        } else {
          setCurrentChapter(null);
        }
      }
    };
    fetchData();
  }, [courseId]);

  const handleChapterChange = (chapterId: number) => {
    if (!courseData?.chapters || courseData.chapters.length === 0) return;

    const chapter = courseData.chapters.find((c) => c.id === chapterId);
    if (chapter) {
      setCurrentChapter(chapter);
      // Don't mark intro chapter (id: 0) as completed since it's always completed
      if (
        chapterId !== 0 &&
        chapterId === courseData.chapters[0].id &&
        courseData
      ) {
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
    if (
      !courseData?.chapters ||
      courseData.chapters.length === 0 ||
      !currentChapter
    )
      return;

    const currentIndex = courseData.chapters.findIndex(
      (c) => c.id === currentChapter.id
    );

    if (currentIndex < courseData.chapters.length - 1) {
      handleChapterChange(courseData.chapters[currentIndex + 1].id);
    }
  };

  const handlePreviousChapter = () => {
    if (
      !courseData?.chapters ||
      courseData.chapters.length === 0 ||
      !currentChapter
    )
      return;

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
    if (duration - currentTime <= 2 && !currentChapter.completed && !fetching) {
      // Don't mark intro chapter as completed via API since it's always completed
      if (currentChapter.id === 0) return;

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
          setCurrentChapter((prev) => ({ ...prev, completed: true }));
        }
      }
    }
  };

  const progress = courseData
    ? Math.min(
        courseData.chapters.length > 0
          ? ((courseData.course_progress.chapters.length +
              (courseData.chapters[0]?.id === 0 ? 1 : 0)) /
              courseData.chapters.length) *
              100
          : 0,
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
      <div className="primary-container px-2 py-4 sm:px-4 sm:py-8">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-destructive" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Course Not Found
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                This course is either not visible or haven't purchased yet.
              </p>
              <Button
                size="sm"
                className="sm:text-base"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courseData || !currentChapter) {
    return null;
  }

  // Check if there are no chapters
  if (courseData.chapters.length === 0) {
    return (
      <div className="primary-container px-2 py-4 sm:px-4 sm:py-8">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold">
                No Chapters Available
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                This course doesn't have any chapters yet. Please check back
                later.
              </p>
              <Button
                size="sm"
                className="sm:text-base"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="primary-container px-0 py-4 sm:px-4 sm:py-8">
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-4 sm:p-6 text-center mx-4">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Course Completed!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              Congratulations on completing {courseData.title}!
            </p>
            <Button
              size="sm"
              className="sm:text-base"
              onClick={() => setShowCompletion(false)}
            >
              Continue
            </Button>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
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
              <div className="mt-3 sm:mt-4">
                <h2 className="text-lg sm:text-2xl font-bold">
                  {currentChapter.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  {currentChapter.description}
                </p>
                {currentChapter.pdf && (
                  <div className="mt-3 sm:mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs sm:text-sm"
                      onClick={() => window.open(currentChapter.pdf, "_blank")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
              <div className="flex items-center justify-between mt-4 sm:mt-6 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={handlePreviousChapter}
                  disabled={courseData.chapters[0].id === currentChapter.id}
                >
                  <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={handleNextChapter}
                  disabled={
                    courseData.chapters[courseData.chapters.length - 1].id ===
                    currentChapter.id
                  }
                >
                  Next
                  <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chapters List Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Course Progress
                </h3>
                <Progress value={progress} className="h-2" />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}% Complete
                </p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                {courseData.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterChange(chapter.id)}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                      currentChapter.id === chapter.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {chapter.id === 0 ? (
                        <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 sm:mt-1" />
                      ) : chapter.completed ? (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 sm:mt-1" />
                      ) : (
                        <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 sm:mt-1" />
                      )}
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {chapter.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
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
