import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Calendar,
  Wallet,
  Clock,
  BookOpen,
  Video,
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Mock data - In a real app, this would come from an API
const dashboardData = {
  overview: {
    totalEarnings: 1250.0,
    totalClicks: 1250,
    conversionRate: 3.2,
    activeLinks: 8,
  },
  performance: {
    daily: [
      { date: "2024-03-01", clicks: 120, conversions: 4, earnings: 120.0 },
      { date: "2024-03-02", clicks: 150, conversions: 5, earnings: 150.0 },
      { date: "2024-03-03", clicks: 180, conversions: 6, earnings: 180.0 },
      { date: "2024-03-04", clicks: 200, conversions: 7, earnings: 200.0 },
      { date: "2024-03-05", clicks: 220, conversions: 8, earnings: 220.0 },
      { date: "2024-03-06", clicks: 250, conversions: 9, earnings: 250.0 },
      { date: "2024-03-07", clicks: 280, conversions: 10, earnings: 280.0 },
    ],
  },
  monthlyEarnings: [
    { month: "2023-04", earnings: 850.0 },
    { month: "2023-05", earnings: 920.0 },
    { month: "2023-06", earnings: 1100.0 },
    { month: "2023-07", earnings: 950.0 },
    { month: "2023-08", earnings: 1200.0 },
    { month: "2023-09", earnings: 1300.0 },
    { month: "2023-10", earnings: 1400.0 },
    { month: "2023-11", earnings: 1600.0 },
    { month: "2023-12", earnings: 1800.0 },
    { month: "2024-01", earnings: 2000.0 },
    { month: "2024-02", earnings: 2200.0 },
    { month: "2024-03", earnings: 2400.0 },
  ],
  salesDistribution: [
    { name: "Courses", value: 65, color: "#0088FE" },
    { name: "Ebooks", value: 35, color: "#00C49F" },
  ],
  topProducts: [
    {
      id: "1",
      name: "Digital Marketing Course",
      clicks: 450,
      conversions: 15,
      earnings: 450.0,
    },
    {
      id: "2",
      name: "Web Development Bootcamp",
      clicks: 380,
      conversions: 12,
      earnings: 380.0,
    },
    {
      id: "3",
      name: "Data Science Fundamentals",
      clicks: 320,
      conversions: 10,
      earnings: 320.0,
    },
  ],
  withdrawHistory: [
    {
      id: "1",
      date: "2024-03-01",
      amount: 500.0,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "2",
      date: "2024-02-15",
      amount: 350.0,
      status: "completed",
      method: "PayPal",
    },
    {
      id: "3",
      date: "2024-02-01",
      amount: 400.0,
      status: "completed",
      method: "Bank Transfer",
    },
  ],
  withdrawSummary: {
    totalEarnings: 5000.0,
    totalWithdrawn: 1250.0,
    pendingWithdraw: 250.0,
  },
};

const AffiliateDashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Affiliate link has been copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance and earnings
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Wallet className="mr-2 h-4 w-4" />
          Withdraw Earnings
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <h3 className="text-2xl font-bold">
                  ${dashboardData.overview.totalEarnings.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <h3 className="text-2xl font-bold">
                  {dashboardData.overview.totalClicks}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <h3 className="text-2xl font-bold">
                  {dashboardData.overview.conversionRate}%
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-2.1% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Links</p>
                <h3 className="text-2xl font-bold">
                  {dashboardData.overview.activeLinks}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+2 new this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs
        defaultValue="overview"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdraw History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 12 Month Earnings Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                12 Month Earnings Overview
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.monthlyEarnings}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      labelFormatter={formatMonth}
                      formatter={(value) => [`$${value}`, "Earnings"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#0088FE"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Clicks and Conversions Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Clicks & Conversions
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.performance.daily}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Bar dataKey="clicks" fill="#8884d8" name="Clicks" />
                    <Bar
                      dataKey="conversions"
                      fill="#82ca9d"
                      name="Conversions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sales Distribution Pie Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.salesDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.salesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData.performance.daily.slice(-5).map((day, index) => (
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
                        +{day.conversions} sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Top Products Table */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Top Performing Products
              </h3>
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
                  {dashboardData.topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.clicks}</TableCell>
                      <TableCell>{product.conversions}</TableCell>
                      <TableCell>${product.earnings.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyLink(
                              `https://example.com/ref/${product.id}`
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-6">
          {/* Withdraw Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Earnings
                    </p>
                    <h3 className="text-2xl font-bold">
                      ${dashboardData.withdrawSummary.totalEarnings.toFixed(2)}
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
                      ${dashboardData.withdrawSummary.totalWithdrawn.toFixed(2)}
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
                      {dashboardData.withdrawSummary.pendingWithdraw.toFixed(2)}
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
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.withdrawHistory.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {new Date(withdrawal.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateDashboardPage;
