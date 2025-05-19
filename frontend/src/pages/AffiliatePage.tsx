import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AffiliateCard from "@/components/shared/AffiliateCard";

const AffiliatePage = () => {
  const [paymentMode, setPaymentMode] = useState<"upi" | "bank">("upi");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulating API request
    setTimeout(() => {
      setIsLoading(false);
      setWithdrawalAmount("");
      toast.success("Withdrawal request submitted successfully!");
    }, 1500);
  };

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-600">
          Manage your affiliate marketing and earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AffiliateCard
          title="Total Earnings"
          value="$1,248.50"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
        <AffiliateCard
          title="Available Balance"
          value="$950.00"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
        <AffiliateCard
          title="Total Referrals"
          value="47"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
          }
        />
      </div>

      <Tabs defaultValue="withdraw" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
          <TabsTrigger value="history">Withdrawal History</TabsTrigger>
          <TabsTrigger value="links">Affiliate Links</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdrawal}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Payment Mode</Label>
                    <Select
                      defaultValue={paymentMode}
                      onValueChange={(value) =>
                        setPaymentMode(value as "upi" | "bank")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMode === "upi" && (
                    <div>
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input
                        id="upi"
                        type="text"
                        placeholder="name@bankname"
                        required
                      />
                    </div>
                  )}

                  {paymentMode === "bank" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="accountName">Account Holder Name</Label>
                        <Input id="accountName" type="text" required />
                      </div>
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" type="text" required />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" type="text" required />
                      </div>
                      <div>
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input id="ifsc" type="text" required />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Submit Withdrawal Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 font-medium text-gray-500">
                        Date
                      </th>
                      <th className="text-left pb-3 font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="text-left pb-3 font-medium text-gray-500">
                        Method
                      </th>
                      <th className="text-left pb-3 font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="py-4">May 10, 2023</td>
                      <td className="py-4">$250.00</td>
                      <td className="py-4">UPI</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="py-4">April 21, 2023</td>
                      <td className="py-4">$175.00</td>
                      <td className="py-4">Bank Transfer</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="py-4">April 5, 2023</td>
                      <td className="py-4">$100.00</td>
                      <td className="py-4">UPI</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Processing
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Your Affiliate Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">
                      Complete Web Development Bootcamp
                    </span>
                    <span className="text-sm text-gray-500">5 clicks</span>
                  </div>
                  <div className="flex items-center">
                    <Input
                      value="https://learnhub.com/course/1?ref=affiliate123"
                      readOnly
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">
                      React Patterns & Best Practices
                    </span>
                    <span className="text-sm text-gray-500">12 clicks</span>
                  </div>
                  <div className="flex items-center">
                    <Input
                      value="https://learnhub.com/ebook/1?ref=affiliate123"
                      readOnly
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliatePage;
