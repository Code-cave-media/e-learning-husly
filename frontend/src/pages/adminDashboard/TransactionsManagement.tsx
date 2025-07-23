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
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  CreditCard,
  Mail,
  Filter,
  Search,
  Package,
  AlertCircle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface Transaction {
  purchase_id: number | null;
  transaction_id: string;
  order_id: string;
  item_id: string;
  item_type: string;
  status: string;
  provider: string;
  utr_id: string;
  method: string;
  vpa: string;
  email: string;
  contact: string;
  currency: string;
  amount: number;
  base_amount: number;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: string;
  item?: {
    id: number;
    title: string;
    description: string;
    price: number;
    pdf: string;
    thumbnail: string;
    intro_video: string;
    visible: boolean;
    created_at: string;
    updated_at: string;
    commission: number;
    chapters: Array<{
      id: number;
      title: string;
      content: string;
    }>;
    landing_page: {
      id: number;
      main_heading: string;
      sub_heading: string;
    };
    is_featured: boolean;
    is_new: boolean;
  };
  user?: {
    id: number;
    email: string;
    user_id: string;
    is_admin: boolean;
    phone: string;
    name: string;
  };
  affiliate_user?: {
    id: number;
    email: string;
    user_id: string;
    is_admin: boolean;
    phone: string;
    name: string;
  };
}

interface TransactionResponse {
  has_next: boolean;
  has_prev: boolean;
  total: number;
  items: Transaction[];
}

export default function TransactionsManagement() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<TransactionResponse | null>(
    null
  );
  const pageSize = 20;
  const { fetchType, fetching, makeApiCall ,isFetched} = useAPICall();
  const { authToken } = useAuth();

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchTransactions = async (page: number) => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_ALL_TRANSACTIONS(
        page,
        pageSize,
        statusFilter,
        searchQuery
      ),
      {},
      "application/json",
      authToken,
      "fetchTransactions"
    );
    if (response.status === 200) {
      setTransactions(response.data);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, statusFilter, searchQuery]);

  const filteredTransactions = transactions?.items || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="py-4 sm:py-6 px-2 sm:px-4">
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">
            Transactions Management
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Transaction ID or Order ID..."
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
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                {statusFilter === "all"
                  ? "All Transactions"
                  : `Status: ${statusFilter}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Transactions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("success")}>
                Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(fetching || !isFetched)  && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            )}
            {!fetching &&
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.transaction_id}>
                  <TableCell>{transaction.transaction_id}</TableCell>
                  <TableCell>
                    {formatCurrency(transaction.amount / 100)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "SUCCESS"
                          ? "default"
                          : "destructive"
                      }
                      className={`capitalize ${
                        transaction.status === "SUCCESS"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {transaction.method}
                  </TableCell>
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
            {!fetching && filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No transaction found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {transactions && filteredTransactions.length > 0 && !fetching && (
        <Pagination
          currentPage={currentPage}
          hasNext={transactions.has_next}
          hasPrev={transactions.has_prev}
          total={transactions.total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          itemsSize={transactions.items.length}
        />
      )}

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
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant={
                          selectedTransaction.status == "SUCCESS"
                            ? "default"
                            : "destructive"
                        }
                        className={`capitalize ${
                          selectedTransaction.status == "SUCCESS"
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
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="font-medium capitalize">
                        {selectedTransaction.provider}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Created At
                      </p>
                      <p className="font-medium">
                        {new Date(
                          selectedTransaction.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Base Amount
                      </p>
                      <p className="font-medium">
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Fee</p>
                      <p className="font-medium">NAN</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tax</p>
                      <p className="font-medium">NAN</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">
                        {selectedTransaction.currency}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Purchase ID
                      </p>
                      <p className="font-medium">
                        {selectedTransaction.purchase_id || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Item Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Item ID</p>
                      <p className="font-medium">
                        {selectedTransaction.item_id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Item Type</p>
                      <p className="font-medium capitalize">
                        {selectedTransaction.item_type}
                      </p>
                    </div>

                    {selectedTransaction.item && (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Title</p>
                          <p className="font-medium">
                            {selectedTransaction.item.title}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">
                            {formatCurrency(selectedTransaction.item.price)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Commission
                          </p>
                          <p className="font-medium">
                            {formatCurrency(
                              selectedTransaction.item.commission
                            )}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Chapters
                          </p>
                          <p className="font-medium">
                            {selectedTransaction.item.chapters?.length || 0}{" "}
                            chapters
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <div className="flex gap-2">
                            {selectedTransaction.item.is_featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                            {selectedTransaction.item.is_new && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            <Badge
                              variant={
                                selectedTransaction.item.visible
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {selectedTransaction.item.visible
                                ? "Visible"
                                : "Hidden"}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {selectedTransaction.item?.description && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {selectedTransaction.item.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* UPI Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    UPI Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">UTR ID</p>
                      <p className="font-medium">
                        {selectedTransaction.utr_id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">VPA</p>
                      <p className="font-medium">{selectedTransaction.vpa}</p>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
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

              {/* User Information Card */}
              {(selectedTransaction.user ||
                selectedTransaction.affiliate_user) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTransaction.user ? (
                        <div className="border-b pb-4">
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">
                            Buyer
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Name
                              </p>
                              <p className="font-medium">
                                {selectedTransaction.user.name}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Email
                              </p>
                              <p className="font-medium">
                                {selectedTransaction.user.email}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                User ID
                              </p>
                              <p className="font-medium font-mono text-sm">
                                {selectedTransaction.user.user_id}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Phone
                              </p>
                              <p className="font-medium">
                                {selectedTransaction.user.phone}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Role
                              </p>
                              <Badge
                                variant={
                                  selectedTransaction.user.is_admin
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {selectedTransaction.user.is_admin
                                  ? "Admin"
                                  : "User"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-b pb-4">
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">
                            Buyer
                          </h4>
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Guest Purchase
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedTransaction.affiliate_user && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">
                            Affiliate User
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Name
                              </p>
                              <p className="font-medium">
                                {selectedTransaction.affiliate_user.name}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Email
                              </p>
                              <p className="font-medium">
                                {selectedTransaction.affiliate_user.email}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                User ID
                              </p>
                              <p className="font-medium font-mono text-sm">
                                {selectedTransaction.affiliate_user.user_id}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Phone
                              </p>
                              <p className="font-medium">
                                {selectedTransaction.affiliate_user.phone}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Role
                              </p>
                              <Badge
                                variant={
                                  selectedTransaction.affiliate_user.is_admin
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {selectedTransaction.affiliate_user.is_admin
                                  ? "Admin"
                                  : "User"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Information Card */}
              {(selectedTransaction.error_code ||
                selectedTransaction.error_description) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Error Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTransaction.error_code && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Error Code
                          </p>
                          <p className="font-medium text-destructive">
                            {selectedTransaction.error_code}
                          </p>
                        </div>
                      )}
                      {selectedTransaction.error_description && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Error Description
                          </p>
                          <p className="font-medium text-destructive">
                            {selectedTransaction.error_description}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
