import { useState } from "react";
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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Ebook {
  id: number;
  type: string;
  title: string;
  description: string;
  number_of_pages: number;
  price: number;
  commission: number;
  content: File | null;
  contentUrl: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  visible: boolean;
  originalPrice: number;
  isPurchased: boolean;
}

const ebookTypes = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Personal Development",
];

export default function EbookManagement() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEbook, setNewEbook] = useState<Partial<Ebook>>({
    type: "",
    title: "",
    description: "",
    number_of_pages: 0,
    price: 0,
    commission: 0,
    content: null,
    contentUrl: "",
    thumbnail: null,
    thumbnailUrl: "",
    visible: true,
    originalPrice: 0,
  });

  // Dummy data for ebooks
  const ebooks: Ebook[] = [
    {
      id: 1,
      type: "Programming",
      title: "Python Programming Guide",
      description: "A comprehensive guide to Python programming language",
      number_of_pages: 250,
      price: 999,
      commission: 10,
      content: null,
      contentUrl: "https://example.com/ebook.pdf",
      thumbnail: null,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2070&auto=format&fit=crop",
      visible: true,
      originalPrice: 1999,
      isPurchased: false,
    },
    {
      id: 2,
      type: "Design",
      title: "UI/UX Design Principles",
      description: "Master the fundamentals of UI/UX design",
      number_of_pages: 180,
      price: 799,
      commission: 8,
      content: null,
      contentUrl: "https://example.com/design-guide.pdf",
      thumbnail: null,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2064&auto=format&fit=crop",
      visible: false,
      originalPrice: 1499,
      isPurchased: false,
    },
  ];

  const handleCreateEbook = () => {
    // Here you would typically make an API call to create the ebook
    setIsCreateDialogOpen(false);
  };

  const handleEditEbook = (id: number) => {
    navigate(`/admin/dashboard/ebook/${id}`);
  };

  const handleDeleteEbook = (id: number) => {
    // Here you would typically make an API call to delete the ebook
  };

  const handleViewEbook = (id: number) => {
    navigate(`/admin/ebooks/${id}`);
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
              <TableHead>Pages</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ebooks.map((ebook) => (
              <TableRow key={ebook.id}>
                <TableCell className="flex items-center gap-2">
                  <img
                    src={ebook.thumbnailUrl}
                    alt={ebook.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  {ebook.title}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{ebook.type}</Badge>
                </TableCell>
                <TableCell>{ebook.number_of_pages}</TableCell>
                <TableCell>{formatCurrency(ebook.price)}</TableCell>
                <TableCell>{ebook.commission}%</TableCell>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewEbook(ebook.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditEbook(ebook.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteEbook(ebook.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newEbook.description}
                onChange={(e) =>
                  setNewEbook({ ...newEbook, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number of Pages</Label>
                <Input
                  type="number"
                  value={newEbook.number_of_pages}
                  onChange={(e) =>
                    setNewEbook({
                      ...newEbook,
                      number_of_pages: parseInt(e.target.value),
                    })
                  }
                />
              </div>
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={newEbook.commission}
                  onChange={(e) =>
                    setNewEbook({
                      ...newEbook,
                      commission: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Original Price</Label>
                <Input
                  type="number"
                  value={newEbook.originalPrice}
                  onChange={(e) =>
                    setNewEbook({
                      ...newEbook,
                      originalPrice: parseInt(e.target.value),
                    })
                  }
                />
              </div>
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
    </div>
  );
}
