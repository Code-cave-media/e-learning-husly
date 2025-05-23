import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Clock,
  PlayCircle,
  Pencil,
  Trash2,
} from "lucide-react";
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

interface Chapter {
  id: number;
  title: string;
  description: string;
  pageNumber: number;
}

interface Author {
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

interface Ebook {
  id: number;
  type: string;
  title: string;
  description: string;
  numberOfPages: number;
  commission: number;
  price: number;
  thumbnail: File | null;
  thumbnailUrl: string;
  introVideo: File | null;
  introVideoUrl: string;
  ebookFile: File | null;
  ebookFileUrl: string;
  visible: boolean;
  chapters: Chapter[];
  author: Author;
  learning_points: LearningPoint[];
  originalPrice: number;
  isPurchased: boolean;
}

export default function EbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { fetching, makeApiCall } = useAPICall();
  const { isAuthenticated } = useAuth();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false);
  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({});
  const [newAuthor, setNewAuthor] = useState<Partial<Author>>({});
  const [newLearningPoint, setNewLearningPoint] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEbook, setEditedEbook] = useState<Ebook | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "chapter" | "learningPoint" | "thumbnail" | "ebook" | "ebook";
    id?: number;
  } | null>(null);
  const [isDeleteEbookDialogOpen, setIsDeleteEbookDialogOpen] = useState(false);
  const [editingLearningPointId, setEditingLearningPointId] = useState<
    number | null
  >(null);
  const [editingLearningPoint, setEditingLearningPoint] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingAuthorId, setEditingAuthorId] = useState<number | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  const handleEditModeToggle = () => {
    if (isEditMode) {
      setEbook(editedEbook);
      setIsEditMode(false);
      toast.success("Changes saved successfully");
    } else {
      setIsEditMode(true);
    }
  };

  const handleTextChange = (
    field: keyof Ebook,
    value: string | number | boolean
  ) => {
    if (editedEbook) {
      setEditedEbook({
        ...editedEbook,
        [field]: value,
      });
    }
  };

  const handleAuthorChange = (field: keyof Author, value: string) => {
    if (editedEbook) {
      setEditedEbook({
        ...editedEbook,
        author: {
          ...editedEbook.author,
          [field]: value,
        },
      });
    }
  };

  const handleDeleteItem = () => {
    if (!itemToDelete || !editedEbook) return;

    switch (itemToDelete.type) {
      case "chapter":
        setEditedEbook({
          ...editedEbook,
          chapters: editedEbook.chapters.filter(
            (c) => c.id !== itemToDelete.id
          ),
        });
        break;
      case "learningPoint":
        setEditedEbook({
          ...editedEbook,
          learning_points: editedEbook.learning_points.filter(
            (p) => p.id !== itemToDelete.id
          ),
        });
        break;
      case "thumbnail":
        setEditedEbook({
          ...editedEbook,
          thumbnail: null,
          thumbnailUrl: "",
        });
        break;
      case "ebook":
        setEditedEbook({
          ...editedEbook,
          ebookFile: null,
          ebookFileUrl: "",
        });
        break;
    }

    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
    toast.success("Item deleted successfully");
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedEbook) {
      setEditedEbook({
        ...editedEbook,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleIntroVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedEbook) {
      setEditedEbook({
        ...editedEbook,
        introVideo: file,
        introVideoUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleEbookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedEbook) {
      setEditedEbook({
        ...editedEbook,
        ebookFile: file,
        ebookFileUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleAddChapter = () => {
    if (!newChapter.title || !newChapter.pageNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    const chapter: Chapter = {
      id: (ebook?.chapters.length || 0) + 1,
      title: newChapter.title,
      description: newChapter.description || "",
      pageNumber: newChapter.pageNumber || 0,
    };

    setEbook((prev) => ({
      ...prev!,
      chapters: [...(prev?.chapters || []), chapter],
    }));
    setIsChapterDialogOpen(false);
    setNewChapter({});
    toast.success("Chapter added successfully");
  };

  const handleUpdateAuthor = () => {
    if (!newAuthor.name || !newAuthor.position) {
      toast.error("Please fill in all required fields");
      return;
    }

    setEbook((prev) => ({
      ...prev!,
      author: {
        id: prev?.author.id || 1,
        name: newAuthor.name,
        position: newAuthor.position,
        description: newAuthor.description || "",
        image_url: newAuthor.image_url || "",
      },
    }));
    setIsAuthorDialogOpen(false);
    setNewAuthor({});
    toast.success("Author updated successfully");
  };

  const handleAddLearningPoint = () => {
    if (!newLearningPoint.trim()) {
      toast.error("Please enter a learning point");
      return;
    }

    setEbook((prev) => ({
      ...prev!,
      learning_points: [
        ...(prev?.learning_points || []),
        { id: (prev?.learning_points.length || 0) + 1, text: newLearningPoint },
      ],
    }));
    setNewLearningPoint("");
    toast.success("Learning point added successfully");
  };

  const handleDeleteEbook = () => {
    toast.success("Ebook deleted successfully");
    navigate("/admin/ebooks");
  };

  // Dummy ebook data
  useEffect(() => {
    setEbook({
      id: 1,
      type: "Digital Marketing",
      title: "Digital Marketing Masterclass",
      description: "Learn digital marketing from scratch",
      numberOfPages: 250,
      commission: 10,
      price: 4999,
      thumbnail: null,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      introVideo: null,
      introVideoUrl:
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      ebookFile: null,
      ebookFileUrl: "",
      visible: true,
      chapters: [
        {
          id: 1,
          title: "Introduction to Digital Marketing",
          description:
            "Learn the fundamentals of digital marketing and its importance in today's business landscape.",
          pageNumber: 1,
        },
        {
          id: 2,
          title: "Search Engine Optimization (SEO)",
          description:
            "Master the art of optimizing your website for search engines and driving organic traffic.",
          pageNumber: 45,
        },
        {
          id: 3,
          title: "Social Media Marketing",
          description:
            "Create and execute effective social media strategies across different platforms.",
          pageNumber: 89,
        },
        {
          id: 4,
          title: "Content Marketing",
          description:
            "Learn how to create engaging content that resonates with your target audience.",
          pageNumber: 132,
        },
        {
          id: 5,
          title: "Email Marketing",
          description:
            "Build and manage email campaigns that convert subscribers into customers.",
          pageNumber: 175,
        },
      ],
      author: {
        id: 1,
        name: "John Doe",
        position: "Digital Marketing Expert",
        description:
          "10+ years of experience in digital marketing, specializing in SEO and social media strategy. Former marketing director at TechCorp and founder of DigitalGrowth Academy.",
        image_url: "https://example.com/author.jpg",
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
      originalPrice: 9999,
      isPurchased: false,
    });
  }, [id]);

  useEffect(() => {
    if (ebook) {
      setEditedEbook(ebook);
    }
  }, [ebook]);

  if (!ebook) {
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
                <Badge variant="outline">EBook</Badge>
                <Badge variant="secondary">{ebook.type}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{ebook.title}</h1>
              <p className="text-xl text-muted-foreground">
                {ebook.description}
              </p>
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>{ebook.numberOfPages} Pages</span>
                </div>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <BookOpen className="w-5 h-5 mr-2" />
                Read Ebook
              </Button>
            </div>
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
                {ebook.thumbnailUrl ? (
                  <video
                    className="w-full h-full object-cover"
                    poster={ebook.thumbnailUrl}
                    controls={isVideoPlaying}
                    onClick={() => setIsVideoPlaying(true)}
                    src={ebook.introVideoUrl}
                  >
                    <source src={ebook.introVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No media</span>
                  </div>
                )}
                {!isVideoPlaying && ebook.thumbnailUrl && (
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
                    {ebook.thumbnailUrl ? "Change Thumbnail" : "Add Thumbnail"}
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
                    {ebook.introVideoUrl ? "Change Intro" : "Add Intro"}
                  </Label>
                </div>
                <div>
                  <Input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={handleEbookFileChange}
                    className="hidden"
                    id="ebook-upload"
                  />
                  <Label
                    htmlFor="ebook-upload"
                    className="cursor-pointer bg-primary text-white px-4 py-2 rounded inline-flex items-center gap-2"
                  >
                    {ebook.ebookFileUrl ? "Change Ebook" : "Add Ebook"}
                  </Label>
                </div>
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
            {/* What's Inside */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">What's Inside</h2>
                <div className="flex gap-2">
                  <Input
                    value={newLearningPoint}
                    onChange={(e) => setNewLearningPoint(e.target.value)}
                    placeholder="Add a point"
                  />
                  <Button onClick={handleAddLearningPoint}>Add</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ebook.learning_points.map((point) => (
                  <div key={point.id} className="flex items-start gap-2 group">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    {editingLearningPointId === point.id ? (
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
                            if (editedEbook) {
                              setEditedEbook({
                                ...editedEbook,
                                learning_points:
                                  editedEbook.learning_points.map((p) =>
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Table of Contents */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Table of Contents</h2>
                <Button onClick={() => setIsChapterDialogOpen(true)}>
                  Add Table Content
                </Button>
              </div>
              <div className="space-y-4">
                {ebook.chapters.map((chapter) => (
                  <Card key={chapter.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {editingChapterId === chapter.id ? (
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
                                value={editingChapter.pageNumber}
                                onChange={(e) =>
                                  setEditingChapter({
                                    ...editingChapter,
                                    pageNumber: parseInt(e.target.value),
                                  })
                                }
                                placeholder="Page number"
                                className="w-32"
                              />
                              <Button
                                onClick={() => {
                                  if (editedEbook) {
                                    setEditedEbook({
                                      ...editedEbook,
                                      chapters: editedEbook.chapters.map((c) =>
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
                                Page {chapter.pageNumber}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* About the Author */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">About the Author</h2>
                {editingAuthorId !== ebook.author.id && (
                  <Button
                    onClick={() => {
                      setEditingAuthorId(ebook.author.id);
                      setEditingAuthor(ebook.author);
                    }}
                  >
                    Edit Author
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {editingAuthorId === ebook.author.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingAuthor.name}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          name: e.target.value,
                        })
                      }
                      placeholder="Author name"
                    />
                    <Input
                      value={editingAuthor.position}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          position: e.target.value,
                        })
                      }
                      placeholder="Author position"
                    />
                    <Textarea
                      value={editingAuthor.description}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          description: e.target.value,
                        })
                      }
                      placeholder="Author description"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (editedEbook) {
                            setEditedEbook({
                              ...editedEbook,
                              author: editingAuthor,
                            });
                            setEditingAuthorId(null);
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingAuthorId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold">
                      {ebook.author.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {ebook.author.position}
                    </p>
                    <p>{ebook.author.description}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ebook Settings */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  {isEditMode ? (
                    <>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editedEbook?.title}
                          onChange={(e) =>
                            handleTextChange("title", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editedEbook?.description}
                          onChange={(e) =>
                            handleTextChange("description", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Input
                          value={editedEbook?.type}
                          onChange={(e) =>
                            handleTextChange("type", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Number of Pages</Label>
                        <Input
                          type="number"
                          value={editedEbook?.numberOfPages}
                          onChange={(e) =>
                            handleTextChange(
                              "numberOfPages",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={editedEbook?.price}
                          onChange={(e) =>
                            handleTextChange("price", parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <Label>Commission (%)</Label>
                        <Input
                          type="number"
                          value={editedEbook?.commission}
                          onChange={(e) =>
                            handleTextChange(
                              "commission",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editedEbook?.visible}
                          onCheckedChange={(checked) =>
                            handleTextChange("visible", checked)
                          }
                        />
                        <Label>Visible</Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">
                        {formatCurrency(ebook.price)}
                      </h3>
                      <p className="text-muted-foreground line-through">
                        {formatCurrency(ebook.originalPrice)}
                      </p>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEditModeToggle}
                  >
                    {isEditMode ? "Save Changes" : "Edit Ebook"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    size="lg"
                    onClick={() => setIsDeleteEbookDialogOpen(true)}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Ebook
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table Content</DialogTitle>
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
              <Label>Page Number</Label>
              <Input
                type="number"
                value={newChapter.pageNumber || ""}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    pageNumber: parseInt(e.target.value),
                  })
                }
                placeholder="Enter page number"
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
            <Button onClick={handleAddChapter}>Add Table Content</Button>
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

      {/* Delete Ebook Dialog */}
      <Dialog
        open={isDeleteEbookDialogOpen}
        onOpenChange={setIsDeleteEbookDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ebook</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this ebook? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteEbookDialogOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEbook}>
              Delete Ebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
