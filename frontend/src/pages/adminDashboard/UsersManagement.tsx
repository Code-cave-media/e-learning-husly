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
  type: "regular" | "demo";
  affiliateData?: {
    cardCount: number;
    graphData: number[];
    pieChartData: { name: string; value: number }[];
  };
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
      name: "Demo User",
      email: "demo@example.com",
      type: "demo",
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
  const [formData, setFormData] = useState<Partial<User>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, ...formData } : user
        )
      );
    } else {
      setUsers([
        ...users,
        {
          id: Date.now().toString(),
          type: "demo",
          affiliateData: {
            cardCount: 0,
            graphData: [0, 0, 0, 0, 0, 0, 0],
            pieChartData: [
              { name: "Group A", value: 0 },
              { name: "Group B", value: 0 },
              { name: "Group C", value: 0 },
            ],
          },
          ...formData,
        } as User,
      ]);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users Management</CardTitle>
      </CardHeader>
      <CardContent>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.type === "demo" ? "bg-purple-500" : "bg-blue-500"
                    }
                  >
                    {user.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.type === "demo" ? user.affiliateData?.cardCount : "-"}
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
    </Card>
  );
};

export default UsersManagement;
