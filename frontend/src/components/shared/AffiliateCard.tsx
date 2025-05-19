
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AffiliateCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const AffiliateCard = ({ title, value, icon }: AffiliateCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500 font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <div className="text-brand-primary">{icon}</div>
      </CardContent>
    </Card>
  );
};

export default AffiliateCard;
