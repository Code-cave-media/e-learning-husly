import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { DashboardData } from "@/types/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  IndianRupee,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const { fetchType, fetching, makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await makeApiCall(
        "GET",
        API_ENDPOINT.GET_ADMIN_DASHBOARD,
        {},
        "application/json",
        authToken,
        "fetchDashboardData"
      );
      if (response.status === 200) {
        setDashboardData(response.data);
      }
    };
    fetchDashboardData();
  }, []);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  if (fetching) {
    return <Loading />;
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className=" py-6 px-0">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.total_users}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.total_courses}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ebooks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.total_ebooks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {dashboardData.overview.total_sales.total_amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.overview.total_sales.count} total sales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paid Withdrawals
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {dashboardData.withdrawals.total_paid_withdrawals.total_amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.withdrawals.total_paid_withdrawals.count}{" "}
              withdrawals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Withdrawals
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {dashboardData.withdrawals.total_pending_withdrawals.total_amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.withdrawals.total_pending_withdrawals.count}{" "}
              pending requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Withdrawals
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {dashboardData.withdrawals.total_withdrawals.total_amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.withdrawals.total_withdrawals.count} total
              withdrawals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly sales overview</h3>
          <div className="h-[400px] md:h-[300px] -mx-4 md:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.line_graph.total_users}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(value) => `₹${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={formatMonth}
                  formatter={(value) => [`₹${value}`, "Sales"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
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
    </div>
  );
};

export default AdminDashboard;
