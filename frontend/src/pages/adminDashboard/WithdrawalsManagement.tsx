import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  User as UserIcon,
  Banknote,
  Calendar,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  reason?: string;
  date: string;
  upi?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
}

const WithdrawalsManagement = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      amount: 150.0,
      status: "pending",
      date: "2024-03-15",
      upi: "john@upi",
    },
    {
      id: "2",
      userId: "partner2",
      userName: "Jane Partner",
      amount: 300.0,
      status: "paid",
      date: "2024-03-10",
      bankName: "HDFC Bank",
      accountNumber: "1234567890",
      ifsc: "HDFC0001234",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [reason, setReason] = useState("");

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsWithdrawal, setDetailsWithdrawal] = useState<Withdrawal | null>(
    null
  );

  const handleStatusChange = (
    withdrawal: Withdrawal,
    newStatus: Withdrawal["status"]
  ) => {
    if (newStatus === "failed" && !reason) {
      setSelectedWithdrawal(withdrawal);
      setIsDialogOpen(true);
      return;
    }

    setWithdrawals(
      withdrawals.map((w) =>
        w.id === withdrawal.id
          ? {
              ...w,
              status: newStatus,
              ...(newStatus === "failed" ? { reason } : {}),
            }
          : w
      )
    );
    setIsDialogOpen(false);
    setReason("");
  };

  const getStatusColor = (status: Withdrawal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "paid":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawals Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>{withdrawal.userName}</TableCell>
                <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                <TableCell>{withdrawal.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(withdrawal.status)}>
                    {withdrawal.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDetailsWithdrawal(withdrawal);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Select
                      onValueChange={(value) =>
                        handleStatusChange(
                          withdrawal,
                          value as Withdrawal["status"]
                        )
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Failure Reason Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Failure Reason</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for withdrawal failure..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              <Button
                onClick={() => {
                  if (selectedWithdrawal && reason) {
                    handleStatusChange(selectedWithdrawal, "failed");
                  }
                }}
                disabled={!reason}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdrawal Details</DialogTitle>
            </DialogHeader>
            {detailsWithdrawal && (
              <div className="space-y-6">
                {/* Amount & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 " />
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium text-lg">
                        ${detailsWithdrawal.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 " />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        className={getStatusColor(detailsWithdrawal.status)}
                      >
                        {detailsWithdrawal.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* User Info */}
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 " />
                  <div>
                    <p className="text-sm text-muted-foreground">User</p>
                    <p className="font-medium">{detailsWithdrawal.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 " />
                  <div>
                    <p className="text-sm text-muted-foreground">User Type</p>
                    <p className="font-medium">
                      {detailsWithdrawal.userId.startsWith("partner")
                        ? "Partner"
                        : "Regular"}
                    </p>
                  </div>
                </div>
                {/* Payment Details */}
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 " />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Details
                    </p>
                    <div className="font-medium">
                      {detailsWithdrawal.upi ? (
                        <>UPI: {detailsWithdrawal.upi}</>
                      ) : detailsWithdrawal.bankName ? (
                        <>
                          Bank: {detailsWithdrawal.bankName} <br />
                          Account: {detailsWithdrawal.accountNumber} <br />
                          IFSC: {detailsWithdrawal.ifsc}
                        </>
                      ) : (
                        <>-</>
                      )}
                    </div>
                  </div>
                </div>
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 " />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{detailsWithdrawal.date}</p>
                  </div>
                </div>
                {/* Failure Reason */}
                {detailsWithdrawal.reason && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Failure Reason
                      </p>
                      <p className="font-medium">{detailsWithdrawal.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WithdrawalsManagement;
