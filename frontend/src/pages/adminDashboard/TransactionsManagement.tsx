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
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  User,
  CreditCard,
  Calendar,
  Package,
  Users,
  Mail,
  Phone,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dummy data
const dummyTransactions = [
  {
    id: 1,
    transaction_id: "txn_123456789",
    order_id: "order_123456789",
    status: "captured",
    provider: "razorpay",
    method: "upi",
    amount: 499900,
    currency: "INR",
    email: "john@example.com",
    contact: "+919876543210",
    created_at: "2024-03-15T10:00:00Z",
    purchase: {
      id: 1,
      item_type: "course",
      item: {
        title: "Web Development Bootcamp",
        price: 4999,
      },
      purchased_user: {
        name: "John Doe",
        email: "john@example.com",
      },
      affiliate_user: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
    },
  },
  {
    id: 2,
    transaction_id: "txn_987654321",
    order_id: "order_987654321",
    status: "failed",
    provider: "razorpay",
    method: "card",
    amount: 149900,
    currency: "INR",
    email: "bob@example.com",
    contact: "+919876543211",
    created_at: "2024-03-14T15:30:00Z",
    purchase: {
      id: 2,
      item_type: "ebook",
      item: {
        title: "JavaScript Mastery",
        price: 1499,
      },
      purchased_user: {
        name: "Bob Johnson",
        email: "bob@example.com",
      },
    },
  },
];

interface Transaction {
  id: number;
  transaction_id: string;
  order_id: string;
  status: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  email: string;
  contact: string;
  created_at: string;
  purchase: {
    id: number;
    item_type: string;
    item: {
      title: string;
      price: number;
    };
    purchased_user: {
      name: string;
      email: string;
    };
    affiliate_user?: {
      name: string;
      email: string;
    };
  };
}

export default function TransactionsManagement() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredTransactions = dummyTransactions.filter((transaction) => {
    if (!statusFilter) return true;
    return transaction.status === statusFilter;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions Management</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {statusFilter ? `Status: ${statusFilter}` : "Filter by Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Transactions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("captured")}>
              Success
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
              Failed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.transaction_id}</TableCell>
                <TableCell>{transaction.order_id}</TableCell>
                <TableCell>
                  {formatCurrency(transaction.amount / 100)}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === "captured"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransaction(transaction)}
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
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 overflow-y-auto pr-2">
              {/* Transaction Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Transaction Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Transaction ID
                      </p>
                      <p className="font-medium">
                        {selectedTransaction.transaction_id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-medium">
                        {selectedTransaction.order_id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant={
                          selectedTransaction.status === "captured"
                            ? "default"
                            : "destructive"
                        }
                        className={`capitalize ${
                          selectedTransaction.status === "captured"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }`}
                      >
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Payment Method
                      </p>
                      <p className="font-medium capitalize">
                        {selectedTransaction.method}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(selectedTransaction.amount / 100)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(
                          selectedTransaction.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Email
                      </p>
                      <p className="font-medium">{selectedTransaction.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Contact
                      </p>
                      <p className="font-medium">
                        {selectedTransaction.contact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Purchase Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Item Type
                        </p>
                        <Badge variant="outline" className="capitalize">
                          {selectedTransaction.purchase.item_type}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">
                          {formatCurrency(
                            selectedTransaction.purchase.item.price
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Item Title
                      </p>
                      <p className="font-medium">
                        {selectedTransaction.purchase.item.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Information Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Purchased By
                      </p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">
                          {selectedTransaction.purchase.purchased_user.name} (
                          {selectedTransaction.purchase.purchased_user.email})
                        </p>
                      </div>
                    </div>
                    {selectedTransaction.purchase.affiliate_user && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Affiliate
                        </p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">
                            {selectedTransaction.purchase.affiliate_user.name} (
                            {selectedTransaction.purchase.affiliate_user.email})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
