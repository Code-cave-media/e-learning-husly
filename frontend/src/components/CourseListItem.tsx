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
    video?: string | File | null;
    pdf?: string | File | null;
  };
}

function ChapterDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ChapterDialogProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [duration, setDuration] = useState(initialData?.duration || 0);
  const [video, setVideo] = useState<File | null | string>(
    initialData?.video || null
  );
  const [pdf, setPdf] = useState<File | null | string>(
    initialData?.pdf || null
  );

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setDuration(initialData?.duration || 0);
      setVideo(null);
      setPdf(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      duration: Number(duration),
      video,
      pdf,
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
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
                  onChange={(e) => setVideo(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {video && typeof video === "object" && (
                  <span className="text-sm text-gray-500">{video.name}</span>
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
                  onChange={(e) => setPdf(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {pdf && typeof pdf === "object" && (
                  <span className="text-sm text-gray-500">{pdf.name}</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Add Chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CourseListItem({ course }: CourseListItemProps) {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedCourse, setEditedCourse] = useState<Course>(course);
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
      setEditedCourse(course);
    }
    setIsExpanded(!isExpanded);
  };

  const handleSaveChanges = () => {
    toast.success("Course updated successfully");
    setIsExpanded(false);
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
      video: chapter.video,
      pdf: chapter.pdf,
    });
    setIsChapterDialogOpen(true);
  };

  const handleChapterSubmit = async (chapterData: {
    title: string;
    description: string;
    duration: number;
    video: File | null;
    pdf: File | null;
  }) => {
    if (editingChapter) {
      setEditedCourse({
        ...editedCourse,
        chapters: editedCourse.chapters.map((c) =>
          c.id === editingChapter.id
            ? {
                ...c,
                ...chapterData,
                video: chapterData.video || c.video,
                pdf: chapterData.pdf || c.pdf,
              }
            : c
        ),
      });
      toast.success("Chapter updated successfully");
    } else {
      const newChapter = new FormData();
      newChapter.append("title", chapterData.title);
      newChapter.append("description", chapterData.description);
      newChapter.append("duration", chapterData.duration.toString());
      newChapter.append("video", chapterData.video);
      newChapter.append("pdf", chapterData.pdf);
      newChapter.append("course_id", course.id.toString());
      const response = await makeApiCall(
        "POST",
        API_ENDPOINT.CREATE_COURSE_CHAPTER,
        newChapter,
        "application/form-data",
        authToken,
        "courseChapterCreate"
      );
      if (response.status === 200) {
        setEditedCourse({
          ...editedCourse,
          chapters: [...editedCourse.chapters, response.data],
        });
        toast.success("Chapter added successfully");
      } else {
        toast.error("Failed to add chapter");
      }
    }
  };

  const handleDeleteChapter = (chapterId: number, chapterTitle: string) => {
    confirmDialog({
      message: `Are you sure you want to delete the chapter "${chapterTitle}"? This action cannot be undone.`,
      header: "Delete Chapter",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        setEditedCourse({
          ...editedCourse,
          chapters: editedCourse.chapters.filter((c) => c.id !== chapterId),
        });
        toast.success("Chapter deleted successfully");
      },
      reject: () => {
        // Do nothing on reject
      },
    });
  };
  const handleDeleteCourse = () => {
    confirmDialog({
      message: `Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`,
      header: "Delete Course",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        // Call the API to delete the course
        toast.success("Course deleted successfully");
      },
      reject: () => {
        // Do nothing on reject
      },
    });
  };
  return (
    <>
      <TableRow className="">
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
                          value={editedCourse.title}
                          onChange={(e) => {
                            setEditedCourse({
                              ...editedCourse,
                              title: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editedCourse.description}
                          onChange={(e) => {
                            setEditedCourse({
                              ...editedCourse,
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
                            value={editedCourse.price}
                            onChange={(e) => {
                              setEditedCourse({
                                ...editedCourse,
                                price: parseInt(e.target.value),
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Commission</Label>
                          <Input
                            type="number"
                            value={editedCourse.commission}
                            onChange={(e) => {
                              setEditedCourse({
                                ...editedCourse,
                                commission: parseInt(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editedCourse.visible}
                          onCheckedChange={(checked) => {
                            setEditedCourse({
                              ...editedCourse,
                              visible: checked,
                            });
                          }}
                        />
                        <Label>Visible</Label>
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
                            {editedCourse.thumbnail ? (
                              <>
                                <img
                                  src={
                                    typeof editedCourse.thumbnail === "string"
                                      ? editedCourse.thumbnail
                                      : URL.createObjectURL(
                                          editedCourse.thumbnail
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
                                          setEditedCourse({
                                            ...editedCourse,
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
                                  setEditedCourse({
                                    ...editedCourse,
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
                            {editedCourse.intro_video ? (
                              <>
                                <video
                                  src={
                                    typeof editedCourse.intro_video === "string"
                                      ? editedCourse.intro_video
                                      : URL.createObjectURL(
                                          editedCourse.intro_video
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
                                          setEditedCourse({
                                            ...editedCourse,
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
                                  setEditedCourse({
                                    ...editedCourse,
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
                          {editedCourse.landing_page?.thumbnail ? (
                            <>
                              <img
                                src={
                                  typeof editedCourse.landing_page.thumbnail ===
                                  "string"
                                    ? editedCourse.landing_page.thumbnail
                                    : URL.createObjectURL(
                                        editedCourse.landing_page.thumbnail
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
                                        setEditedCourse({
                                          ...editedCourse,
                                          landing_page: {
                                            ...editedCourse.landing_page,
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
                                setEditedCourse({
                                  ...editedCourse,
                                  landing_page: {
                                    ...editedCourse.landing_page,
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
                        value={editedCourse.landing_page?.superHeading}
                        onChange={(e) => {
                          setEditedCourse({
                            ...editedCourse,
                            landing_page: {
                              ...editedCourse.landing_page,
                              superHeading: e.target.value,
                            },
                          });
                        }}
                        placeholder="Enter super heading"
                      />
                    </div>
                    <div>
                      <Label>Main Heading</Label>
                      <Input
                        value={editedCourse.landing_page?.mainHeading}
                        onChange={(e) => {
                          setEditedCourse({
                            ...editedCourse,
                            landing_page: {
                              ...editedCourse?.landing_page,
                              mainHeading: e.target.value,
                            },
                          });
                        }}
                        placeholder="Enter main heading"
                      />
                    </div>
                    <div>
                      <Label>Sub Heading</Label>
                      <Input
                        value={editedCourse.landing_page?.subHeading}
                        onChange={(e) => {
                          setEditedCourse({
                            ...editedCourse,
                            landing_page: {
                              ...editedCourse?.landing_page,
                              subHeading: e.target.value,
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
                        value={editedCourse?.landing_page?.highlightWords}
                        onChange={(e) => {
                          setEditedCourse({
                            ...editedCourse,
                            landing_page: {
                              ...editedCourse?.landing_page,
                              highlightWords: e.target.value,
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
                  <Button onClick={handleSaveChanges} className="gap-2">
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
                    {editedCourse.chapters.map((chapter) => (
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
                            onClick={() =>
                              handleDeleteChapter(chapter.id, chapter.title)
                            }
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
      />
    </>
  );
}
