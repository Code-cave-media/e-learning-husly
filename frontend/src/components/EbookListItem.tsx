import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Ebook } from "@/types/ebook";
import { ChevronDown, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface EbookListItemProps {
  ebook: Ebook;
  onUpdate: (ebook: Ebook) => void;
}

export function EbookListItem({ ebook, onUpdate }: EbookListItemProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleView = () => {
    navigate(`/landing/ebook/${ebook.id}`);
  };

  const handleDelete = () => {
    // Here you would typically make an API call to delete the ebook
    if (
      window.confirm(
        "Are you sure you want to delete this ebook? This action cannot be undone."
      )
    ) {
      // Call the API to delete the ebook
      toast.success("Ebook deleted successfully");
    }
  };

  const handleAddChapter = () => {
    const newChapter = {
      id: ebook.tableOfContents.length + 1,
      title: "New Chapter",
      pageNumber: 1,
    };

    onUpdate({
      ...ebook,
      tableOfContents: [...ebook.tableOfContents, newChapter],
    });
    toast.success("Chapter added successfully");
  };

  const handleEditChapter = (chapter: Ebook["tableOfContents"][0]) => {
    const newTitle = prompt("Enter new chapter title:", chapter.title);
    if (newTitle) {
      const newPageNumber = prompt(
        "Enter new page number:",
        chapter.pageNumber.toString()
      );
      if (newPageNumber) {
        onUpdate({
          ...ebook,
          tableOfContents: ebook.tableOfContents.map((c) =>
            c.id === chapter.id
              ? { ...c, title: newTitle, pageNumber: parseInt(newPageNumber) }
              : c
          ),
        });
        toast.success("Chapter updated successfully");
      }
    }
  };

  const handleDeleteChapter = (chapterId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      onUpdate({
        ...ebook,
        tableOfContents: ebook.tableOfContents.filter(
          (c) => c.id !== chapterId
        ),
      });
      toast.success("Chapter deleted successfully");
    }
  };

  return (
    <>
      <tr>
        <td className="flex items-center gap-2">
          <img
            src={ebook.thumbnailUrl}
            alt={ebook.title}
            className="w-10 h-10 rounded object-cover"
          />
          {ebook.title}
        </td>
        <td>
          <Badge variant="secondary">{ebook.type}</Badge>
        </td>
        <td>{formatCurrency(ebook.price)}</td>
        <td>{formatCurrency(ebook.commission)}</td>
        <td>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              ebook.visible
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {ebook.visible ? "Visible" : "Hidden"}
          </span>
        </td>
        <td>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-4 bg-gray-100">
            <div className="space-y-6">
              {/* Ebook Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Ebook Details</h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={ebook.title}
                        onChange={(e) => {
                          onUpdate({ ...ebook, title: e.target.value });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={ebook.description}
                        onChange={(e) => {
                          onUpdate({ ...ebook, description: e.target.value });
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={ebook.price}
                          onChange={(e) => {
                            onUpdate({
                              ...ebook,
                              price: parseInt(e.target.value),
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Commission</Label>
                        <Input
                          type="number"
                          value={ebook.commission}
                          onChange={(e) => {
                            onUpdate({
                              ...ebook,
                              commission: parseInt(e.target.value),
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ebook.visible}
                        onCheckedChange={(checked) => {
                          onUpdate({ ...ebook, visible: checked });
                        }}
                      />
                      <Label>Visible</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Media</h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Thumbnail</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onUpdate({
                              ...ebook,
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
                            onUpdate({
                              ...ebook,
                              introVideo: file,
                              introVideoUrl: URL.createObjectURL(file),
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table of Contents Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Table of Contents</h3>
                  <Button onClick={handleAddChapter}>Add Chapter</Button>
                </div>
                <div className="space-y-4">
                  {ebook.tableOfContents.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border"
                    >
                      <div>
                        <h4 className="font-medium">{chapter.title}</h4>
                        <p className="text-sm text-gray-500">
                          Page: {chapter.pageNumber}
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

              {/* Landing Page Details */}
              <div>
                <h3 className="font-semibold mb-2">Landing Page Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Super Heading</Label>
                    <Input
                      value={ebook.superHeading}
                      onChange={(e) => {
                        onUpdate({ ...ebook, superHeading: e.target.value });
                      }}
                      placeholder="Enter super heading"
                    />
                  </div>
                  <div>
                    <Label>Main Heading</Label>
                    <Input
                      value={ebook.mainHeading}
                      onChange={(e) => {
                        onUpdate({ ...ebook, mainHeading: e.target.value });
                      }}
                      placeholder="Enter main heading"
                    />
                  </div>
                  <div>
                    <Label>Sub Heading</Label>
                    <Input
                      value={ebook.subHeading}
                      onChange={(e) => {
                        onUpdate({ ...ebook, subHeading: e.target.value });
                      }}
                      placeholder="Enter sub heading"
                    />
                  </div>
                  <div>
                    <Label>
                      Highlight Words of Main Heading (comma separated)
                    </Label>
                    <Input
                      value={ebook.highlightWords}
                      onChange={(e) => {
                        onUpdate({ ...ebook, highlightWords: e.target.value });
                      }}
                      placeholder="Enter highlight words separated by commas"
                    />
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
