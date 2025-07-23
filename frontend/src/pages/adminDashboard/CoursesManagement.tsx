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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Plus, BookOpen, Search } from "lucide-react";
import { CourseListItem } from "@/components/CourseListItem";
import { Course } from "@/types/course";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import Pagination from "@/components/Pagination";

export default function CoursesManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    hasNext: false,
    hasPrev: false,
    total: 0,
    totalPages: 0,
  });
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    price: 0,
    commission: 0,
    visible: false,
    is_featured: false,
    is_new: false,
  });
  const { makeApiCall, fetching, fetchType, isFetched } = useAPICall();
  const { authToken } = useAuth();
  const pageSize = 20;
  useEffect(() => {
    getCourses();
  }, [page, search]);

  const handleCreateCourse = async () => {
    if (
      !newCourse.title ||
      !newCourse.description ||
      !newCourse.price ||
      !newCourse.commission ||
      !newCourse.intro_video ||
      !newCourse.thumbnail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const course = new FormData();
    course.append("title", newCourse.title);
    course.append("description", newCourse.description);
    course.append("price", newCourse.price.toString());
    course.append("commission", newCourse.commission.toString());
    course.append("thumbnail", newCourse.thumbnail);
    course.append("visible", newCourse.visible.toString());
    course.append("intro_video", newCourse.intro_video);
    course.append("is_featured", newCourse.is_featured.toString());
    course.append("is_new", newCourse.is_new.toString());

    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.CREATE_COURSE,
      course,
      "application/form-data",
      authToken,
      "createCourse"
    );
    if (response.status === 200) {
      setCourses([response.data, ...courses]);
      toast.success("Course created successfully");
      setIsCreateDialogOpen(false);
      setNewCourse({
        title: "",
        description: "",
        price: 0,
        commission: 0,
        visible: false,
        is_featured: false,
        is_new: false,
      });
    }
  };

  const getCourses = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.ADMIN_LIST_COURSES(page, pageSize, search),
      null,
      "application/json",
      authToken,
      "listCourses"
    );
    if (response.status === 200) {
      setCourses(response.data.items);
      setPagination({
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
        total: response.data.total,
        totalPages: response.data.total_pages,
      });
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
        <h1 className="text-xl sm:text-2xl font-bold">Courses Management</h1>
        <Button
          size="sm"
          className="sm:text-base"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Create New Course
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
            {fetching && (fetchType == "listCourses" || !isFetched) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            )}
            {!fetching &&
              fetchType != "listCourses" &&
              courses.length > 0 &&
              courses.map((course) => (
                <CourseListItem
                  key={course.id}
                  course={course}
                  setCourses={setCourses}
                />
              ))}
            {!fetching &&
              fetchType != "listCourses" &&
              courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No courses found</p>
                      <p className="text-sm text-muted-foreground">
                        Create your first course to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
      {!(fetching || !isFetched) && courses.length != 0 && (
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
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newCourse.title}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, title: e.target.value })
                }
                placeholder="Enter ebook title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                placeholder="Enter ebook description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
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
                  value={newCourse.commission}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
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
                    setNewCourse({
                      ...newCourse,
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
                    setNewCourse({
                      ...newCourse,
                      intro_video: file,
                    });
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newCourse.visible}
                onCheckedChange={(checked) =>
                  setNewCourse({ ...newCourse, visible: checked })
                }
              />
              <Label>Visible</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newCourse.is_featured}
                onCheckedChange={(checked) =>
                  setNewCourse({ ...newCourse, is_featured: checked })
                }
              />
              <Label>Featured Course</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newCourse.is_new}
                onCheckedChange={(checked) =>
                  setNewCourse({ ...newCourse, is_new: checked })
                }
              />
              <Label>New Course</Label>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCourse}
                loading={fetchType == "createCourse" && fetching}
              >
                Create Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
