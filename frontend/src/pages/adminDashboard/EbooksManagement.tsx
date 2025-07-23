/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Plus, FileText, Search } from "lucide-react";
import { EbookListItem } from "@/components/EbookListItem";
import { Ebook } from "@/types/ebook";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import Pagination from "@/components/Pagination";

export default function EbooksManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    total: 0,
    totalPages: 0,
  });
  const [newEbook, setNewEbook] = useState<Partial<Ebook>>({
    title: "",
    description: "",
    price: 0,
    commission: 0,
    visible: false,
    is_featured: false,
    is_new: false,
    thumbnail: null,
    intro_video: null,
    pdf: null,
    landing_page: {
      top_heading: "",
      main_heading: "",
      sub_heading: "",
      highlight_words: "",
      thumbnail: null,
      action_button: "",
    },
    chapters: [],
  });
  const { makeApiCall, fetching, fetchType, isFetched } = useAPICall();
  const { authToken } = useAuth();

  useEffect(() => {
    getEbooks();
  }, [page, search]);

  const handleCreateEbook = async () => {
    if (
      !newEbook.title ||
      !newEbook.description ||
      !newEbook.price ||
      !newEbook.commission ||
      !newEbook.thumbnail ||
      !newEbook.intro_video ||
      !newEbook.pdf
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const formData = new FormData();
    formData.append("title", newEbook.title);
    formData.append("description", newEbook.description);
    formData.append("price", newEbook.price.toString());
    formData.append("commission", newEbook.commission.toString());
    formData.append("thumbnail", newEbook.thumbnail);
    formData.append("visible", newEbook.visible.toString());
    formData.append("intro_video", newEbook.intro_video);
    formData.append("pdf", newEbook.pdf);
    formData.append("is_featured", newEbook.is_featured.toString());
    formData.append("is_new", newEbook.is_new.toString());
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.CREATE_EBOOK,
      formData,
      "application/form-data",
      authToken,
      "createEbook"
    );
    if (response.status === 200) {
      setEbooks([response.data, ...ebooks]);
      toast.success("Ebook created successfully");
      setIsCreateDialogOpen(false);
      setNewEbook({
        title: "",
        description: "",
        price: 0,
        commission: 0,
        visible: false,
        is_featured: false,
        is_new: false,
        thumbnail: null,
        intro_video: null,
        pdf: null,
        landing_page: {
          top_heading: "",
          main_heading: "",
          sub_heading: "",
          highlight_words: "",
          thumbnail: null,
          action_button: "",
        },
        chapters: [],
      });
    } else {
      toast.error("Failed to create ebook");
    }
  };

  const getEbooks = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.ADMIN_LIST_EBOOKS(page, pageSize, search),
      null,
      "application/json",
      authToken,
      "listEbooks"
    );
    if (response.status === 200) {
      setEbooks(response.data.items);
      setPagination({
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
        total: response.data.total,
        totalPages: response.data.total_pages,
      });
    } else {
      toast.error("Failed to fetch ebooks");
    }
  };
  const handleKeyPress = (e: any = null) => {
    if (e && e.key === "Enter") {
      setPage(1);
      setSearch(currentQuery);
    }
    if (!e) {
      setPage(1);
      setSearch(currentQuery);
    }
  };
  return (
    <div className="py-4 sm:py-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Ebooks Management</h1>
        <Button
          size="sm"
          className="sm:text-base"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Create New Ebook
        </Button>
      </div>
      <div className="relative flex items-center flex-1">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by courses"
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-8 w-full sm:w-[300px]"
        />
        <Button
          variant="ghost"
          size="icon"
          className="right-2 hover:bg-inherit"
          onClick={(e) => handleKeyPress(e)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching && (fetchType === "listEbooks" || !isFetched) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            )}
            {!fetching &&
              fetchType !== "listEbooks" &&
              ebooks.length > 0 &&
              ebooks.map((ebook) => (
                <EbookListItem
                  key={ebook.id}
                  ebook={ebook}
                  setEbook={setEbooks}
                />
              ))}
            {!fetching && fetchType !== "listEbooks" && ebooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No ebooks found</p>
                    {!search && (
                      <p className="text-sm text-muted-foreground">
                        Create your first ebook to get started.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!(fetching || !isFetched) && ebooks.length != 0 && (
        <Pagination
          currentPage={page}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsSize={pageSize}
          onPageChange={setPage}
          pageSize={pageSize}
          total={pagination.total}
        />
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Ebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                      intro_video: file,
                    });
                  }
                }}
              />
            </div>
            <div>
              <Label>PDF File</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewEbook({
                      ...newEbook,
                      pdf: file,
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
            <div className="flex items-center space-x-2">
              <Switch
                checked={newEbook.is_featured}
                onCheckedChange={(checked) =>
                  setNewEbook({ ...newEbook, is_featured: checked })
                }
              />
              <Label>Featured Ebook</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newEbook.is_new}
                onCheckedChange={(checked) =>
                  setNewEbook({ ...newEbook, is_new: checked })
                }
              />
              <Label>New Ebook</Label>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEbook}
                loading={fetchType === "createEbook" && fetching}
              >
                Create Ebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
