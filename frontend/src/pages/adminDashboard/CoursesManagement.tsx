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
import { Plus } from "lucide-react";
import { CourseListItem } from "@/components/CourseListItem";
import { Course } from "@/types/course";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

export default function CoursesManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    price: 0,
    commission: 0,
    visible: false,
  });
  const { makeApiCall, fetching, fetchType } = useAPICall();
  const { authToken } = useAuth();

  useEffect(() => {
    getCourses();
  }, []);

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
      });
    }
  };

  const getCourses = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.LIST_COURSES(1, 10),
      null,
      "application/json",
      authToken,
      "listCourses"
    );
    if (response.status === 200) {
      setCourses(response.data.items);
    }
  };
  console.log(courses);
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(
      courses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching && fetchType == "listCourses" && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            )}
            {!fetching &&
              fetchType != "listCourses" &&
              courses.map((course) => (
                <CourseListItem
                  key={course.id}
                  course={course}
                  setCourses={setCourses}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
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
                Create Ebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
