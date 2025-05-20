import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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

const dummyEbooks: Ebook[] = [
  {
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
    ],
    features: [
      { id: 1, text: "Comprehensive digital marketing strategies" },
      { id: 2, text: "Step-by-step implementation guides" },
    ],
    isPurchased: false,
    visible: true,
  },
  {
    id: "2",
    title: "Web Development Fundamentals",
    description:
      "Learn the basics of web development including HTML, CSS, and JavaScript.",
    price: 39.99,
    originalPrice: 79.99,
    thumbnail: null,
    thumbnailUrl:
      "https://www.hostinger.in/tutorials/wp-content/uploads/sites/2/2022/07/the-structure-of-a-url.png",
    introVideo: null,
    introVideoUrl: "",
    author: "John Doe",
    authorPosition: "Senior Web Developer",
    authorDescription:
      "John has been developing web applications for over a decade and has worked with major tech companies.",
    pages: 300,
    format: "PDF, EPUB",
    chapters: [
      {
        id: 1,
        title: "HTML Basics",
        description: "Introduction to HTML structure and elements",
      },
      {
        id: 2,
        title: "CSS Styling",
        description: "Learn how to style your web pages",
      },
    ],
    features: [
      { id: 1, text: "Hands-on coding exercises" },
      { id: 2, text: "Real-world project examples" },
    ],
    isPurchased: false,
    visible: true,
  },
];

const EbooksManagement = () => {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<Ebook[]>(dummyEbooks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [formData, setFormData] = useState<Partial<Ebook>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEbook) {
      setEbooks(
        ebooks.map((ebook) =>
          ebook.id === editingEbook.id ? { ...ebook, ...formData } : ebook
        )
      );
      toast.success("Ebook updated successfully");
    } else {
      setEbooks([
        ...ebooks,
        {
          id: Date.now().toString(),
          chapters: [],
          features: [],
          isPurchased: false,
          visible: true,
          ...formData,
        } as Ebook,
      ]);
      toast.success("Ebook created successfully");
    }
    setIsDialogOpen(false);
    setEditingEbook(null);
    setFormData({});
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setFormData(ebook);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEbookToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ebookToDelete) {
      setEbooks(ebooks.filter((ebook) => ebook.id !== ebookToDelete));
      toast.success("Ebook deleted successfully");
      setIsDeleteDialogOpen(false);
      setEbookToDelete(null);
    }
  };

  const handleView = (id: string) => {
    navigate(`/ebook/${id}?admin=true`);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleIntroVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        introVideo: file,
        introVideoUrl: URL.createObjectURL(file),
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ebooks Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Ebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEbook ? "Edit Ebook" : "Add New Ebook"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input
                    value={formData.author || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Author Position</Label>
                <Input
                  value={formData.authorPosition || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, authorPosition: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Author Description</Label>
                <Textarea
                  value={formData.authorDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      authorDescription: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Original Price</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pages</Label>
                  <Input
                    type="number"
                    value={formData.pages || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pages: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Format</Label>
                  <Select
                    value={formData.format || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, format: value })
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thumbnail</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="cursor-pointer"
                  />
                </div>
                <div>
                  <Label>Intro Video</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleIntroVideoChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.visible}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, visible: checked })
                  }
                />
                <Label>Visible</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingEbook ? "Update Ebook" : "Add Ebook"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ebooks.map((ebook) => (
              <TableRow key={ebook.id}>
                <TableCell className="font-medium">{ebook.title}</TableCell>
                <TableCell>{ebook.author}</TableCell>
                <TableCell>{formatCurrency(ebook.price)}</TableCell>
                <TableCell>{ebook.format}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ebook.visible
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ebook.visible ? "Visible" : "Hidden"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleView(ebook.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(ebook)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(ebook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Delete Confirmation Dialog */}
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
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Ebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EbooksManagement;
