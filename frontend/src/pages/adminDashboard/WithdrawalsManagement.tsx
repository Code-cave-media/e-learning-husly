import { useState, useEffect } from "react";
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
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import Pagination from "@/components/Pagination";
import { Loading } from "@/components/ui/loading";
import toast from "react-hot-toast";

interface Withdrawal {
  id: number;
  amount: number;
  created_at: string;
  status: "pending" | "processing" | "success" | "failed" | "rejected";
  explanation: string | null;
  account_details: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const WithdrawalsManagement = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [reason, setReason] = useState("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsWithdrawal, setDetailsWithdrawal] = useState<Withdrawal | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;
  const { makeApiCall, fetching, fetchType,isFetched } = useAPICall();
  const { authToken } = useAuth();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchWithdrawals = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_ALL_WITHDRAWALS(
        currentPage,
        pageSize,
        statusFilter,
        searchQuery
      ),
      {},
      "application/json",
      authToken,
      "fetchWithdrawals"
    );
    if (response.status === 200) {
      setWithdrawals(response.data.items);
      setHasNext(response.data.has_next);
      setHasPrev(response.data.has_prev);
      setTotalPages(response.data.total_pages);
      setTotalItems(response.data.total);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, statusFilter, searchQuery]);

  const handleStatusChange = async (
    withdrawal: Withdrawal,
    newStatus: Withdrawal["status"]
  ) => {
    if ((newStatus === "failed" || newStatus === "rejected") && !reason) {
      setSelectedWithdrawal({
        ...withdrawal,
        status: newStatus,
      });
      setIsDialogOpen(true);
      return;
    }

    const response = await makeApiCall(
      "PUT",
      API_ENDPOINT.UPDATE_WITHDRAWAL_STATUS(withdrawal.id),
      {
        status: newStatus,
        explanation: reason,
      },
      "application/json",
      authToken
    );

    if (response.status === 200) {
      setWithdrawals(
        withdrawals.map((item) =>
          withdrawal.id === item.id
            ? { ...item, status: newStatus, explanation: reason }
            : item
        )
      );
      toast.success("Withdrawal status updated successfully");
      setIsDialogOpen(false);
      setReason("");
    }
  };

  const getStatusColor = (status: Withdrawal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "success":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "rejected":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusDescription = (status: Withdrawal["status"]) => {
    switch (status) {
      case "pending":
        return "User submitted a request, but not yet reviewed";
      case "processing":
        return "Admin has started processing (e.g., verifying details)";
      case "success":
        return "Manually processed and money sent successfully";
      case "failed":
        return "Attempted but failed (e.g., wrong bank details)";
      case "rejected":
        return "Request was rejected";
      default:
        return "";
    }
  };

  return (
    <div className="py-4 sm:py-6 px-2 sm:px-4">
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">
            Withdrawals Management
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-8 w-full sm:w-[300px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="right-2 hover:bg-inherit"
              onClick={handleSearch}
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
                {statusFilter === "all"
                  ? "All Status"
                  : `Status: ${statusFilter}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("success")}>
                Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching && (fetchType === "fetchWithdrawals" || !isFetched) ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loading />
                  </TableCell>
                </TableRow>
              ) : withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No withdrawals found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{withdrawal.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{withdrawal.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </TableCell>
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
                          disabled={
                            withdrawal.status === "success" ||
                            withdrawal.status === "failed" ||
                            withdrawal.status === "rejected"
                          }
                          onValueChange={(value) => {
                            handleStatusChange(
                              withdrawal,
                              value as Withdrawal["status"]
                            );
                          }}
                          defaultValue={withdrawal.status}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!fetching && withdrawals.length > 0 && (
            <Pagination
              currentPage={currentPage}
              hasNext={hasNext}
              hasPrev={hasPrev}
              total={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemsSize={withdrawals.length}
            />
          )}
        </CardContent>
      </Card>

      {/* Failure Reason Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWithdrawal?.status === "failed"
                ? "Enter Failure Reason"
                : "Enter Rejection Reason"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={
                selectedWithdrawal?.status === "failed"
                  ? "Enter reason for withdrawal failure..."
                  : "Enter reason for withdrawal rejection..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <Button
              onClick={() => {
                if (selectedWithdrawal && reason) {
                  handleStatusChange(
                    selectedWithdrawal,
                    selectedWithdrawal.status
                  );
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
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {detailsWithdrawal && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    User Information
                  </p>
                  <div className="font-medium">
                    <p>{detailsWithdrawal.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {detailsWithdrawal.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium text-lg">
                      ${detailsWithdrawal.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="space-y-1">
                      <Badge
                        className={getStatusColor(detailsWithdrawal.status)}
                      >
                        {detailsWithdrawal.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {getStatusDescription(detailsWithdrawal.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Details
                  </p>
                  <div className="font-medium">
                    {detailsWithdrawal.account_details}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(
                      detailsWithdrawal.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Failure/Rejection Reason */}
              {(detailsWithdrawal.status === "failed" ||
                detailsWithdrawal.status === "rejected") &&
                detailsWithdrawal.explanation && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {detailsWithdrawal.status === "failed"
                          ? "Failure Reason"
                          : "Rejection Reason"}
                      </p>
                      <p className="font-medium">
                        {detailsWithdrawal.explanation}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalsManagement;
