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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  User,
  Users,
  Calendar,
  BookOpen,
  FileText,
  Mail,
  Search,
  IndianRupee,
} from "lucide-react";

import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";
import { Loading } from "@/components/ui/loading";

interface LandingPage {
  id: number;
  main_heading: string;
  sub_heading: string;
  top_heading: string;
  highlight_words: string;
  thumbnail: string;
}

interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  pdf?: string;
  thumbnail: string;
  intro_video: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
  commission: number;
  landing_page: LandingPage;
  is_featured: boolean;
  is_new: boolean;
}

interface User {
  id: number;
  email: string;
  user_id: string;
  is_admin: boolean;
  phone: string;
  name: string;
}

interface Purchase {
  id: number;
  user_id: number | null;
  item_id: number;
  item_type: string;
  created_at: string;
  user: User;
  affiliate_user: User | null;
  item: Item;
}

interface PaginatedResponse {
  has_prev: boolean;
  has_next: boolean;
  total: number;
  items: Purchase[];
  total_pages: number;
  limit: number;
}

interface NewPurchase {
  item_type: string;
  item_id: number;
  purchased_user_id: number;
  affiliate_user_id?: number;
}

export default function PurchasesManagement() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState<NewPurchase>({
    item_type: "course",
    item_id: 0,
    purchased_user_id: 0,
    affiliate_user_id: undefined,
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const { makeApiCall, fetching, isFetched } = useAPICall();
  const { authToken } = useAuth();

  useEffect(() => {
    fetchPurchases();
  }, [currentPage]);

  const fetchPurchases = async () => {
    try {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.GET_ALL_PURCHASES(currentPage, 10, "all", searchQuery),
        {},
        "application/json",
        authToken,
        "fetchPurchases"
      );
      if (response.status === 200) {
        const data: PaginatedResponse = response.data;
        setPurchases(data.items);
        setTotalItems(data.total);
        setHasNext(data.has_next);
        setHasPrev(data.has_prev);
        setTotalPages(data.total_pages);
      }
    } catch (error) {
      toast.error("Failed to fetch purchases");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPurchases();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCreatePurchase = async () => {
    try {
      const response = await makeApiCall(
        "POST",
        API_ENDPOINT.CREATE_PURCHASE,
        newPurchase,
        "application/json",
        authToken,
        "createPurchase"
      );
      if (response.status === 201) {
        toast.success("Purchase created successfully");
        fetchPurchases();
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create purchase");
    }
  };

  const resetForm = () => {
    setNewPurchase({
      item_type: "course",
      item_id: 0,
      purchased_user_id: 0,
      affiliate_user_id: undefined,
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchases Management</h1>
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Type</TableHead>
              <TableHead>Item Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Purchased By</TableHead>
              <TableHead>Affiliate</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : isFetched && purchases.length == 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No purchases found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {purchase.item_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{purchase.item.title}</TableCell>
                  <TableCell>{formatCurrency(purchase.item.price)}</TableCell>
                  <TableCell>{purchase.user.name}</TableCell>
                  <TableCell>{purchase.affiliate_user?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPurchase(purchase)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Only show pagination if there are items */}
      {!fetching && purchases.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {purchases.length} of {totalItems} purchases
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedPurchase}
        onOpenChange={() => setSelectedPurchase(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              Purchase Details
            </DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-6 overflow-y-auto pr-2 max-h-[80vh]">
              {/* Item Information Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedPurchase.item_type === "course" ? (
                      <BookOpen className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                    Item Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Item Type</p>
                      <Badge variant="outline" className="capitalize">
                        {selectedPurchase.item_type}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Price
                      </p>
                      <p className="font-medium">
                        {formatCurrency(selectedPurchase.item.price)}
                      </p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">
                        {selectedPurchase.item.title}
                      </p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="font-medium">
                        {selectedPurchase.item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchaser Information Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Purchaser Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">
                          {selectedPurchase.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Purchaser Email
                        </p>
                        <p className="font-medium">
                          {selectedPurchase.user.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Phone
                        </p>
                        <p className="font-medium">
                          {selectedPurchase.user.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affiliate Information Card */}
              {selectedPurchase.affiliate_user && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Affiliate Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">
                            {selectedPurchase.affiliate_user.name}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Affiliate Email
                          </p>
                          <p className="font-medium">
                            {selectedPurchase.affiliate_user.email}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Phone
                          </p>
                          <p className="font-medium">
                            {selectedPurchase.affiliate_user.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Purchase Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Purchase Date
                    </p>
                    <p className="font-medium">
                      {new Date(selectedPurchase.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Purchase Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={resetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Type</label>
              <Select
                value={newPurchase.item_type}
                onValueChange={(value) =>
                  setNewPurchase({ ...newPurchase, item_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="ebook">Ebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Item ID</label>
              <Input
                type="number"
                value={newPurchase.item_id || ""}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    item_id: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter item ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                type="number"
                value={newPurchase.purchased_user_id || ""}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    purchased_user_id: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter user ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Affiliate User ID (Optional)
              </label>
              <Input
                type="number"
                value={newPurchase.affiliate_user_id || ""}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    affiliate_user_id: parseInt(e.target.value) || undefined,
                  })
                }
                placeholder="Enter affiliate user ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleCreatePurchase}>Create Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
