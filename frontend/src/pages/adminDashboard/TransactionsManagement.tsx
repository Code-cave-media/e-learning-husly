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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Transactions Management</h1>

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
            {dummyTransactions.map((transaction) => (
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Transaction Information</h3>
                  <p>ID: {selectedTransaction.transaction_id}</p>
                  <p>Order ID: {selectedTransaction.order_id}</p>
                  <p>Status: {selectedTransaction.status}</p>
                  <p>Method: {selectedTransaction.method}</p>
                  <p>
                    Amount: {formatCurrency(selectedTransaction.amount / 100)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>Email: {selectedTransaction.email}</p>
                  <p>Contact: {selectedTransaction.contact}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Purchase Details</h3>
                <p>Item Type: {selectedTransaction.purchase.item_type}</p>
                <p>Item Title: {selectedTransaction.purchase.item.title}</p>
                <p>
                  Price:{" "}
                  {formatCurrency(selectedTransaction.purchase.item.price)}
                </p>
                <p>
                  Purchased By:{" "}
                  {selectedTransaction.purchase.purchased_user.name}
                </p>
                {selectedTransaction.purchase.affiliate_user && (
                  <p>
                    Affiliate:{" "}
                    {selectedTransaction.purchase.affiliate_user.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
