/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Calendar,
  Wallet,
  Clock,
  Search,
  AlertCircle,
  HeadsetIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
} from "recharts";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { AffiliateDashboard } from "@/types/apiTypes";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Loading } from "@/components/ui/loading";

// Add this type definition near the top with other types
interface WithdrawalDetails {
  id: number;
  amount: number;
  created_at: string;
  status: string;
  explanation: string | null;
  account_details: string;
}

interface PaginationResponse<T> {
  has_next: boolean;
  has_prev: boolean;
  total: number;
  items: T[];
}

const AffiliateDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { authToken } = useAuth();
  const [withdrawMethod, setWithdrawMethod] = useState<"upi" | "bank">("upi");
  const [searchQuery, setSearchQuery] = useState("");
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [dashboardData, setDashboardData] = useState<AffiliateDashboard | null>(
    null
  );
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
  });
  const { fetching, makeApiCall, isFetched, fetchType } = useAPICall();
  const { user } = useAuth();
  const fetchProducts = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_ALL_PRODUCT(searchQuery, withdrawPage, 10),
      {},
      "application/json",
      authToken,
      "fetchProducts"
    );
    if (response.status === 200) {
      const data = response.data as PaginationResponse<any>;
      setDashboardData((prev) => ({
        ...prev,
        products: response.data,
      }));
    }
  };
  const fetchWithdrawals = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_WITHDRAW_HISTORY(withdrawPage, 10),
      {},
      "application/json",
      authToken,
      "fetchWithdrawals"
    );
    if (response.status === 200) {
      setDashboardData((prev) => ({
        ...prev,
        withdraw_history: response.data,
      }));
    }
  };
  useEffect(() => {
    const fetchAffiliateData = async () => {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.USER_DASHBOARD_AFFILIATE,
        {},
        "application/json",
        authToken,
        "fetchAffiliateData"
      );
      if (response.status === 200) {
        setDashboardData(response.data);
      } else {
        toast.error("Something went wrong");
      }
    };
    fetchAffiliateData();
  }, []);
  useEffect(() => {
    if (dashboardData && isFetched) {
      fetchWithdrawals();
    }
  }, [withdrawPage]);
  useEffect(() => {
    if (dashboardData && isFetched) {
      fetchProducts();
    }
  }, [productPage]);

  const handleProductsPageChange = (newPage: number) => {
    setProductPage(newPage);
  };

  const handleWithdrawalsPageChange = (newPage: number) => {
    setWithdrawPage(newPage);
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleCopyLink = (id: number, type: string) => {
    const link = `${window.location.origin}/landing/${type}/${id}?ref=${user?.user_id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };
  const handleWithdraw = async () => {
    if (!withdrawForm.amount) {
      toast.error("Please enter amount");
      return;
    }
    console.log(dashboardData.withdraw_account_details);
    if (!dashboardData.withdraw_account_details) {
      toast.error("Please add withdrawal details first");
      return;
    }
    const data: any = {
      amount: withdrawForm.amount,
    };
    if (withdrawMethod == "upi") {
      data.upi_id = dashboardData.withdraw_account_details.upi_details.upiId;
    } else {
      data.bank_name =
        dashboardData.withdraw_account_details.bank_details.bank_name;
      data.account_number =
        dashboardData.withdraw_account_details.bank_details.account_number;
      data.ifsc_code =
        dashboardData.withdraw_account_details.bank_details.ifsc_code;
      data.account_name =
        dashboardData.withdraw_account_details.bank_details.account_name;
    }
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.CREATE_WITHDRAW,
      data,
      "application/json",
      authToken,
      "createWithdraw"
    );
    if (response.status == 200) {
      setDashboardData((prev: any) => ({
        ...prev,
        withdraw_history: {
          ...prev.withdraw_history,
          items: [response.data, ...prev.withdraw_history.items],
        },
      }));
      setIsWithdrawDialogOpen(false);
      setWithdrawForm({
        amount: "",
      });
    } else {
      toast.error(response.error);
    }
  };

  const handleOpenWithdrawDialog = async () => {
    setIsWithdrawDialogOpen(true);
  };
  if (fetching && fetchType == "fetchAffiliateData") {
    return <Loading />;
  }

  if (!dashboardData && isFetched) {
    return (
      <div className="container px-4 py-8 max-sm:px-0">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            Technical Issue Detected
          </h2>
          <p className="text-muted-foreground max-w-md mb-4">
            We're experiencing issues retrieving your affiliate dashboard data.
            This could be due to:
          </p>
          <ul className="text-left text-muted-foreground max-w-md mb-6 space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              API connection timeout or server error
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Data synchronization issues
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Temporary service disruption
            </li>
          </ul>
          <div className="space-y-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mr-2"
            >
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/support")}
              className="ml-2"
            >
              <HeadsetIcon className="h-4 w-4 mr-2" />
              Contact Support Team
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardData) {
    return (
      <div className="container px-4 py-8 max-sm:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your performance and earnings
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="md:grid md:grid-cols-4 md:gap-6 mb-8 max-sm:px-4">
          {/* Mobile Scroll Container */}
          <div className="md:contents">
            <div className="flex overflow-x-auto snap-x snap-mandatory md:contents gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
              <Card className="w-[calc(100vw-2rem)] flex-shrink-0 snap-start md:w-auto md:min-w-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Earnings
                      </p>
                      <h3 className="text-2xl font-bold">
                        $
                        {dashboardData.overview.total_earnings.value.toFixed(2)}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div
                    className={`mt-4 flex items-center text-sm text-${
                      dashboardData.overview.total_earnings.hike > 0
                        ? "green"
                        : "red"
                    }-600 `}
                  >
                    {dashboardData.overview.total_earnings.hike > 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {dashboardData.overview.total_earnings.hike}% from last
                      month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-[calc(100vw-2rem)] flex-shrink-0 snap-start md:w-auto md:min-w-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Clicks
                      </p>
                      <h3 className="text-2xl font-bold">
                        {dashboardData.overview.total_clicks.value}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div
                    className={`mt-4 flex items-center text-sm ${
                      dashboardData.overview.total_clicks.hike > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {dashboardData.overview.total_clicks.hike > 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {dashboardData.overview.total_clicks.hike}% from last
                      month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-[calc(100vw-2rem)] flex-shrink-0 snap-start md:w-auto md:min-w-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Conversion Rate
                      </p>
                      <h3 className="text-2xl font-bold">
                        {dashboardData.overview.conversion_rate.value}%
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      {dashboardData.overview.conversion_rate.hike > 0 ? (
                        <BarChart3 className="h-6 w-6 text-primary" />
                      ) : (
                        <BarChart3 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`mt-4 flex items-center text-sm text-${
                      dashboardData.overview.conversion_rate.hike > 0
                        ? "green"
                        : "red"
                    }-600`}
                  >
                    {dashboardData.overview.conversion_rate.hike > 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {dashboardData.overview.conversion_rate.hike}% from last
                      month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-[calc(100vw-2rem)] flex-shrink-0 snap-start md:w-auto md:min-w-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Links
                      </p>
                      <h3 className="text-2xl font-bold">
                        {dashboardData.overview.total_active_links}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <ExternalLink className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="space-y-6 mb-10">
          {/* Overview Filters */}

          {/* 12 Month Earnings Chart */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">
                12 Month Earnings Overview
              </h3>
              <div className="h-[400px] md:h-[300px] -mx-4 md:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.monthly_earnings}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      labelFormatter={formatMonth}
                      formatter={(value) => [`$${value}`, "Earnings"]}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#0088FE"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={5000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Clicks and Conversions Chart */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">
                Clicks & Conversions
              </h3>
              <div className="h-[400px] md:h-[300px] -mx-4 md:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.performance}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="clicks"
                      fill="#8884d8"
                      name="Clicks"
                      animationDuration={5000}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="conversions"
                      fill="#82ca9d"
                      name="Conversions"
                      animationDuration={5000}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData.performance.slice(-5).map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {day.clicks} clicks • {day.conversions} conversions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${day.earnings.toFixed(2)}</p>
                      <p className="text-sm text-green-600">
                        +{day.clicks * (day.conversions / 100)} sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Content Tabs */}
        <Tabs
          defaultValue="products"
          className="space-y-6"
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 ">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={handleSearch}
                />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Top Products Table */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Performing Products
                </h3>
                {dashboardData.products.items.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Conversions</TableHead>
                          <TableHead>Earnings</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fetching && fetchType == "fetchProducts" && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              <Loading />
                            </TableCell>
                          </TableRow>
                        )}
                        {!fetching &&
                          dashboardData.products.items.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell>{product.clicks}</TableCell>
                              <TableCell>{product.conversions}%</TableCell>
                              <TableCell>
                                ${product.earnings.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyLink(
                                      product.item_id,
                                      product.item_type
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    {!fetching && (
                      <Pagination
                        currentPage={productPage}
                        hasNext={dashboardData.products.has_next}
                        hasPrev={dashboardData.products.has_prev}
                        total={dashboardData.products.total}
                        pageSize={10}
                        onPageChange={handleProductsPageChange}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            {/* Withdraw Summary Cards */}
            <div className="flex justify-end mb-6">
              <Button
                disabled={fetching && fetchType == "fetchWithdrawDetails"}
                className="w-full md:w-auto"
                onClick={() => handleOpenWithdrawDialog()}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Withdraw Earnings
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Balance
                      </p>
                      <h3 className="text-2xl font-bold">
                        ${dashboardData.withdraw_summary.balance.toFixed(2)}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Withdrawn
                      </p>
                      <h3 className="text-2xl font-bold">
                        $
                        {dashboardData.withdraw_summary.total_withdrawn.toFixed(
                          2
                        )}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pending Withdraw
                      </p>
                      <h3 className="text-2xl font-bold">
                        $
                        {dashboardData.withdraw_summary.pending_withdraw.toFixed(
                          2
                        )}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Withdraw History Table */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Withdraw History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fetching && fetchType == "fetchWithdrawals" && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          <Loading />
                        </TableCell>
                      </TableRow>
                    )}
                    {!fetching &&
                      dashboardData.withdraw_history.items.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            {new Date(withdrawal.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(withdrawal.status)}
                            >
                              {withdrawal.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {!fetching && (
                  <Pagination
                    currentPage={withdrawPage}
                    hasNext={dashboardData.withdraw_history.has_next}
                    hasPrev={dashboardData.withdraw_history.has_prev}
                    total={dashboardData.withdraw_history.total}
                    pageSize={10}
                    onPageChange={handleWithdrawalsPageChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog
          open={isWithdrawDialogOpen}
          onOpenChange={setIsWithdrawDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Earnings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-medium">Important Notice</p>
                <p className="mt-1">
                  Withdrawal requests typically take 7 business days to process.
                  Please ensure all your details are correct before submitting.
                </p>
              </div>
              <Input
                type="number"
                placeholder="Amount"
                value={withdrawForm.amount}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Withdraw Method
                </label>
                <Select
                  value={withdrawMethod}
                  onValueChange={(v: "upi" | "bank") => setWithdrawMethod(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {withdrawMethod === "upi" ? (
                <Input
                  placeholder="UPI ID"
                  value={
                    dashboardData?.withdraw_account_details?.upi_details?.upiId
                  }
                  onChange={(e) => {
                    setDashboardData((prev: any) => ({
                      ...prev,
                      withdraw_account_details: {
                        ...prev.withdraw_account_details,
                        upi_details: {
                          ...prev.withdraw_account_details.upi_details,
                          upiId: e.target.value,
                        },
                      },
                    }));
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Bank Name"
                    value={
                      dashboardData?.withdraw_account_details?.bank_details
                        ?.bank_name
                    }
                    onChange={(e) => {
                      setDashboardData((prev: any) => ({
                        ...prev,
                        withdraw_account_details: {
                          ...prev.withdraw_account_details,
                          bank_details: {
                            ...prev.withdraw_account_details.bank_details,
                            bank_name: e.target.value,
                          },
                        },
                      }));
                    }}
                  />

                  <Input
                    placeholder="Account Name"
                    value={
                      dashboardData?.withdraw_account_details?.bank_details
                        ?.account_name
                    }
                    onChange={(e) => {
                      setDashboardData((prev: any) => ({
                        ...prev,
                        withdraw_account_details: {
                          ...prev.withdraw_account_details,
                          bank_details: {
                            ...prev.withdraw_account_details.bank_details,
                            account_name: e.target.value,
                          },
                        },
                      }));
                    }}
                  />
                  <Input
                    placeholder="Account Number"
                    value={
                      dashboardData?.withdraw_account_details?.bank_details
                        ?.account_number
                    }
                    onChange={(e) => {
                      setDashboardData((prev: any) => ({
                        ...prev,
                        withdraw_account_details: {
                          ...prev.withdraw_account_details,
                          bank_details: {
                            ...prev.withdraw_account_details.bank_details,
                            account_number: e.target.value,
                          },
                        },
                      }));
                    }}
                  />
                  <Input
                    placeholder="IFSC Code"
                    value={
                      dashboardData?.withdraw_account_details?.bank_details
                        ?.ifsc_code
                    }
                    onChange={(e) => {
                      setDashboardData((prev: any) => ({
                        ...prev,
                        withdraw_account_details: {
                          ...prev.withdraw_account_details,
                          bank_details: {
                            ...prev.withdraw_account_details.bank_details,
                            ifsc_code: e.target.value,
                          },
                        },
                      }));
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsWithdrawDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleWithdraw();
                }}
                loading={fetching && fetchType == "createWithdraw"}
              >
                Withdraw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdrawal Details</DialogTitle>
            </DialogHeader>
            {selectedWithdrawal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(
                        selectedWithdrawal.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      ${selectedWithdrawal.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      className={getStatusColor(selectedWithdrawal.status)}
                    >
                      {selectedWithdrawal.status}
                    </Badge>
                  </div>
                </div>

                {selectedWithdrawal.status === "rejected" &&
                  selectedWithdrawal.explanation && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800">
                        Failure Explanation
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {selectedWithdrawal.explanation}
                      </p>
                    </div>
                  )}

                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Account Details</p>
                  <p className="text-sm text-muted-foreground">Details</p>
                  <p className="font-medium">
                    {selectedWithdrawal.account_details}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
};

// Update the Pagination component
const Pagination = ({
  currentPage,
  hasNext,
  hasPrev,
  total,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">Page</span>
        <span className="text-sm">{currentPage}</span>
        <span className="text-sm text-muted-foreground">of</span>
        <span className="text-sm">{totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AffiliateDashboardPage;
