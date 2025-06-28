import { useEffect, useState } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { toast } from "react-hot-toast";
import { Loading } from "@/components/ui/loading";
import Pagination from "@/components/Pagination";

interface User {
  id: number;
  name: string;
  email: string;
  user_id: string;
  is_admin: boolean;
  phone: string;
  has_dummy_purchase: boolean;
}

interface UserFormData {
  password?: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  const { authToken } = useAuth();
  const { fetchType, fetching, makeApiCall } = useAPICall();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_ALL_USERS(currentPage, pageSize, searchQuery),
      {},
      "application/json",
      authToken,
      "fetchUsers"
    );
    if (response.status === 200) {
      setUsers(response.data.items);
      setHasNext(response.data.has_next);
      setHasPrev(response.data.has_prev);
      setTotalItems(response.data.total);
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUser || !formData.password) return;

    const response = await makeApiCall(
      "PUT",
      API_ENDPOINT.UPDATE_USER_PASSWORD(selectedUser.id.toString()),
      { password: formData.password },
      "application/json",
      authToken,
      "updatePassword"
    );

    if (response.status === 200) {
      toast.success("Password updated successfully");
      setIsDialogOpen(false);
      setSelectedUser(null);
      setFormData({});
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl">
            Users Management
          </CardTitle>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center flex-1 sm:flex-none">
              <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, user_id, or phone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 w-full sm:w-[300px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                    setCurrentPage(1);
                    fetchUsers();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2"
                onClick={() => {
                  setSearchQuery(searchInput);
                  setCurrentPage(1);
                  fetchUsers();
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dummy Purchase</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching && fetchType === "fetchUsers" ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loading />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.is_admin ? "bg-purple-500" : "bg-blue-500"
                        }
                      >
                        {user.is_admin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.has_dummy_purchase
                            ? "bg-green-500"
                            : "bg-red-500"
                        }
                      >
                        {user.has_dummy_purchase ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!fetching && users.length > 0 && (
            <Pagination
              currentPage={currentPage}
              hasNext={hasNext}
              hasPrev={hasPrev}
              total={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemsSize={users.length}
            />
          )}
        </CardContent>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Password</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="New Password"
                type="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={fetching && fetchType === "updatePassword"}
                >
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default UsersManagement;
