import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Download,
  Clock,
} from "lucide-react";
import RegistrationForm from "@/components/shared/RegistrationForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

interface Chapter {
  id: number;
  title: string;
  description: string;
}

interface Feature {
  id: number;
  text: string;
}

interface Ebook {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  thumbnail: File | null;
  thumbnailUrl: string;
  introVideo: File | null;
  introVideoUrl: string;
  author: string;
  authorPosition: string;
  authorDescription: string;
  pages: number;
  format: string;
  chapters: Chapter[];
  features: Feature[];
  isPurchased: boolean;
  visible: boolean;
}

const ebookFormats = ["PDF", "EPUB", "MOBI", "PDF, EPUB", "PDF, EPUB, MOBI"];

export default function EbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const affiliateId = searchParams.get("ref");
  const { isAdmin } = useAuth();
  const isAdminView = searchParams.get("admin") === "true" && isAdmin;

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedEbook, setEditedEbook] = useState<Ebook | null>(null);
  const [ebook, setEbook] = useState<Ebook | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    setEbook({
      id: "1",
      title: "The Complete Guide to Digital Marketing",
      description:
        "A comprehensive guide to mastering digital marketing strategies, tools, and techniques for business growth.",
      price: 49.99,
      originalPrice: 99.99,
      thumbnail: null,
      thumbnailUrl:
        "https://www.hostinger.in/tutorials/wp-content/uploads/sites/2/2022/07/the-structure-of-a-url.png",
      introVideo: null,
      introVideoUrl: "",
      author: "Jane Smith",
      authorPosition: "Digital Marketing Expert",
      authorDescription:
        "With over 15 years of experience in digital marketing, Jane has helped numerous businesses achieve their marketing goals and grow their online presence.",
      pages: 250,
      format: "PDF, EPUB, MOBI",
      chapters: [
        {
          id: 1,
          title: "Introduction to Digital Marketing",
          description: "Understanding the digital marketing landscape",
        },
        {
          id: 2,
          title: "Content Marketing Strategy",
          description: "Creating and distributing valuable content",
        },
        {
          id: 3,
          title: "Social Media Marketing",
          description: "Building and engaging your social media presence",
        },
        {
          id: 4,
          title: "Email Marketing",
          description: "Creating effective email campaigns",
        },
        {
          id: 5,
          title: "SEO Fundamentals",
          description: "Optimizing your content for search engines",
        },
      ],
      features: [
        { id: 1, text: "Comprehensive digital marketing strategies" },
        { id: 2, text: "Step-by-step implementation guides" },
        { id: 3, text: "Case studies and real-world examples" },
        { id: 4, text: "Actionable templates and checklists" },
        { id: 5, text: "Expert tips and best practices" },
        { id: 6, text: "Future trends and predictions" },
      ],
      isPurchased: false,
      visible: true,
    });
  }, [id]);

  useEffect(() => {
    if (ebook) {
      setEditedEbook(ebook);
    }
  }, [ebook]);

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

  const handleDeleteEbook = () => {
    // Here you would typically make an API call to delete the ebook
    toast.success("Ebook deleted successfully");
    navigate("/admin/ebooks");
  };

  if (!ebook || !editedEbook) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          {isAdminView && (
            <div className="flex justify-end gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Ebook
              </Button>
              <Button onClick={handleEditModeToggle}>
                {isEditMode ? "Save Changes" : "Edit Ebook"}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {isEditMode ? (
                  <Input
                    value={editedEbook.title}
                    onChange={(e) => handleTextChange("title", e.target.value)}
                    className="text-4xl font-bold"
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {ebook.title}
                  </h1>
                )}
              </div>
              {isEditMode ? (
                <Textarea
                  value={editedEbook.description}
                  onChange={(e) =>
                    handleTextChange("description", e.target.value)
                  }
                  className="text-xl"
                />
              ) : (
                <p className="text-xl text-muted-foreground">
                  {ebook.description}
                </p>
              )}
              <div className="flex items-center gap-6">
                {isEditMode ? (
                  <>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <Input
                        type="number"
                        value={editedEbook.pages}
                        onChange={(e) =>
                          handleTextChange("pages", parseInt(e.target.value))
                        }
                        className="w-20"
                      />
                      <span>Pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <Select
                        value={editedEbook.format}
                        onValueChange={(value) =>
                          handleTextChange("format", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {ebookFormats.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span>{ebook.pages} Pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>{ebook.format}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
                {ebook.thumbnailUrl ? (
                  <img
                    src={ebook.thumbnailUrl}
                    alt={ebook.title}
                    className="w-full h-full object-cover"
                  />
                ) : ebook.introVideoUrl ? (
                  <video
                    src={ebook.introVideoUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No media</span>
                  </div>
                )}
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="space-y-2 text-center">
                      <div className="flex gap-2">
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
                            className="cursor-pointer bg-white text-black px-4 py-2 rounded"
                          >
                            {ebook.thumbnailUrl
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
                            className="cursor-pointer bg-white text-black px-4 py-2 rounded"
                          >
                            {ebook.introVideoUrl ? "Change Intro" : "Add Intro"}
                          </Label>
                        </div>
                      </div>
                    </div>
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
              <h2 className="text-2xl font-semibold">What's Inside</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ebook.features.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapters */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Table of Contents</h2>
              <div className="space-y-4">
                {ebook.chapters.map((chapter) => (
                  <Card key={chapter.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {isEditMode ? (
                          <>
                            <Input
                              value={chapter.title}
                              onChange={(e) => {
                                if (editedEbook) {
                                  setEditedEbook({
                                    ...editedEbook,
                                    chapters: editedEbook.chapters.map((c) =>
                                      c.id === chapter.id
                                        ? { ...c, title: e.target.value }
                                        : c
                                    ),
                                  });
                                }
                              }}
                            />
                            <Textarea
                              value={chapter.description}
                              onChange={(e) => {
                                if (editedEbook) {
                                  setEditedEbook({
                                    ...editedEbook,
                                    chapters: editedEbook.chapters.map((c) =>
                                      c.id === chapter.id
                                        ? { ...c, description: e.target.value }
                                        : c
                                    ),
                                  });
                                }
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold">{chapter.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {chapter.description}
                            </p>
                          </>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Chapter {chapter.id}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About the Author</h2>
              <div className="space-y-2">
                {isEditMode ? (
                  <>
                    <Input
                      value={editedEbook.author}
                      onChange={(e) =>
                        handleTextChange("author", e.target.value)
                      }
                      placeholder="Author name"
                    />
                    <Input
                      value={editedEbook.authorPosition}
                      onChange={(e) =>
                        handleTextChange("authorPosition", e.target.value)
                      }
                      placeholder="Author position"
                    />
                    <Textarea
                      value={editedEbook.authorDescription}
                      onChange={(e) =>
                        handleTextChange("authorDescription", e.target.value)
                      }
                      placeholder="Author description"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold">{ebook.author}</h3>
                    <p className="text-muted-foreground">
                      {ebook.authorPosition}
                    </p>
                    <p>{ebook.authorDescription}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          {!isAdminView && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {!ebook.isPurchased ? (
                  <RegistrationForm
                    type="ebook"
                    itemId={id || ""}
                    price={ebook.price}
                    affiliateId={affiliateId || undefined}
                    onSuccess={() => navigate(`/ebook/${id}`)}
                  />
                ) : (
                  <Card className="p-6 space-y-4">
                    <div className="space-y-2">
                      {isEditMode ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span>₹</span>
                            <Input
                              type="number"
                              value={editedEbook.price}
                              onChange={(e) =>
                                handleTextChange(
                                  "price",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editedEbook.visible}
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
                      {!ebook.visible ? (
                        <>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => navigate(`/ebook/${id}`)}
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
                            onClick={() => navigate(`/ebook/${id}`)}
                          >
                            Go to Ebook
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={() => setIsDeleteDialogOpen(false)}
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
