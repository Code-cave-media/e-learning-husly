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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Coupon {
  id: number;
  code: string;
  type: "percent" | "fixed";
  discount: number;
  max_access: number;
  total_accessed: number;
  visible: boolean;
}

const dummyCoupons: Coupon[] = [
  {
    id: 1,
    code: "WELCOME10",
    type: "percent",
    discount: 10,
    max_access: 100,
    total_accessed: 25,
    visible: true,
  },
  {
    id: 2,
    code: "FLAT500",
    type: "fixed",
    discount: 500,
    max_access: 50,
    total_accessed: 10,
    visible: false,
  },
];

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>(dummyCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Omit<Coupon, "id" | "total_accessed">>({
    code: "",
    type: "percent",
    discount: 0,
    max_access: 1,
    visible: true,
  });

  const openAddDialog = () => {
    setIsEdit(false);
    setForm({
      code: "",
      type: "percent",
      discount: 0,
      max_access: 1,
      visible: true,
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
      max_access: coupon.max_access,
      visible: coupon.visible,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  const handleDialogSubmit = () => {
    if (isEdit && selectedCoupon) {
      setCoupons(
        coupons.map((c) => (c.id === selectedCoupon.id ? { ...c, ...form } : c))
      );
    } else {
      setCoupons([
        ...coupons,
        {
          id: coupons.length + 1,
          ...form,
          total_accessed: 0,
        },
      ]);
    }
    setIsDialogOpen(false);
    setSelectedCoupon(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Code Management</h1>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Max Access</TableHead>
              <TableHead>Total Accessed</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.code}</TableCell>
                <TableCell className="capitalize">{coupon.type}</TableCell>
                <TableCell>
                  {coupon.type === "percent"
                    ? `${coupon.discount}%`
                    : `₹${coupon.discount}`}
                </TableCell>
                <TableCell>{coupon.max_access}</TableCell>
                <TableCell>{coupon.total_accessed}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      coupon.visible
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.visible ? "Visible" : "Hidden"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(coupon)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(coupon.id)}
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
                  setForm({ ...form, type: value as "percent" | "fixed" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
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
                Max access
              </label>
              <Input
                type="number"
                placeholder="Max Access"
                value={form.max_access}
                onChange={(e) =>
                  setForm({ ...form, max_access: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.visible}
                onCheckedChange={(checked) =>
                  setForm({ ...form, visible: checked })
                }
                id="visible-switch"
              />
              <label htmlFor="visible-switch" className="text-sm">
                Visible
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDialogSubmit}>
              {isEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
