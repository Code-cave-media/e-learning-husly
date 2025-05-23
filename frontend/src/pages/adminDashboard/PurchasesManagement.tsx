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
} from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Combobox } from "@/components/ui/combobox";

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
    item_type: "course",
    item_id: 0,
    purchased_user_id: 0,
    affiliate_user_id: undefined,
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
      item_type: "course",
      item_id: 0,
      purchased_user_id: 0,
      affiliate_user_id: undefined,
    });
    toast.success("Purchase created successfully");
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

      <Dialog
        open={!!selectedPurchase}
        onOpenChange={() => setSelectedPurchase(null)}
      >
        <DialogContent className="">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              Purchase Details
            </DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-6 overflow-y-auto pr-2">
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
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(selectedPurchase.item.price)}
                      </p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">
                        {selectedPurchase.item.title}
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
                          {selectedPurchase.purchased_user.name}
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
                          {selectedPurchase.purchased_user.email}
                        </p>
                      </div>
                      {selectedPurchase.affiliate_user && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Affiliate Email
                          </p>
                          <p className="font-medium">
                            {selectedPurchase.affiliate_user.email}
                          </p>
                        </div>
                      )}
                    </div>
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
            {/* Course Combobox */}
            <Combobox
              label="Course"
              options={dummyCourses.map((course) => ({
                value: course.id.toString(),
                label: course.title,
              }))}
              value={newPurchase.item_id ? newPurchase.item_id.toString() : ""}
              onChange={(val) =>
                setNewPurchase({ ...newPurchase, item_id: parseInt(val) })
              }
              placeholder="Select course"
            />
            {/* Purchased User Combobox */}
            <Combobox
              label="Purchased User"
              options={dummyUsers.map((user) => ({
                value: user.id.toString(),
                label: user.name,
              }))}
              value={
                newPurchase.purchased_user_id
                  ? newPurchase.purchased_user_id.toString()
                  : ""
              }
              onChange={(val) =>
                setNewPurchase({
                  ...newPurchase,
                  purchased_user_id: parseInt(val),
                })
              }
              placeholder="Select user"
            />
            {/* Affiliate User Combobox */}
            <Combobox
              label="Affiliate User (Optional)"
              options={[
                { value: "none", label: "None" },
                ...dummyUsers.map((user) => ({
                  value: user.id.toString(),
                  label: user.name,
                })),
              ]}
              value={
                typeof newPurchase.affiliate_user_id === "number"
                  ? newPurchase.affiliate_user_id.toString()
                  : "none"
              }
              onChange={(val) =>
                setNewPurchase({
                  ...newPurchase,
                  affiliate_user_id: val === "none" ? undefined : parseInt(val),
                })
              }
              placeholder="Select affiliate"
            />
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
