/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  FileText,
  Clock,
  PlayCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import RegistrationForm from "@/components/shared/RegistrationForm";
import { toast } from "sonner";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";

// Add Razorpay type to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Add course types and levels
const courseTypes = [
  "Digital Marketing",
  "Web Development",
  "Data Science",
  "Mobile Development",
  "UI/UX Design",
];

const courseLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Beginner to Advanced",
];

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
  const navigate = useNavigate();
  const affiliateId = searchParams.get("ref");
  const loggedUser = false;
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { fetching, makeApiCall } = useAPICall();
  const { isAuthenticated, isAdmin } = useAuth();
  const isAdminView = searchParams.get("admin") === "true" && isAdmin;

  const [course, setCourse] = useState<Course | null>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false);
  const [isLearningPointDialogOpen, setIsLearningPointDialogOpen] =
    useState(false);
  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({});
  const [newInstructor, setNewInstructor] = useState<Partial<Instructor>>({});
  const [newLearningPoint, setNewLearningPoint] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCourse, setEditedCourse] = useState<Course | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "chapter" | "learningPoint" | "thumbnail" | "video" | "course";
    id?: number;
  } | null>(null);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] =
    useState(false);
  const [editingLearningPointId, setEditingLearningPointId] = useState<
    number | null
  >(null);
  const [editingLearningPoint, setEditingLearningPoint] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingInstructorId, setEditingInstructorId] = useState<number | null>(
    null
  );
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null
  );

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

  useEffect(() => {
    if (course) {
      setEditedCourse(course);
    }
  }, [course]);

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Save changes
      setCourse(editedCourse);
      setIsEditMode(false);
      toast.success("Changes saved successfully");
    } else {
      setIsEditMode(true);
    }
  };

  const handleTextChange = (
    field: keyof Course,
    value: string | number | boolean
  ) => {
    if (editedCourse) {
      setEditedCourse({
        ...editedCourse,
        [field]: value,
      });
    }
  };

  const handleInstructorChange = (field: keyof Instructor, value: string) => {
    if (editedCourse) {
      setEditedCourse({
        ...editedCourse,
        instructor: {
          ...editedCourse.instructor,
          [field]: value,
        },
      });
    }
  };

  const handleDeleteItem = () => {
    if (!itemToDelete || !editedCourse) return;

    switch (itemToDelete.type) {
      case "chapter":
        setEditedCourse({
          ...editedCourse,
          chapters: editedCourse.chapters.filter(
            (c) => c.id !== itemToDelete.id
          ),
        });
        break;
      case "learningPoint":
        setEditedCourse({
          ...editedCourse,
          learning_points: editedCourse.learning_points.filter(
            (p) => p.id !== itemToDelete.id
          ),
        });
        break;
      case "thumbnail":
        setEditedCourse({
          ...editedCourse,
          thumbnail: null,
          thumbnailUrl: "",
        });
        break;
      case "video":
        if (itemToDelete.id) {
          setEditedCourse({
            ...editedCourse,
            chapters: editedCourse.chapters.map((c) =>
              c.id === itemToDelete.id ? { ...c, video: null, videoUrl: "" } : c
            ),
          });
        }
        break;
    }

    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
    toast.success("Item deleted successfully");
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedCourse) {
      setEditedCourse({
        ...editedCourse,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleIntroVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedCourse) {
      setEditedCourse({
        ...editedCourse,
        introVideo: file,
        introVideoUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleChapterVideoChange = (
    chapterId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && editedCourse) {
      setEditedCourse({
        ...editedCourse,
        chapters: editedCourse.chapters.map((c) =>
          c.id === chapterId
            ? { ...c, video: file, videoUrl: URL.createObjectURL(file) }
            : c
        ),
      });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewChapter({
        ...newChapter,
        video: file,
        videoUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleAddChapter = () => {
    if (!newChapter.title || !newChapter.video) {
      toast.error("Please fill in all required fields and upload a video");
      return;
    }

    const chapter: Chapter = {
      id: (course?.chapters.length || 0) + 1,
      title: newChapter.title,
      description: newChapter.description || "",
      video: newChapter.video,
      videoUrl: newChapter.videoUrl || "",
      duration: newChapter.duration || 0,
    };

    setCourse((prev) => ({
      ...prev!,
      chapters: [...(prev?.chapters || []), chapter],
    }));
    setIsChapterDialogOpen(false);
    setNewChapter({});
    toast.success("Chapter added successfully");
  };

  const handleUpdateInstructor = () => {
    if (!newInstructor.name || !newInstructor.position) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCourse((prev) => ({
      ...prev!,
      instructor: {
        id: prev?.instructor.id || 1,
        name: newInstructor.name,
        position: newInstructor.position,
        description: newInstructor.description || "",
        image_url: newInstructor.image_url || "",
      },
    }));
    setIsInstructorDialogOpen(false);
    setNewInstructor({});
    toast.success("Instructor updated successfully");
  };

  const handleAddLearningPoint = () => {
    if (!newLearningPoint.trim()) {
      toast.error("Please enter a learning point");
      return;
    }

    setCourse((prev) => ({
      ...prev!,
      learning_points: [
        ...(prev?.learning_points || []),
        { id: (prev?.learning_points.length || 0) + 1, text: newLearningPoint },
      ],
    }));
    setNewLearningPoint("");
    toast.success("Learning point added successfully");
  };

  const handleDeleteLearningPoint = (pointId: number) => {
    setCourse((prev) => ({
      ...prev!,
      learning_points:
        prev?.learning_points.filter((p) => p.id !== pointId) || [],
    }));
    toast.success("Learning point deleted successfully");
  };

  const handleDeleteCourse = () => {
    // Here you would typically make an API call to delete the course
    toast.success("Course deleted successfully");
    navigate("/admin/courses");
  };

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
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Course
              </Button>
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

              {isAdminView && (
                <div className="mt-4 flex gap-4 justify-end">
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <Label
                      htmlFor="thumbnail-upload"
                      className="cursor-pointer bg-primary text-white px-4 py-2 rounded inline-flex items-center gap-2"
                    >
                      {course.thumbnailUrl
                        ? "Change Thumbnail"
                        : "Add Thumbnail"}
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleIntroVideoChange}
                      className="hidden"
                      id="intro-video-upload"
                    />
                    <Label
                      htmlFor="intro-video-upload"
                      className="cursor-pointer bg-primary text-white px-4 py-2 rounded inline-flex items-center gap-2"
                    >
                      {course.introVideoUrl ? "Change Intro" : "Add Intro"}
                    </Label>
                  </div>
                </div>
              )}
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">What You'll Learn</h2>
                {isAdminView && (
                  <div className="flex gap-2">
                    <Input
                      value={newLearningPoint}
                      onChange={(e) => setNewLearningPoint(e.target.value)}
                      placeholder="Add a learning point"
                    />
                    <Button onClick={handleAddLearningPoint}>Add</Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learning_points.map((point) => (
                  <div key={point.id} className="flex items-start gap-2 group">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    {isAdminView && editingLearningPointId === point.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingLearningPoint}
                          onChange={(e) =>
                            setEditingLearningPoint(e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (editedCourse) {
                              setEditedCourse({
                                ...editedCourse,
                                learning_points:
                                  editedCourse.learning_points.map((p) =>
                                    p.id === point.id
                                      ? { ...p, text: editingLearningPoint }
                                      : p
                                  ),
                              });
                              setEditingLearningPointId(null);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLearningPointId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1">{point.text}</span>
                        {isAdminView && (
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingLearningPointId(point.id);
                                setEditingLearningPoint(point.text);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({
                                  type: "learningPoint",
                                  id: point.id,
                                });
                                setIsDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Course Modules */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Course Modules</h2>
                {isAdminView && (
                  <Button onClick={() => setIsChapterDialogOpen(true)}>
                    Add Chapter
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <Card key={chapter.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {isAdminView && editingChapterId === chapter.id ? (
                          <div className="space-y-4">
                            <Input
                              value={editingChapter.title}
                              onChange={(e) =>
                                setEditingChapter({
                                  ...editingChapter,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Chapter title"
                            />
                            <Textarea
                              value={editingChapter.description}
                              onChange={(e) =>
                                setEditingChapter({
                                  ...editingChapter,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Chapter description"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={editingChapter.duration}
                                onChange={(e) =>
                                  setEditingChapter({
                                    ...editingChapter,
                                    duration: parseInt(e.target.value),
                                  })
                                }
                                placeholder="Duration (minutes)"
                                className="w-32"
                              />
                              <Button
                                onClick={() => {
                                  if (editedCourse) {
                                    setEditedCourse({
                                      ...editedCourse,
                                      chapters: editedCourse.chapters.map((c) =>
                                        c.id === chapter.id ? editingChapter : c
                                      ),
                                    });
                                    setEditingChapterId(null);
                                  }
                                }}
                              >
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingChapterId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold">{chapter.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {chapter.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-muted-foreground">
                                {chapter.duration} minutes
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      {isAdminView && (
                        <div className="flex gap-2 ml-4">
                          {editingChapterId !== chapter.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingChapterId(chapter.id);
                                  setEditingChapter(chapter);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemToDelete({
                                    type: "chapter",
                                    id: chapter.id,
                                  });
                                  setIsDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) =>
                              handleChapterVideoChange(chapter.id, e)
                            }
                            className="hidden"
                            id={`video-upload-${chapter.id}`}
                          />
                          <Label
                            htmlFor={`video-upload-${chapter.id}`}
                            className="cursor-pointer bg-primary text-white px-4 py-2 rounded"
                          >
                            {chapter.videoUrl ? "Change Video" : "Add Video"}
                          </Label>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">About the Instructor</h2>
                {isAdminView &&
                  editingInstructorId !== course.instructor.id && (
                    <Button
                      onClick={() => {
                        setEditingInstructorId(course.instructor.id);
                        setEditingInstructor(course.instructor);
                      }}
                    >
                      Edit Instructor
                    </Button>
                  )}
              </div>
              <div className="space-y-2">
                {isAdminView && editingInstructorId === course.instructor.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingInstructor.name}
                      onChange={(e) =>
                        setEditingInstructor({
                          ...editingInstructor,
                          name: e.target.value,
                        })
                      }
                      placeholder="Instructor name"
                    />
                    <Input
                      value={editingInstructor.position}
                      onChange={(e) =>
                        setEditingInstructor({
                          ...editingInstructor,
                          position: e.target.value,
                        })
                      }
                      placeholder="Instructor position"
                    />
                    <Textarea
                      value={editingInstructor.description}
                      onChange={(e) =>
                        setEditingInstructor({
                          ...editingInstructor,
                          description: e.target.value,
                        })
                      }
                      placeholder="Instructor description"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (editedCourse) {
                            setEditedCourse({
                              ...editedCourse,
                              instructor: editingInstructor,
                            });
                            setEditingInstructorId(null);
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingInstructorId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold">
                      {course.instructor.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {course.instructor.position}
                    </p>
                    <p>{course.instructor.description}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          {!isAdminView && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {!loggedUser ? (
                  <RegistrationForm
                    type="course"
                    itemId={id || ""}
                    price={course.price}
                    affiliateId={affiliateId || undefined}
                    onSuccess={handlePurchaseSuccess}
                  />
                ) : (
                  <Card className="p-6 space-y-4">
                    <div className="space-y-2">
                      {isEditMode ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Course Type</Label>
                              <Input
                                value={editedCourse?.type}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <Label>Course Level</Label>
                              <Input
                                value={editedCourse?.level}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Total Hours</Label>
                              <Input
                                type="number"
                                value={editedCourse?.total_hours}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <Label>Price</Label>
                              <Input
                                type="number"
                                value={editedCourse?.price}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Commission (%)</Label>
                            <Input
                              type="number"
                              value={editedCourse?.commission}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch checked={editedCourse?.visible} disabled />
                            <Label>Visible</Label>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold">
                            {formatCurrency(course.price)}
                          </h3>
                          <p className="text-muted-foreground line-through">
                            {formatCurrency(course.originalPrice)}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="space-y-4">
                      {!course.visible ? (
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
                          <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                          >
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
                          <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                          >
                            Create Affiliate Link
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newChapter.title || ""}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
                placeholder="Enter chapter title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newChapter.description || ""}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, description: e.target.value })
                }
                placeholder="Enter chapter description"
              />
            </div>
            <div>
              <Label>Video</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="cursor-pointer"
              />
              {newChapter.videoUrl && (
                <video
                  src={newChapter.videoUrl}
                  className="mt-2 w-full max-h-48 object-cover rounded"
                  controls
                />
              )}
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={newChapter.duration || ""}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    duration: parseInt(e.target.value),
                  })
                }
                placeholder="Enter duration in minutes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChapterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddChapter}>Add Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Instructor Dialog */}
      <Dialog
        open={isInstructorDialogOpen}
        onOpenChange={setIsInstructorDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newInstructor.name || ""}
                onChange={(e) =>
                  setNewInstructor({ ...newInstructor, name: e.target.value })
                }
                placeholder="Enter instructor name"
              />
            </div>
            <div>
              <Label>Position</Label>
              <Input
                value={newInstructor.position || ""}
                onChange={(e) =>
                  setNewInstructor({
                    ...newInstructor,
                    position: e.target.value,
                  })
                }
                placeholder="Enter instructor position"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newInstructor.description || ""}
                onChange={(e) =>
                  setNewInstructor({
                    ...newInstructor,
                    description: e.target.value,
                  })
                }
                placeholder="Enter instructor description"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={newInstructor.image_url || ""}
                onChange={(e) =>
                  setNewInstructor({
                    ...newInstructor,
                    image_url: e.target.value,
                  })
                }
                placeholder="Enter image URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInstructorDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateInstructor}>Update Instructor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog
        open={isDeleteCourseDialogOpen}
        onOpenChange={setIsDeleteCourseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this course? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteCourseDialogOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
