import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, Eye } from "lucide-react";

interface Course {
  id: number;
  type: string;
  title: string;
  description: string;
  total_hours: number;
  level: string;
  commission: number;
  price: number;
  thumbnail: File | null;
  thumbnailUrl: string;
  visible: boolean;
}

// Dummy data for course types and levels
const courseTypes = [
  "Digital Marketing",
  "Web Development",
  "Data Science",
  "Mobile Development",
  "UI/UX Design",
];

const courseLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Beginner to Advanced",
];

// Dummy courses data
const dummyCourses: Course[] = [
  {
    id: 1,
    type: "Digital Marketing",
    title: "Digital Marketing Masterclass",
    description: "Learn digital marketing from scratch to advanced level",
    total_hours: 20,
    level: "Beginner to Advanced",
    commission: 10,
    price: 4999,
    thumbnail: null,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    visible: true,
  },
  {
    id: 2,
    type: "Web Development",
    title: "Full Stack Web Development",
    description:
      "Master modern web development with React, Node.js, and MongoDB",
    total_hours: 30,
    level: "Intermediate",
    commission: 15,
    price: 6999,
    thumbnail: null,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    visible: true,
  },
  {
    id: 3,
    type: "Data Science",
    title: "Data Science Bootcamp",
    description: "Learn data analysis, machine learning, and AI fundamentals",
    total_hours: 25,
    level: "Advanced",
    commission: 12,
    price: 7999,
    thumbnail: null,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    visible: false,
  },
];

export default function CoursesManagement() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(dummyCourses);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    type: "",
    title: "",
    description: "",
    total_hours: 0,
    level: "",
    commission: 0,
    price: 0,
    visible: true,
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  const handleCreateCourse = () => {
    if (
      !newCourse.type ||
      !newCourse.title ||
      !newCourse.description ||
      !newCourse.level
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const course: Course = {
      id: courses.length + 1,
      type: newCourse.type,
      title: newCourse.title,
      description: newCourse.description,
      total_hours: newCourse.total_hours || 0,
      level: newCourse.level,
      commission: newCourse.commission || 0,
      price: newCourse.price || 0,
      thumbnail: null,
      thumbnailUrl: "",
      visible: newCourse.visible || false,
    };

    setCourses([...courses, course]);
    setIsCreateDialogOpen(false);
    setNewCourse({
      type: "",
      title: "",
      description: "",
      total_hours: 0,
      level: "",
      commission: 0,
      price: 0,
      visible: true,
    });
    toast.success("Course created successfully");
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;

    setCourses(
      courses.map((course) =>
        course.id === editingCourse.id ? editingCourse : course
      )
    );
    setIsEditDialogOpen(false);
    setEditingCourse(null);
    toast.success("Course updated successfully");
  };

  const handleDelete = (id: number) => {
    setCourseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter((course) => course.id !== courseToDelete));
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
      toast.success("Course deleted successfully");
    }
  };

  const handleView = (courseId: number) => {
    navigate(`/course/${courseId}?admin=true`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Course
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="flex items-center gap-2">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  {course.title}
                </TableCell>
                <TableCell>{course.type}</TableCell>
                <TableCell>{course.level}</TableCell>
                <TableCell>{course.total_hours} hours</TableCell>
                <TableCell>{formatCurrency(course.price)}</TableCell>
                <TableCell>{course.commission}%</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      course.visible
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {course.visible ? "Visible" : "Hidden"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleView(course.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Course Type</Label>
                <Select
                  value={newCourse.type}
                  onValueChange={(value) =>
                    setNewCourse({ ...newCourse, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Course Level</Label>
                <Select
                  value={newCourse.level}
                  onValueChange={(value) =>
                    setNewCourse({ ...newCourse, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={newCourse.title}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, title: e.target.value })
                }
                placeholder="Enter course title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                placeholder="Enter course description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Hours</Label>
                <Input
                  type="number"
                  value={newCourse.total_hours}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      total_hours: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter total hours"
                />
              </div>
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
            <div className="flex items-center space-x-2">
              <Switch
                checked={newCourse.visible}
                onCheckedChange={(checked) =>
                  setNewCourse({ ...newCourse, visible: checked })
                }
              />
              <Label>Visible</Label>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>Create Course</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Type</Label>
                  <Select
                    value={editingCourse.type}
                    onValueChange={(value) =>
                      setEditingCourse({ ...editingCourse, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Course Level</Label>
                  <Select
                    value={editingCourse.level}
                    onValueChange={(value) =>
                      setEditingCourse({ ...editingCourse, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={editingCourse.title}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingCourse.description}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Hours</Label>
                  <Input
                    type="number"
                    value={editingCourse.total_hours}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        total_hours: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={editingCourse.price}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        price: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Commission (%)</Label>
                <Input
                  type="number"
                  value={editingCourse.commission}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      commission: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingCourse.visible}
                  onCheckedChange={(checked) =>
                    setEditingCourse({ ...editingCourse, visible: checked })
                  }
                />
                <Label>Visible</Label>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateCourse}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this course? This action cannot be
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
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
