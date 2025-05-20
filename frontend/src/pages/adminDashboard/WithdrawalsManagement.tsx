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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  reason?: string;
  date: string;
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
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [reason, setReason] = useState("");

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
      </CardContent>
    </Card>
  );
};

export default WithdrawalsManagement;
