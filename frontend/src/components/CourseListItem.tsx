/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { Course } from "@/types/course";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { TableCell, TableRow } from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
interface CourseListItemProps {
  course: Course;
  setCourses: (courses: Course[] | ((prev: Course[]) => Course[])) => void;
}

interface ChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chapter: {
    title: string;
    description: string;
    duration: number;
    video: string | File | null;
    pdf: string | File | null;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    duration: number;
    video: string | File | null;
    pdf: string | File | null;
  };
  loading: boolean;
}

function ChapterDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}: ChapterDialogProps) {
  const [formData, setFormData] = useState<ChapterDialogProps["initialData"]>(
    initialData || {
      description: "",
      duration: 0,
      pdf: null,
      title: "",
      video: null,
    }
  );

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        duration: initialData.duration || 0,
        video: initialData.video || null,
        pdf: initialData.pdf || null,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.video ||
      !formData.title ||
      !formData.description ||
      !formData.duration
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    onSubmit(formData);
    // Reset form data after submission
    setFormData({
      title: "",
      description: "",
      duration: 0,
      video: null,
      pdf: null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Chapter" : "Add New Chapter"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: Number(e.target.value),
                }))
              }
              required
              min={0}
            />
          </div>
          <div>
            <Label>Video</Label>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      video: e.target.files?.[0] || null,
                    }))
                  }
                  className="flex-1"
                />
                {formData.video && typeof formData.video === "object" && (
                  <span className="text-sm text-gray-500">
                    {formData.video.name}
                  </span>
                )}
                {formData.video && typeof formData.video === "string" && (
                  <span className="text-sm text-gray-500">
                    {formData.video.split("/").pop()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label>PDF (Optional)</Label>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pdf: e.target.files?.[0] || null,
                    }))
                  }
                  className="flex-1"
                />
                {formData.pdf && typeof formData.pdf === "object" && (
                  <span className="text-sm text-gray-500">
                    {formData.pdf.name}
                  </span>
                )}
                {formData.pdf && typeof formData.pdf === "string" && (
                  <span className="text-sm text-gray-500">
                    {formData.pdf.split("/").pop()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              {initialData ? "Save Changes" : "Add Chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CourseListItem({ course, setCourses }: CourseListItemProps) {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course>(course);
  const { makeApiCall, fetchType, fetching } = useAPICall();
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<
    Course["chapters"][0] | null
  >(null);
  const handleView = () => {
    navigate(`/landing/course/${course.id}`);
  };
  const handleExpand = () => {
    if (!isExpanded) {
      setEditingCourse(course);
    }
    setIsExpanded(!isExpanded);
  };
  const handleSaveChanges = async () => {
    if (
      !editingCourse.title ||
      !editingCourse.description ||
      !editingCourse.price ||
      !editingCourse.commission ||
      !editingCourse.thumbnail ||
      !editingCourse.intro_video
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    const formData = new FormData();
    formData.append("title", editingCourse.title);
    formData.append("description", editingCourse.description);
    formData.append("price", editingCourse.price.toString());
    formData.append("commission", editingCourse.commission.toString());
    formData.append("visible", editingCourse.visible.toString());
    if (editingCourse.thumbnail instanceof File) {
      formData.append("thumbnail", editingCourse.thumbnail);
    }
    if (editingCourse.intro_video instanceof File) {
      formData.append("intro_video", editingCourse.intro_video);
    }
    console.log(editingCourse);
    formData.append("is_featured", editingCourse.is_featured.toString());
    formData.append("is_new", editingCourse.is_new.toString());
    formData.append("main_heading", editingCourse.landing_page?.main_heading);
    formData.append("sub_heading", editingCourse.landing_page?.sub_heading);
    formData.append("top_heading", editingCourse.landing_page?.top_heading);
    formData.append(
      "highlight_words",
      editingCourse.landing_page?.highlight_words
    );
    if (editingCourse.landing_page?.thumbnail instanceof File) {
      formData.append(
        "landing_thumbnail",
        editingCourse.landing_page?.thumbnail
      );
    }
    const response = await makeApiCall(
      "PUT",
      API_ENDPOINT.UPDATE_COURSE(editingCourse.id),
      formData,
      "application/form-data",
      authToken,
      "updateCourse"
    );
    if (response.status === 200) {
      toast.success("Course updated successfully");
      setCourses((prev: Course[]) =>
        prev.map((item: any) =>
          item.id === editingCourse.id ? response.data : item
        )
      );
      setIsExpanded(false);
    } else {
      toast.error("Failed to update course");
    }
  };
  const handleAddChapter = () => {
    setEditingChapter(null);
    setIsChapterDialogOpen(true);
  };
  const handleEditChapter = (chapter: Course["chapters"][0]) => {
    setEditingChapter({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      duration: chapter.duration,
      video: chapter.video || null,
      pdf: chapter.pdf || null,
    });
    setIsChapterDialogOpen(true);
  };
  const handleChapterSubmit = async (chapterData: {
    title: string;
    description: string;
    duration: number;
    video: File | string;
    pdf: File | null | string;
  }) => {
    if (editingChapter) {
      const updatedCourse = new FormData();
      if (chapterData.video instanceof File) {
        updatedCourse.append("video", chapterData.video);
      }
      if (chapterData.pdf instanceof File) {
        updatedCourse.append("pdf", chapterData.pdf);
      }
      updatedCourse.append("title", chapterData.title);
      updatedCourse.append("description", chapterData.description);
      updatedCourse.append("duration", chapterData.duration.toString());
      const response = await makeApiCall(
        "PUT",
        API_ENDPOINT.UPDATE_COURSE_CHAPTER(editingChapter.id),
        updatedCourse,
        "application/form-data",
        authToken,
        "updateCourseChapter"
      );
      if (response.status === 200) {
        setCourses((prev: Course[]) =>
          prev.map((item: any) =>
            item.id !== course.id
              ? item
              : {
                  ...item,
                  chapters: item.chapters.map((c: any) =>
                    c.id !== editingChapter.id
                      ? c
                      : {
                          ...c,
                          ...chapterData,
                        }
                  ),
                }
          )
        );
        setEditingCourse({
          ...editingCourse,
          chapters: editingCourse.chapters.map((c) =>
            c.id === editingChapter.id
              ? {
                  ...c,
                  ...chapterData,
                }
              : c
          ),
        });
        toast.success("Chapter updated successfully");
        setEditingChapter(null);
      } else {
        toast.error("Failed to update chapter");
        setIsChapterDialogOpen(false);
        setEditingChapter(null);
      }
    } else {
      const newChapter = new FormData();
      if (chapterData.video instanceof File) {
        newChapter.append("video", chapterData.video);
      } else if (typeof chapterData.video === "string") {
        newChapter.append("video", chapterData.video);
      }
      if (chapterData.pdf instanceof File) {
        newChapter.append("pdf", chapterData.pdf);
      } else if (typeof chapterData.pdf === "string") {
        newChapter.append("pdf", chapterData.pdf);
      }
      newChapter.append("title", chapterData.title);
      newChapter.append("description", chapterData.description);
      newChapter.append("duration", chapterData.duration.toString());
      newChapter.append("course_id", course.id.toString());
      const response = await makeApiCall(
        "POST",
        API_ENDPOINT.CREATE_COURSE_CHAPTER,
        newChapter,
        "application/form-data",
        authToken,
        "createCourseChapter"
      );
      if (response.status === 200) {
        setEditingCourse({
          ...editingCourse,
          chapters: [...editingCourse.chapters, response.data],
        });
        setEditingChapter(null);
        toast.success("Chapter added successfully");
      } else {
        toast.error("Failed to add chapter");
      }
    }
  };
  const handleDeleteChapter = (chapterId: number) => {
    confirmDialog({
      message: `Are you sure you want to delete the chapter? This action cannot be undone.`,
      header: "Delete Chapter",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        deleteCourseChapter(chapterId);
      },
      reject: () => {
        // Do nothing on reject
      },
    });
  };
  const deleteCourseChapter = async (chapterId: number) => {
    const response = await makeApiCall(
      "DELETE",
      API_ENDPOINT.DELETE_COURSE_CHAPTER(chapterId),
      null,
      "application/json",
      authToken,
      "deleteCourse"
    );
    if (response.status === 200) {
      setCourses((prev: Course[]) =>
        prev.map((item: any) =>
          item.id !== course.id
            ? item
            : {
                ...item,
                chapters: item.chapters.filter((c: any) => c.id !== chapterId),
              }
        )
      );
      setEditingCourse({
        ...editingCourse,
        chapters: editingCourse.chapters.filter((c) => c.id !== chapterId),
      });
      toast.success("Chapter deleted successfully");
    } else {
      toast.error("Failed to delete chapter");
    }
  };
  const handleDeleteCourse = () => {
    confirmDialog({
      message: `Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`,
      header: "Delete Course",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        const response = await makeApiCall(
          "DELETE",
          API_ENDPOINT.DELETE_COURSE(course.id),
          null,
          "application/json",
          authToken,
          "deleteCourse"
        );
        if (response.status === 200) {
          toast.success("Course deleted successfully");
          setCourses((prev: Course[]) =>
            prev.filter((item: Course) => item.id !== course.id)
          );
        } else {
          toast.error("Failed to delete course");
        }
      },
    });
  };
  return (
    <>
      <TableRow className="">
        <TableCell className="">{course.id}</TableCell>
        <TableCell className="">
          <img
            src={course.thumbnail as string}
            alt={course.title}
            className="w-28 h-16 rounded object-cover"
          />
        </TableCell>
        <TableCell className="">{course.title}</TableCell>
        <TableCell className="">{formatCurrency(course.price)}</TableCell>
        <TableCell className="">{formatCurrency(course.commission)}</TableCell>
        <TableCell className="">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              course.visible
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {course.visible ? "Visible" : "Hidden"}
          </span>
        </TableCell>
        <TableCell className="">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExpand}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteCourse()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <div className="p-4 bg-gray-50 border-t">
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* Course Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Course Details</h3>
                    <div className="space-y-2">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingCourse.title}
                          onChange={(e) => {
                            setEditingCourse({
                              ...editingCourse,
                              title: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingCourse.description}
                          onChange={(e) => {
                            setEditingCourse({
                              ...editingCourse,
                              description: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            value={editingCourse.price}
                            onChange={(e) => {
                              setEditingCourse({
                                ...editingCourse,
                                price: parseInt(e.target.value),
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Commission</Label>
                          <Input
                            type="number"
                            value={editingCourse.commission}
                            onChange={(e) => {
                              setEditingCourse({
                                ...editingCourse,
                                commission: parseInt(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingCourse.visible}
                          onCheckedChange={(checked) => {
                            setEditingCourse({
                              ...editingCourse,
                              visible: checked,
                            });
                          }}
                        />
                        <Label>Visible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingCourse.is_featured}
                          onCheckedChange={(checked) => {
                            setEditingCourse({
                              ...editingCourse,
                              is_featured: checked,
                            });
                          }}
                        />
                        <Label>Featured Course</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingCourse.is_new}
                          onCheckedChange={(checked) => {
                            setEditingCourse({
                              ...editingCourse,
                              is_new: checked,
                            });
                          }}
                        />
                        <Label>New Course</Label>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Media</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Thumbnail</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="relative w-64 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
                            {editingCourse.thumbnail ? (
                              <>
                                <img
                                  src={
                                    typeof editingCourse.thumbnail === "string"
                                      ? editingCourse.thumbnail
                                      : URL.createObjectURL(
                                          editingCourse.thumbnail
                                        )
                                  }
                                  alt="Course thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-white"
                                    onClick={() => {
                                      const input =
                                        document.createElement("input");
                                      input.type = "file";
                                      input.accept = "image/*";
                                      input.onchange = (e) => {
                                        const file = (
                                          e.target as HTMLInputElement
                                        ).files?.[0];
                                        if (file) {
                                          setEditingCourse({
                                            ...editingCourse,
                                            thumbnail: file,
                                          });
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    Change
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-primary/50 transition-colors">
                                <svg
                                  className="w-8 h-8 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-xs text-center px-2">
                                  Click to upload thumbnail
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setEditingCourse({
                                    ...editingCourse,
                                    thumbnail: file,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">
                              Recommended size: 1280x720 pixels (16:9)
                            </p>
                            <p className="text-sm text-gray-500">
                              Max file size: 2MB
                            </p>
                            <p className="text-sm text-gray-500">
                              Supported formats: JPG, PNG, WebP
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Intro Video</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="relative w-64 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors bg-gray-100">
                            {editingCourse.intro_video ? (
                              <>
                                <video
                                  src={
                                    typeof editingCourse.intro_video ===
                                    "string"
                                      ? editingCourse.intro_video
                                      : URL.createObjectURL(
                                          editingCourse.intro_video
                                        )
                                  }
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-white"
                                    onClick={() => {
                                      const input =
                                        document.createElement("input");
                                      input.type = "file";
                                      input.accept = "video/*";
                                      input.onchange = (e) => {
                                        const file = (
                                          e.target as HTMLInputElement
                                        ).files?.[0];
                                        if (file) {
                                          setEditingCourse({
                                            ...editingCourse,
                                            intro_video: file,
                                          });
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    Change
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-primary/50 transition-colors">
                                <svg
                                  className="w-8 h-8 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-xs text-center px-2">
                                  Click to upload video
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="video/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setEditingCourse({
                                    ...editingCourse,
                                    intro_video: file,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">
                              Recommended resolution: 1920x1080 (16:9)
                            </p>
                            <p className="text-sm text-gray-500">
                              Max file size: 100MB
                            </p>
                            <p className="text-sm text-gray-500">
                              Supported formats: MP4, WebM, MOV
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Landing Page Details */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2">Landing Page Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Landing Page Thumbnail</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="relative w-64 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
                          {editingCourse.landing_page?.thumbnail ? (
                            <>
                              <img
                                src={
                                  typeof editingCourse.landing_page
                                    .thumbnail === "string"
                                    ? editingCourse.landing_page.thumbnail
                                    : URL.createObjectURL(
                                        editingCourse.landing_page.thumbnail
                                      )
                                }
                                alt="Landing page thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-white"
                                  onClick={() => {
                                    const input =
                                      document.createElement("input");
                                    input.type = "file";
                                    input.accept = "image/*";
                                    input.onchange = (e) => {
                                      const file = (
                                        e.target as HTMLInputElement
                                      ).files?.[0];
                                      if (file) {
                                        setEditingCourse({
                                          ...editingCourse,
                                          landing_page: {
                                            ...editingCourse.landing_page,
                                            thumbnail: file,
                                          },
                                        });
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  Change
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-primary/50 transition-colors">
                              <svg
                                className="w-8 h-8 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-xs text-center px-2">
                                Click to upload thumbnail
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditingCourse({
                                  ...editingCourse,
                                  landing_page: {
                                    ...editingCourse.landing_page,
                                    thumbnail: file,
                                  },
                                });
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">
                            Recommended size: 1280x720 pixels (16:9)
                          </p>
                          <p className="text-sm text-gray-500">
                            Max file size: 2MB
                          </p>
                          <p className="text-sm text-gray-500">
                            Supported formats: JPG, PNG, WebP
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Super Heading</Label>
                      <Input
                        value={editingCourse.landing_page?.top_heading}
                        onChange={(e) => {
                          setEditingCourse({
                            ...editingCourse,
                            landing_page: {
                              ...editingCourse.landing_page,
                              top_heading: e.target.value,
                            },
                          });
                        }}
                        placeholder="Enter super heading"
                      />
                    </div>
                    <div>
                      <Label>Main Heading</Label>
                      <Input
                        value={editingCourse.landing_page?.main_heading}
                        onChange={(e) => {
                          setEditingCourse({
                            ...editingCourse,
                            landing_page: {
                              ...editingCourse?.landing_page,
                              main_heading: e.target.value,
                            },
                          });
                        }}
                        placeholder="Enter main heading"
                      />
                    </div>
                    <div>
                      <Label>Sub Heading</Label>
                      <Input
                        value={editingCourse.landing_page?.sub_heading}
                        onChange={(e) => {
                          setEditingCourse({
                            ...editingCourse,
                            landing_page: {
                              ...editingCourse?.landing_page,
                              sub_heading: e.target.value,
                            },
                          });
                        }}
                        placeholder="Enter sub heading"
                      />
                    </div>
                    <div>
                      <Label>
                        Highlight Words of Main Heading (comma separated)
                      </Label>
                      <Input
                        value={editingCourse?.landing_page?.highlight_words}
                        onChange={(e) => {
                          setEditingCourse({
                            ...editingCourse,
                            landing_page: {
                              ...editingCourse?.landing_page,
                              highlight_words: e.target.value,
                            },
                          });
                        }}
                        placeholder="Enter highlight words separated by commas"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    loading={fetching && fetchType == "updateCourse"}
                    onClick={handleSaveChanges}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>

                {/* Chapters Section */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Chapters</h3>
                    <Button onClick={handleAddChapter}>Add Chapter</Button>
                  </div>
                  <div className="space-y-4">
                    {editingCourse.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-medium">{chapter.title}</h4>
                          <p className="text-sm text-gray-500">
                            {chapter.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Duration: {chapter.duration} minutes
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditChapter(chapter)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteChapter(chapter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      <ChapterDialog
        isOpen={isChapterDialogOpen}
        onClose={() => {
          setIsChapterDialogOpen(false);
          setEditingChapter(null);
        }}
        onSubmit={handleChapterSubmit}
        initialData={editingChapter || undefined}
        loading={
          fetching &&
          (fetchType == "createCourseChapter" ||
            fetchType == "updateCourseChapter")
        }
      />
    </>
  );
}
