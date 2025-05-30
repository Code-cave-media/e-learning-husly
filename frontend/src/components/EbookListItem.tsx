/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { Ebook } from "@/types/ebook";
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
} from "./ui/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";

interface EbookListItemProps {
  ebook: Ebook;
  setEbook: React.Dispatch<React.SetStateAction<Ebook[]>>;
}

interface EbookContent {
  id?: number;
  title: string;
  page_number: number;
}

interface TableOfContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: { title: string; page: number }) => void;
  initialData?: EbookContent;
  loading: boolean;
}

function TableOfContentDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}: TableOfContentDialogProps) {
  const [formData, setFormData] = useState<{
    title: string;
    page: number;
  }>({
    title: initialData?.title || "",
    page: initialData?.page_number || 0,
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || "",
        page: initialData.page_number || 0,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.page) {
      toast.error("Please fill all the fields");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Table of Content" : "Add New Table of Content"}
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
            <Label htmlFor="page">Page Number</Label>
            <Input
              id="page"
              type="number"
              value={formData.page}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  page: Number(e.target.value),
                }))
              }
              required
              min={1}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              {initialData ? "Save Changes" : "Add Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EbookListItem({ ebook, setEbook }: EbookListItemProps) {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook>(ebook);
  const { makeApiCall, fetchType, fetching } = useAPICall();
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<EbookContent | null>(
    null
  );

  const handleView = () => {
    navigate(`/landing/ebook/${ebook.id}`);
  };

  const handleExpand = () => {
    if (!isExpanded) {
      setEditingEbook(ebook);
    }
    setIsExpanded(!isExpanded);
  };

  const handleSaveChanges = async () => {
    if (
      !editingEbook.title ||
      !editingEbook.description ||
      !editingEbook.price ||
      !editingEbook.commission ||
      !editingEbook.thumbnail ||
      !editingEbook.pdf
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    const formData = new FormData();
    formData.append("title", editingEbook.title);
    formData.append("description", editingEbook.description);
    formData.append("price", editingEbook.price.toString());
    formData.append("commission", editingEbook.commission.toString());
    formData.append("visible", editingEbook.visible.toString());
    if (editingEbook.thumbnail instanceof File) {
      formData.append("thumbnail", editingEbook.thumbnail);
    }
    if (editingEbook.intro_video instanceof File) {
      formData.append("intro_video", editingEbook.intro_video);
    }
    if (editingEbook.pdf instanceof File) {
      formData.append("pdf", editingEbook.pdf);
    }
    formData.append("is_featured", editingEbook.is_featured.toString());
    formData.append("is_new", editingEbook.is_new.toString());
    if (editingEbook.landing_page?.thumbnail instanceof File) {
      formData.append(
        "landing_thumbnail",
        editingEbook.landing_page?.thumbnail
      );
    }
    formData.append(
      "main_heading",
      editingEbook.landing_page?.main_heading || ""
    );
    formData.append(
      "sub_heading",
      editingEbook.landing_page?.sub_heading || ""
    );
    formData.append(
      "top_heading",
      editingEbook.landing_page?.top_heading || ""
    );
    formData.append(
      "highlight_words",
      editingEbook.landing_page?.highlight_words || ""
    );

    const response = await makeApiCall(
      "PUT",
      API_ENDPOINT.UPDATE_EBOOK(editingEbook.id),
      formData,
      "application/form-data",
      authToken,
      "updateEbook"
    );
    if (response.status === 200) {
      toast.success("Ebook updated successfully");
      setEbook(
        (prev) =>
          prev.map((e) =>
            e.id === response.data.id ? response.data : e
          ) as Ebook[]
      );
      setIsExpanded(false);
    } else {
      toast.error("Failed to update ebook");
    }
  };

  const handleAddContent = () => {
    setEditingContent(null);
    setIsContentDialogOpen(true);
  };

  const handleEditContent = (content: Ebook["chapters"][0]) => {
    setEditingContent({
      id: content.id,
      title: content.title,
      page_number: content.page_number,
    });
    setIsContentDialogOpen(true);
  };

  const handleContentSubmit = async (contentData: {
    title: string;
    page: number;
  }) => {
    if (editingContent) {
      const updatedContent = {
        title: contentData.title,
        page_number: contentData.page,
      };

      const response = await makeApiCall(
        "PUT",
        API_ENDPOINT.UPDATE_EBOOK_CHAPTER(editingContent.id),
        updatedContent,
        "application/json",
        authToken,
        "updateEbookChapter"
      );
      if (response.status === 200) {
        const updatedEbook = {
          ...editingEbook,
          chapters: editingEbook.chapters.map((c) =>
            c.id === editingContent.id
              ? {
                  ...c,
                  title: contentData.title,
                  page_number: contentData.page,
                }
              : c
          ),
        } as Ebook;
        setEbook(
          (prev) =>
            prev.map((e) =>
              e.id === updatedEbook.id ? updatedEbook : e
            ) as Ebook[]
        );
        setEditingEbook(updatedEbook);
        toast.success("Chapter updated successfully");
      } else {
        toast.error("Failed to update chapter");
        setIsContentDialogOpen(false);
        setEditingContent(null);
      }
    } else {
      const newContent = {
        title: contentData.title,
        page_number: contentData.page,
        ebook_id: ebook.id,
      };
      const response = await makeApiCall(
        "POST",
        API_ENDPOINT.CREATE_EBOOK_CHAPTER,
        newContent,
        "application/json",
        authToken,
        "createEbookChapter"
      );
      if (response.status === 200) {
        const updatedEbook = {
          ...editingEbook,
          chapters: [...editingEbook.chapters, response.data],
        } as Ebook;
        setEbook(
          (prev) =>
            prev.map((e) =>
              e.id === updatedEbook.id ? updatedEbook : e
            ) as Ebook[]
        );
        setEditingEbook(updatedEbook);
        toast.success("Chapter added successfully");
      } else {
        toast.error("Failed to add chapter");
      }
    }
  };

  const handleDeleteContent = (contentId: number) => {
    confirmDialog({
      message: `Are you sure you want to delete this chapter? This action cannot be undone.`,
      header: "Delete Chapter",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        deleteEbookContent(contentId);
      },
    });
  };

  const deleteEbookContent = async (contentId: number) => {
    const response = await makeApiCall(
      "DELETE",
      API_ENDPOINT.DELETE_EBOOK_CHAPTER(contentId),
      null,
      "application/json",
      authToken,
      "deleteEbook"
    );
    if (response.status === 200) {
      const updatedEbook = {
        ...editingEbook,
        chapters: editingEbook.chapters.filter((c) => c.id !== contentId),
      } as Ebook;
      setEbook(
        (prev) =>
          prev.map((e) =>
            e.id === updatedEbook.id ? updatedEbook : e
          ) as Ebook[]
      );
      setEditingEbook(updatedEbook);
      toast.success("Chapter deleted successfully");
    } else {
      toast.error("Failed to delete chapter");
    }
  };

  const handleDeleteEbook = () => {
    confirmDialog({
      message: `Are you sure you want to delete the ebook "${ebook.title}"? This action cannot be undone.`,
      header: "Delete Ebook",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        const response = await makeApiCall(
          "DELETE",
          API_ENDPOINT.DELETE_EBOOK(ebook.id),
          null,
          "application/json",
          authToken,
          "deleteEbook"
        );
        if (response.status === 200) {
          toast.success("Ebook deleted successfully");
          setIsExpanded(false);
          setEbook((prev) => prev.filter((e) => e.id !== ebook.id));
        } else {
          toast.error("Failed to delete ebook");
        }
      },
    });
  };

  return (
    <>
      <TableRow className="">
        <TableCell className="">
          <img
            src={ebook.thumbnail as string}
            alt={ebook.title}
            className="w-28 h-16 rounded object-cover"
          />
        </TableCell>
        <TableCell className="">{ebook.title}</TableCell>
        <TableCell className="">{formatCurrency(ebook.price)}</TableCell>
        <TableCell className="">{formatCurrency(ebook.commission)}</TableCell>
        <TableCell className="">
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
              onClick={() => handleDeleteEbook()}
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
                {/* Ebook Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Ebook Details</h3>
                    <div className="space-y-2">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingEbook.title}
                          onChange={(e) => {
                            setEditingEbook({
                              ...editingEbook,
                              title: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingEbook.description}
                          onChange={(e) => {
                            setEditingEbook({
                              ...editingEbook,
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
                            value={editingEbook.price}
                            onChange={(e) => {
                              setEditingEbook({
                                ...editingEbook,
                                price: parseInt(e.target.value),
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Commission</Label>
                          <Input
                            type="number"
                            value={editingEbook.commission}
                            onChange={(e) => {
                              setEditingEbook({
                                ...editingEbook,
                                commission: parseInt(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingEbook.visible}
                          onCheckedChange={(checked) => {
                            setEditingEbook({
                              ...editingEbook,
                              visible: checked,
                            });
                          }}
                        />
                        <Label>Visible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingEbook.is_featured}
                          onCheckedChange={(checked) => {
                            setEditingEbook({
                              ...editingEbook,
                              is_featured: checked,
                            });
                          }}
                        />
                        <Label>Featured Ebook</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingEbook.is_new}
                          onCheckedChange={(checked) => {
                            setEditingEbook({
                              ...editingEbook,
                              is_new: checked,
                            });
                          }}
                        />
                        <Label>New Ebook</Label>
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
                            {editingEbook.thumbnail ? (
                              <>
                                <img
                                  src={
                                    typeof editingEbook.thumbnail === "string"
                                      ? editingEbook.thumbnail
                                      : URL.createObjectURL(
                                          editingEbook.thumbnail
                                        )
                                  }
                                  alt="Ebook thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
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
                                          setEditingEbook({
                                            ...editingEbook,
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
                                  setEditingEbook({
                                    ...editingEbook,
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
                            {editingEbook.intro_video ? (
                              <>
                                <video
                                  src={
                                    typeof editingEbook.intro_video === "string"
                                      ? editingEbook.intro_video
                                      : URL.createObjectURL(
                                          editingEbook.intro_video
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
                                          setEditingEbook({
                                            ...editingEbook,
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
                                  setEditingEbook({
                                    ...editingEbook,
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
                      <div>
                        <Label>PDF File</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="relative w-64 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
                            {editingEbook.pdf ? (
                              <>
                                <div className="w-full h-full flex flex-col items-center justify-center bg-green-50">
                                  <svg
                                    className="w-12 h-12 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="mt-2 text-sm text-green-700">
                                    {typeof editingEbook.pdf === "string"
                                      ? "PDF File"
                                      : editingEbook.pdf.name}
                                  </span>
                                  {typeof editingEbook.pdf === "string" && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="mt-2 z-50 text-green-700 hover:text-green-800"
                                      onClick={() =>
                                        window.open(
                                          editingEbook.pdf as string,
                                          "_blank"
                                        )
                                      }
                                    >
                                      View PDF
                                    </Button>
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-white"
                                    onClick={() => {
                                      const input =
                                        document.createElement("input");
                                      input.type = "file";
                                      input.accept = ".pdf";
                                      input.onchange = (e) => {
                                        const file = (
                                          e.target as HTMLInputElement
                                        ).files?.[0];
                                        if (file) {
                                          setEditingEbook({
                                            ...editingEbook,
                                            pdf: file,
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
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-primary/50 transition-colors bg-red-50">
                                <svg
                                  className="w-8 h-8 mb-2 text-red-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-xs text-center px-2 text-red-700">
                                  Click to upload PDF
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept=".pdf"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setEditingEbook({
                                    ...editingEbook,
                                    pdf: file,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">
                              Upload the PDF file for this ebook
                            </p>
                            <p className="text-sm text-gray-500">
                              Max file size: 10MB
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
                          {editingEbook.landing_page?.thumbnail ? (
                            <>
                              <img
                                src={
                                  typeof editingEbook.landing_page.thumbnail ===
                                  "string"
                                    ? editingEbook.landing_page.thumbnail
                                    : URL.createObjectURL(
                                        editingEbook.landing_page.thumbnail
                                      )
                                }
                                alt="Landing page thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
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
                                        setEditingEbook({
                                          ...editingEbook,
                                          landing_page: {
                                            ...editingEbook.landing_page,
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
                                setEditingEbook({
                                  ...editingEbook,
                                  landing_page: {
                                    ...editingEbook.landing_page,
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
                        value={editingEbook.landing_page?.top_heading}
                        onChange={(e) => {
                          setEditingEbook({
                            ...editingEbook,
                            landing_page: {
                              ...editingEbook.landing_page,
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
                        value={editingEbook.landing_page?.main_heading}
                        onChange={(e) => {
                          setEditingEbook({
                            ...editingEbook,
                            landing_page: {
                              ...editingEbook.landing_page,
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
                        value={editingEbook.landing_page?.sub_heading}
                        onChange={(e) => {
                          setEditingEbook({
                            ...editingEbook,
                            landing_page: {
                              ...editingEbook.landing_page,
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
                        value={editingEbook.landing_page?.highlight_words}
                        onChange={(e) => {
                          setEditingEbook({
                            ...editingEbook,
                            landing_page: {
                              ...editingEbook.landing_page,
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
                    loading={fetching && fetchType === "updateEbook"}
                    onClick={handleSaveChanges}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>

                {/* Table of Contents */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Chapters</h3>
                    <Button onClick={handleAddContent}>Add Chapter</Button>
                  </div>
                  <div className="space-y-4">
                    {editingEbook.chapters.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-gray-500">
                            Page: {content.page_number}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContent(content)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContent(content.id)}
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

      <TableOfContentDialog
        isOpen={isContentDialogOpen}
        onClose={() => {
          setIsContentDialogOpen(false);
          setEditingContent(null);
        }}
        onSubmit={handleContentSubmit}
        initialData={editingContent || undefined}
        loading={
          fetching &&
          (fetchType === "createEbookChapter" ||
            fetchType === "updateEbookChapter")
        }
      />
    </>
  );
}
