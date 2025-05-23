import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "regular" | "partner";
  affiliateData?: {
    cardCount: number;
    graphData: number[];
    pieChartData: { name: string; value: number }[];
  };
  phone?: string;
}

// Add a type for form data that extends Partial<User> with password
interface UserFormData extends Partial<User> {
  password?: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      type: "regular",
    },
    {
      id: "2",
      name: "partner User",
      email: "partner@example.com",
      type: "partner",
      affiliateData: {
        cardCount: 5,
        graphData: [30, 40, 35, 50, 49, 60, 70],
        pieChartData: [
          { name: "Group A", value: 400 },
          { name: "Group B", value: 300 },
          { name: "Group C", value: 300 },
        ],
      },
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({});
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, ...formData } : user
        )
      );
    }
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // Filter users by name, email, or phone
  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone?.toLowerCase() || "").includes(query)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Card Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.type === "partner" ? "bg-purple-500" : "bg-blue-500"
                    }
                  >
                    {user.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.type === "partner"
                    ? user.affiliateData?.cardCount
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="New Password"
              type="password"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UsersManagement;
