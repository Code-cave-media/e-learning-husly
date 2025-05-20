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
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";

// Dummy data
const dummyCourses = [
  { id: 1, title: "Web Development Bootcamp", price: 4999 },
  { id: 2, title: "Data Science Fundamentals", price: 5999 },
  { id: 3, title: "Mobile App Development", price: 6999 },
];

const dummyEbooks = [
  { id: 1, title: "Python Programming Guide", price: 999 },
  { id: 2, title: "JavaScript Mastery", price: 1499 },
  { id: 3, title: "UI/UX Design Principles", price: 1999 },
];

const dummyUsers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
];

const dummyPurchases = [
  {
    id: 1,
    item_type: "course",
    item: dummyCourses[0],
    purchased_user: dummyUsers[0],
    affiliate_user: dummyUsers[1],
    created_at: "2024-03-15T10:00:00Z",
  },
  {
    id: 2,
    item_type: "ebook",
    item: dummyEbooks[1],
    purchased_user: dummyUsers[2],
    created_at: "2024-03-14T15:30:00Z",
  },
];

interface Purchase {
  id: number;
  item_type: string;
  item: {
    id: number;
    title: string;
    price: number;
  };
  purchased_user: {
    id: number;
    name: string;
    email: string;
  };
  affiliate_user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
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
    item_type: "",
    item_id: 0,
    purchased_user_id: 0,
  });
  const [purchases, setPurchases] = useState<Purchase[]>(dummyPurchases);

  const handleCreatePurchase = () => {
    const selectedItem =
      newPurchase.item_type === "course"
        ? dummyCourses.find((c) => c.id === newPurchase.item_id)
        : dummyEbooks.find((e) => e.id === newPurchase.item_id);

    const purchasedUser = dummyUsers.find(
      (u) => u.id === newPurchase.purchased_user_id
    );
    const affiliateUser = newPurchase.affiliate_user_id
      ? dummyUsers.find((u) => u.id === newPurchase.affiliate_user_id)
      : undefined;

    if (!selectedItem || !purchasedUser) {
      toast.error("Please select all required fields");
      return;
    }

    const newPurchaseItem: Purchase = {
      id: purchases.length + 1,
      item_type: newPurchase.item_type,
      item: selectedItem,
      purchased_user: purchasedUser,
      affiliate_user: affiliateUser,
      created_at: new Date().toISOString(),
    };

    setPurchases([...purchases, newPurchaseItem]);
    setIsCreateDialogOpen(false);
    setNewPurchase({
      item_type: "",
      item_id: 0,
      purchased_user_id: 0,
    });
    toast.success("Purchase created successfully");
  };

  const resetForm = () => {
    setNewPurchase({
      item_type: "",
      item_id: 0,
      purchased_user_id: 0,
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchases Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create New Purchase
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Type</TableHead>
              <TableHead>Item Title</TableHead>
              <TableHead>Purchased By</TableHead>
              <TableHead>Affiliate</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.item_type}</TableCell>
                <TableCell>{purchase.item.title}</TableCell>
                <TableCell>{purchase.purchased_user.name}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Purchase Details Dialog */}
      <Dialog
        open={!!selectedPurchase}
        onOpenChange={() => setSelectedPurchase(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Item Information</h3>
                  <p>Type: {selectedPurchase.item_type}</p>
                  <p>Title: {selectedPurchase.item.title}</p>
                  <p>Price: {formatCurrency(selectedPurchase.item.price)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">User Information</h3>
                  <p>Purchased By: {selectedPurchase.purchased_user.name}</p>
                  <p>Email: {selectedPurchase.purchased_user.email}</p>
                  {selectedPurchase.affiliate_user && (
                    <>
                      <p>Affiliate: {selectedPurchase.affiliate_user.name}</p>
                      <p>
                        Affiliate Email: {selectedPurchase.affiliate_user.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Item Type
              </label>
              <Select
                value={newPurchase.item_type || ""}
                onValueChange={(value) =>
                  setNewPurchase({
                    ...newPurchase,
                    item_type: value,
                    item_id: 0,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="ebook">E-Book</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPurchase.item_type && (
              <div>
                <label className="block text-sm font-medium mb-1">Item</label>
                <Select
                  value={
                    newPurchase.item_id ? newPurchase.item_id.toString() : ""
                  }
                  onValueChange={(value) =>
                    setNewPurchase({ ...newPurchase, item_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {newPurchase.item_type === "course"
                      ? dummyCourses.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.title}
                          </SelectItem>
                        ))
                      : dummyEbooks.map((ebook) => (
                          <SelectItem
                            key={ebook.id}
                            value={ebook.id.toString()}
                          >
                            {ebook.title}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Purchased By
              </label>
              <Select
                value={
                  newPurchase.purchased_user_id
                    ? newPurchase.purchased_user_id.toString()
                    : ""
                }
                onValueChange={(value) =>
                  setNewPurchase({
                    ...newPurchase,
                    purchased_user_id: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {dummyUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Affiliate (Optional)
              </label>
              <Select
                value={newPurchase.affiliate_user_id?.toString() || ""}
                onValueChange={(value) =>
                  setNewPurchase({
                    ...newPurchase,
                    affiliate_user_id: value ? parseInt(value) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select affiliate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {dummyUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
