import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { EbookListItem } from "@/components/EbookListItem";
import { Ebook } from "@/types/ebook";

const ebookTypes = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Personal Development",
  "Finance",
  "Health & Fitness",
  "Education",
  "Technology",
  "Self-Help",
];

export default function EbookManagement() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEbook, setNewEbook] = useState<Partial<Ebook>>({
    type: "",
    title: "",
    description: "",
    price: 0,
    commission: 0,
    thumbnail: null,
    thumbnailUrl: "",
    introVideo: null,
    introVideoUrl: "",
    visible: true,
    superHeading: "",
    mainHeading: "",
    subHeading: "",
    highlightWords: "",
    tableOfContents: [],
  });
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [expandedEbookId, setExpandedEbookId] = useState<number | null>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<{
    ebookId: number;
    chapter: Ebook["tableOfContents"][0] | null;
  } | null>(null);
  const [newChapter, setNewChapter] = useState<
    Partial<Ebook["tableOfContents"][0]>
  >({});
  const [selectedEbookId, setSelectedEbookId] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: "ebook" | "chapter";
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "ebook",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Dummy data for ebooks
  const dummyEbooks: Ebook[] = [
    {
      id: 1,
      type: "Programming",
      title: "Python Programming Guide",
      description: "A comprehensive guide to Python programming language",
      price: 999,
      commission: 10,
      thumbnail: null,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2070&auto=format&fit=crop",
      introVideo: null,
      introVideoUrl: "",
      visible: true,
      superHeading: "Master Python Programming",
      mainHeading: "Learn Python from Scratch to Advanced",
      subHeading: "A comprehensive guide for beginners and professionals",
      highlightWords: "Python, Programming, Data Science, Automation",
      tableOfContents: [
        {
          id: 1,
          title: "Introduction to Python",
          pageNumber: 1,
        },
        {
          id: 2,
          title: "Basic Syntax and Data Types",
          pageNumber: 15,
        },
      ],
    },
  ];

  useEffect(() => {
    // In a real application, you would fetch the ebooks from an API
    setEbooks(dummyEbooks);
  }, []);

  const handleCreateEbook = () => {
    // Here you would typically make an API call to create the ebook
    const newEbookWithId: Ebook = {
      id: ebooks.length + 1,
      type: newEbook.type || "",
      title: newEbook.title || "",
      description: newEbook.description || "",
      price: newEbook.price || 0,
      commission: newEbook.commission || 0,
      thumbnail: newEbook.thumbnail,
      thumbnailUrl: newEbook.thumbnailUrl || "",
      introVideo: newEbook.introVideo,
      introVideoUrl: newEbook.introVideoUrl || "",
      visible: newEbook.visible || false,
      superHeading: newEbook.superHeading || "",
      mainHeading: newEbook.mainHeading || "",
      subHeading: newEbook.subHeading || "",
      highlightWords: newEbook.highlightWords || "",
      tableOfContents: [],
    };
    setEbooks([...ebooks, newEbookWithId]);
    setIsCreateDialogOpen(false);
    setNewEbook({
      type: "",
      title: "",
      description: "",
      price: 0,
      commission: 0,
      thumbnail: null,
      thumbnailUrl: "",
      introVideo: null,
      introVideoUrl: "",
      visible: true,
      superHeading: "",
      mainHeading: "",
      subHeading: "",
      highlightWords: "",
      tableOfContents: [],
    });
  };

  const confirmDialog = (
    type: "ebook" | "chapter",
    title: string,
    description: string,
    onConfirm: () => void
  ) => {
    setDeleteDialog({
      isOpen: true,
      type,
      title,
      description,
      onConfirm,
    });
  };

  const handleDeleteEbook = (id: number) => {
    confirmDialog(
      "ebook",
      "Delete Ebook",
      "Are you sure you want to delete this ebook? This action cannot be undone.",
      () => {
        setEbooks(ebooks.filter((ebook) => ebook.id !== id));
        setDeleteDialog({ ...deleteDialog, isOpen: false });
        toast.success("Ebook deleted successfully");
      }
    );
  };

  const handleViewEbook = (id: number) => {
    navigate(`/landing/ebook/${id}`);
  };

  const handleAddChapter = (ebookId: number) => {
    if (!newChapter.title || !newChapter.pageNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setEbooks(
      ebooks.map((ebook) => {
        if (ebook.id === ebookId) {
          return {
            ...ebook,
            tableOfContents: [
              ...ebook.tableOfContents,
              {
                id: ebook.tableOfContents.length + 1,
                title: newChapter.title || "",
                pageNumber: newChapter.pageNumber || 0,
              },
            ],
          };
        }
        return ebook;
      })
    );

    setIsChapterDialogOpen(false);
    setNewChapter({});
    setSelectedEbookId(null);
    toast.success("Chapter added successfully");
  };

  const handleEditChapter = (
    ebookId: number,
    chapter: Ebook["tableOfContents"][0]
  ) => {
    setEditingChapter({ ebookId, chapter });
    setIsChapterDialogOpen(true);
  };

  const handleDeleteChapter = (ebookId: number, chapterId: number) => {
    confirmDialog(
      "chapter",
      "Delete Chapter",
      "Are you sure you want to delete this chapter? This action cannot be undone.",
      () => {
        setEbooks(
          ebooks.map((ebook) => {
            if (ebook.id === ebookId) {
              return {
                ...ebook,
                tableOfContents: ebook.tableOfContents.filter(
                  (chapter) => chapter.id !== chapterId
                ),
              };
            }
            return ebook;
          })
        );
        setDeleteDialog({ ...deleteDialog, isOpen: false });
        toast.success("Chapter deleted successfully");
      }
    );
  };

  const handleUpdateChapter = () => {
    if (!editingChapter) return;

    setEbooks(
      ebooks.map((ebook) => {
        if (ebook.id === editingChapter.ebookId) {
          return {
            ...ebook,
            tableOfContents: ebook.tableOfContents.map((chapter) =>
              chapter.id === editingChapter.chapter?.id
                ? editingChapter.chapter
                : chapter
            ),
          };
        }
        return ebook;
      })
    );

    setIsChapterDialogOpen(false);
    setEditingChapter(null);
    toast.success("Chapter updated successfully");
  };

  const handleUpdateEbook = (updatedEbook: Ebook) => {
    setEbooks(
      ebooks.map((ebook) =>
        ebook.id === updatedEbook.id ? updatedEbook : ebook
      )
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ebook Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Ebook
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ebooks.map((ebook) => (
              <EbookListItem
                key={ebook.id}
                ebook={ebook}
                onUpdate={handleUpdateEbook}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Ebook Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ebook Type</Label>
              <Select
                value={newEbook.type}
                onValueChange={(value) =>
                  setNewEbook({ ...newEbook, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ebookTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={newEbook.title}
                onChange={(e) =>
                  setNewEbook({ ...newEbook, title: e.target.value })
                }
                placeholder="Enter ebook title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newEbook.description}
                onChange={(e) =>
                  setNewEbook({ ...newEbook, description: e.target.value })
                }
                placeholder="Enter ebook description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={newEbook.price}
                  onChange={(e) =>
                    setNewEbook({
                      ...newEbook,
                      price: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label>Commission (%)</Label>
                <Input
                  type="number"
                  value={newEbook.commission}
                  onChange={(e) =>
                    setNewEbook({
                      ...newEbook,
                      commission: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter commission percentage"
                />
              </div>
            </div>
            <div>
              <Label>Thumbnail</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewEbook({
                      ...newEbook,
                      thumbnail: file,
                      thumbnailUrl: URL.createObjectURL(file),
                    });
                  }
                }}
              />
            </div>
            <div>
              <Label>Intro Video</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewEbook({
                      ...newEbook,
                      introVideo: file,
                      introVideoUrl: URL.createObjectURL(file),
                    });
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newEbook.visible}
                onCheckedChange={(checked) =>
                  setNewEbook({ ...newEbook, visible: checked })
                }
              />
              <Label>Visible</Label>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEbook}>Create Ebook</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog({ ...deleteDialog, isOpen: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteDialog.title}</DialogTitle>
            <DialogDescription>{deleteDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ ...deleteDialog, isOpen: false })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteDialog.onConfirm();
              }}
            >
              Delete {deleteDialog.type === "ebook" ? "Ebook" : "Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chapter Management Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChapter ? "Edit Chapter" : "Add New Chapter"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chapter Title</Label>
              <Input
                value={editingChapter?.chapter?.title || newChapter.title || ""}
                onChange={(e) => {
                  if (editingChapter) {
                    setEditingChapter({
                      ...editingChapter,
                      chapter: {
                        ...editingChapter.chapter!,
                        title: e.target.value,
                      },
                    });
                  } else {
                    setNewChapter({
                      ...newChapter,
                      title: e.target.value,
                    });
                  }
                }}
                placeholder="Enter chapter title"
              />
            </div>
            <div>
              <Label>Page Number</Label>
              <Input
                type="number"
                value={
                  editingChapter?.chapter?.pageNumber ||
                  newChapter.pageNumber ||
                  ""
                }
                onChange={(e) => {
                  if (editingChapter) {
                    setEditingChapter({
                      ...editingChapter,
                      chapter: {
                        ...editingChapter.chapter!,
                        pageNumber: parseInt(e.target.value),
                      },
                    });
                  } else {
                    setNewChapter({
                      ...newChapter,
                      pageNumber: parseInt(e.target.value),
                    });
                  }
                }}
                placeholder="Enter page number"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChapterDialogOpen(false);
                  setEditingChapter(null);
                  setNewChapter({});
                  setSelectedEbookId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingChapter) {
                    handleUpdateChapter();
                  } else if (selectedEbookId) {
                    handleAddChapter(selectedEbookId);
                  }
                }}
              >
                {editingChapter ? "Update Chapter" : "Add Chapter"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
