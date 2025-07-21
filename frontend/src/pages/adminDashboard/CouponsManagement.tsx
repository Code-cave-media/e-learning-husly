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
import { Plus, Pencil, Trash2, Search, Filter, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { toast } from "react-hot-toast";
import { Loading } from "@/components/ui/loading";
import Pagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Coupon {
  id: number;
  type: "percentage" | "flat";
  discount: number;
  min_purchase: number;
  code: string;
  no_of_access: number;
  used: number;
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const { authToken } = useAuth();
  const { fetchType, fetching, makeApiCall,isFetched } = useAPICall();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState<Omit<Coupon, "id" | "used">>({
    code: "",
    type: "percentage",
    discount: 0,
    min_purchase: 0,
    no_of_access: 1,
  });

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, typeFilter, searchQuery]);

  const fetchCoupons = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_ALL_COUPONS(
        currentPage,
        pageSize,
        typeFilter,
        searchQuery
      ),
      {},
      "application/json",
      authToken,
      "fetchCoupons"
    );
    if (response.status === 200) {
      setCoupons(response.data.items);
      setHasNext(response.data.has_next);
      setHasPrev(response.data.has_prev);
      setTotalItems(response.data.total);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const openAddDialog = () => {
    setIsEdit(false);
    setForm({
      code: "",
      type: "percentage",
      discount: 0,
      min_purchase: 0,
      no_of_access: 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setIsEdit(true);
    setSelectedCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      min_purchase: coupon.min_purchase,
      no_of_access: coupon.no_of_access,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const response = await makeApiCall(
      "DELETE",
      API_ENDPOINT.DELETE_COUPON(id),
      {},
      "application/json",
      authToken,
      "deleteCoupon"
    );
    if (response.status === 200) {
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    }
  };

  const handleUpdate = async () => {
    if (!selectedCoupon) return;
    if (form.type === "percentage" && form.discount > 100) {
      toast.error("Discount cannot be greater than 100%");
      return;
    }
    if (form.type == "flat" && form.discount > form.min_purchase) {
      toast.error("Discount cannot be greater than minimum purchase");
      return;
    }
    const response = await makeApiCall(
      "PUT",
      API_ENDPOINT.UPDATE_COUPON(selectedCoupon.id),
      form,
      "application/json",
      authToken,
      "updateCoupon"
    );
    if (response.status === 200) {
      setIsDialogOpen(false);
      setCoupons(
        coupons.map((coupon) =>
          coupon.id === selectedCoupon.id ? response.data : coupon
        )
      );
      toast.success("Coupon updated successfully");
    }
  };

  const handleCreate = async () => {
    if (form.type === "percentage" && form.discount > 100) {
      toast.error("Discount cannot be greater than 100%");
      return;
    }
    if (form.type == "flat" && form.discount > form.min_purchase) {
      toast.error("Discount cannot be greater than minimum purchase");
      return;
    }
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.CREATE_COUPON,
      form,
      "application/json",
      authToken,
      "createCoupon"
    );
    if (response.status === 200) {
      toast.success("Coupon created successfully");
      setIsDialogOpen(false);
      setCoupons([...coupons, response.data]);
    }
  };

  const handleDialogSubmit = async () => {
    if (isEdit && selectedCoupon) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Coupons Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by coupon code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 w-full sm:w-[300px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput);
                  setCurrentPage(1);
                  fetchCoupons();
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="right-2 hover:bg-inherit"
              onClick={() => {
                setSearchQuery(searchInput);
                setCurrentPage(1);
                fetchCoupons();
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 capitalize whitespace-nowrap"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                {typeFilter === "all"
                  ? "All Types"
                  : `Type: ${
                      typeFilter === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"
                    }`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("percentage")}>
                Percentage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("flat")}>
                Fixed Amount
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="sm:text-base"
            onClick={() => openAddDialog()}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add New Coupon
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching && (fetchType === "fetchCoupons"||!isFetched) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No coupons found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `No coupons matching "${searchQuery}"`
                        : "Create your first coupon to get started."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell className="capitalize">{coupon.type}</TableCell>
                  <TableCell>
                    {coupon.type === "percentage"
                      ? `${coupon.discount}%`
                      : `₹${coupon.discount}`}
                  </TableCell>
                  <TableCell>₹{coupon.min_purchase}</TableCell>
                  <TableCell>{coupon.used}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(coupon)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!fetching && coupons.length > 0 && (
          <Pagination
            currentPage={currentPage}
            hasNext={hasNext}
            hasPrev={hasPrev}
            total={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemsSize={coupons.length}
          />
        )}
      </div>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Coupon Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as "percentage" | "flat" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount</label>
              <Input
                type="number"
                placeholder="Discount"
                value={form.discount}
                onChange={(e) =>
                  setForm({ ...form, discount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Purchase
              </label>
              <Input
                type="number"
                placeholder="Minimum Purchase"
                value={form.min_purchase}
                onChange={(e) =>
                  setForm({ ...form, min_purchase: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Maximum Access
              </label>
              <Input
                type="number"
                placeholder="Maximum Access"
                value={form.no_of_access}
                onChange={(e) =>
                  setForm({ ...form, no_of_access: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={
                fetching &&
                (fetchType === "createCoupon" || fetchType === "updateCoupon")
              }
              onClick={handleDialogSubmit}
            >
              {isEdit ? "Update" : "Add"} Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
