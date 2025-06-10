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
  DialogDescription,
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
  Check,
  Loader2,
  Filter,
  AlertCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";
import { Loading } from "@/components/ui/loading";
import Pagination from "@/components/Pagination";

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

interface Transaction {
  transaction_id: string;
  order_id: string;
  status: string;
  method: string;
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
  transaction: Transaction;
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
  item_id: string;
  item_type: string;
  purchased_user_id: string;
  affiliate_user_id?: string;
}

interface VerificationData {
  item?: {
    verified: boolean;
    data?: {
      id: string;
      title: string;
      type: string;
    };
  };
  user?: {
    verified: boolean;
    data?: {
      id: string;
      name: string;
      email: string;
    };
  };
  affiliate?: {
    verified: boolean;
    data?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function PurchasesManagement() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState<NewPurchase>({
    item_id: "",
    item_type: "course",
    purchased_user_id: "",
    affiliate_user_id: undefined,
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const { makeApiCall, fetching, isFetched, fetchType } = useAPICall();
  const { authToken } = useAuth();
  const pageSize = 20;
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationData>({
      item: { verified: false },
      user: { verified: false },
      affiliate: { verified: false },
    });
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchPurchases();
  }, [currentPage, itemTypeFilter]);

  const fetchPurchases = async () => {
    try {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.GET_ALL_PURCHASES(
          currentPage,
          pageSize,
          itemTypeFilter,
          searchQuery
        ),
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const verifyItem = async (itemId: string, itemType: string) => {
    try {
      setIsVerifying(true);
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.VERIFY_ITEM(itemType, itemId),
        {},
        "application/json",
        authToken
      );

      if (response.status === 200) {
        setVerificationStatus((prev) => ({
          ...prev,
          item: { verified: true, data: response.data },
        }));
        toast.success("Item verified successfully");
      } else {
        setVerificationStatus((prev) => ({
          ...prev,
          item: { verified: false },
        }));
        toast.error("Item not found");
      }
    } catch (error) {
      setVerificationStatus((prev) => ({
        ...prev,
        item: { verified: false },
      }));
      toast.error("Failed to verify item");
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      setIsVerifying(true);
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.CREATE_PURCHASE_VERIFY_USER(userId),
        {},
        "application/json",
        authToken
      );

      if (response.status === 200) {
        setVerificationStatus((prev) => ({
          ...prev,
          user: { verified: true, data: response.data },
        }));
        toast.success("User verified successfully");
      } else {
        setVerificationStatus((prev) => ({
          ...prev,
          user: { verified: false },
        }));
        toast.error("User not found");
      }
    } catch (error) {
      setVerificationStatus((prev) => ({
        ...prev,
        user: { verified: false },
      }));
      toast.error("Failed to verify user");
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyAffiliate = async (userId: string) => {
    try {
      setIsVerifying(true);
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.CREATE_PURCHASE_VERIFY_USER(userId),
        {},
        "application/json",
        authToken
      );

      if (response.status === 200) {
        setVerificationStatus((prev) => ({
          ...prev,
          affiliate: { verified: true, data: response.data },
        }));
        toast.success("Affiliate user verified successfully");
      } else {
        setVerificationStatus((prev) => ({
          ...prev,
          affiliate: { verified: false },
        }));
        toast.error("Affiliate user not found");
      }
    } catch (error) {
      setVerificationStatus((prev) => ({
        ...prev,
        affiliate: { verified: false },
      }));
      toast.error("Failed to verify affiliate user");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newPurchase.affiliate_user_id);
    if (
      (newPurchase.affiliate_user_id &&
        !verificationStatus.affiliate?.verified) ||
      (newPurchase.purchased_user_id && !verificationStatus.user?.verified) ||
      !verificationStatus.item?.verified
    ) {
      toast.error("Please verify all required fields before creating purchase");
      return;
    }
    if (
      !verificationStatus.affiliate?.verified &&
      !verificationStatus.user?.verified
    ) {
      toast.error("Please verify either Affiliate or Purchased User");
      return;
    }
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.CREATE_PURCHASE,
      {
        item_id: newPurchase.item_id,
        item_type: newPurchase.item_type,
        user_id: newPurchase.purchased_user_id,
        affiliate_user_id: newPurchase.affiliate_user_id,
      },
      "application/json",
      authToken,
      "createPurchase"
    );

    if (response.status === 200) {
      toast.success("Purchase created successfully");
      setIsCreateDialogOpen(false);
      setPurchases([response.data, ...purchases]);
      setNewPurchase({
        item_id: "",
        item_type: "course",
        purchased_user_id: "",
        affiliate_user_id: undefined,
      });
      setVerificationStatus({});
    } else {
      toast.error("Failed to create purchase");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchases Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Purchase ID..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 w-[300px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2"
              onClick={() => {
                setCurrentPage(1);
                fetchPurchases();
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 capitalize"
              >
                <Filter className="w-4 h-4" />
                {itemTypeFilter === "all"
                  ? "All Items"
                  : `Type: ${
                      itemTypeFilter === "ebook"
                        ? "Blueprints"
                        : itemTypeFilter === "course"
                        ? "Trainings"
                        : "Dummy"
                    }`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setItemTypeFilter("all")}>
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemTypeFilter("ebook")}>
                Blueprints
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemTypeFilter("course")}>
                Trainings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemTypeFilter("dummy")}>
                Dummy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Purchase
          </Button>
        </div>
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
            {fetching && fetchType === "fetchPurchases" ? (
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
                  <TableCell>{purchase?.user?.name}</TableCell>
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
        <Pagination
          currentPage={currentPage}
          hasNext={hasNext}
          hasPrev={hasPrev}
          total={totalItems}
          pageSize={pageSize}
          itemsSize={purchases.length}
          onPageChange={handlePageChange}
        />
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
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPurchase.user ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Purchased User
                        </p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">
                            {selectedPurchase.user.name}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedPurchase.user.email}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Purchased User
                        </p>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Not available</p>
                        </div>
                      </div>
                    )}
                    {selectedPurchase.affiliate_user ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Affiliate User
                        </p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">
                            {selectedPurchase.affiliate_user.name}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedPurchase.affiliate_user.email}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Affiliate User
                        </p>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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

              {/* Transaction Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Transaction Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPurchase.transaction ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Transaction ID
                        </p>
                        <p className="font-medium">
                          {selectedPurchase.transaction.transaction_id}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Order ID
                        </p>
                        <p className="font-medium">
                          {selectedPurchase.transaction.order_id}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={
                            selectedPurchase.transaction.status === "captured"
                              ? "default"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {selectedPurchase.transaction.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Payment Method
                        </p>
                        <Badge variant="outline" className="capitalize">
                          {selectedPurchase.transaction.method}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          No transaction details available
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Purchase Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Purchase</DialogTitle>
            <DialogDescription>
              Create a new purchase record for a user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePurchase}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item_type">Item Type</Label>
                <Select
                  value={newPurchase.item_type}
                  onValueChange={(value) => {
                    setNewPurchase((prev) => ({ ...prev, item_type: value }));
                    setVerificationStatus((prev) => ({
                      ...prev,
                      item: undefined,
                    }));
                  }}
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

              <div className="grid gap-2">
                <Label htmlFor="item_id">Item ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="item_id"
                    value={newPurchase.item_id}
                    onChange={(e) => {
                      setNewPurchase((prev) => ({
                        ...prev,
                        item_id: e.target.value,
                      }));
                      setVerificationStatus((prev) => ({
                        ...prev,
                        item: {
                          verified: false,
                          data: undefined,
                        },
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPurchase.item_id) {
                        e.preventDefault();
                        verifyItem(newPurchase.item_id, newPurchase.item_type);
                      }
                    }}
                    placeholder="Enter item ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      verifyItem(newPurchase.item_id, newPurchase.item_type)
                    }
                    disabled={!newPurchase.item_id || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : verificationStatus.item?.verified ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {verificationStatus.item?.data && (
                  <p className="text-sm text-green-500">
                    Verified: {verificationStatus.item.data.title}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="user_id">User ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="user_id"
                    value={newPurchase.purchased_user_id}
                    onChange={(e) => {
                      setNewPurchase((prev) => ({
                        ...prev,
                        purchased_user_id: e.target.value,
                      }));
                      setVerificationStatus((prev) => ({
                        ...prev,
                        user: {
                          verified: false,
                          data: undefined,
                        },
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPurchase.purchased_user_id) {
                        e.preventDefault();
                        verifyUser(newPurchase.purchased_user_id);
                      }
                    }}
                    placeholder="Enter user ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => verifyUser(newPurchase.purchased_user_id)}
                    disabled={!newPurchase.purchased_user_id || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : verificationStatus.user?.verified ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {verificationStatus.user?.data && (
                  <p className="text-sm text-green-500">
                    Verified: {verificationStatus.user.data.name}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="affiliate_user_id">Affiliate User ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="affiliate_user_id"
                    value={newPurchase.affiliate_user_id}
                    onChange={(e) => {
                      setNewPurchase((prev) => ({
                        ...prev,
                        affiliate_user_id: e.target.value,
                      }));
                      setVerificationStatus((prev) => ({
                        ...prev,
                        affiliate: {
                          verified: false,
                          data: undefined,
                        },
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPurchase.affiliate_user_id) {
                        e.preventDefault();
                        verifyAffiliate(newPurchase.affiliate_user_id);
                      }
                    }}
                    placeholder="Enter affiliate user ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      verifyAffiliate(newPurchase.affiliate_user_id)
                    }
                    disabled={!newPurchase.affiliate_user_id || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : verificationStatus.affiliate?.verified ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {verificationStatus.affiliate?.data && (
                  <p className="text-sm text-green-500">
                    Verified: {verificationStatus.affiliate.data.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                loading={fetching && fetchType === "createPurchase"}
                type="submit"
              >
                Create Purchase
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
