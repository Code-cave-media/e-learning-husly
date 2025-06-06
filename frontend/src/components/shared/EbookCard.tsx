import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

interface EbookCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  coverUrl: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isPurchased?: boolean;
}

const EbookCard = ({
  id,
  title,
  description,
  price,
  coverUrl,
  isNew = false,
  isFeatured = false,
  isPurchased = false,
}: EbookCardProps) => {
  const { isAuthenticated } = useAuth();
  const [affiliateLink, setAffiliateLink] = React.useState("");
  const [showCopied, setShowCopied] = React.useState(false);

  const createAffiliateLink = () => {
    const link = `${window.location.origin}/landing/ebook/${id}?ref=affiliate123`;
    setAffiliateLink(link);
    toast.success("Affiliate link generated successfully!");
  };

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div className="relative h-[200px] overflow-hidden bg-gray-100">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 right-2 flex flex-wrap gap-2">
          {isNew && <span className="tag-new">New</span>}
          {isFeatured && <span className="tag-featured">Featured</span>}
        </div>
      </div>
      <CardContent className="flex-grow pt-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{description}</p>
        <p className="font-bold text-brand-primary">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="border-t pt-4 pb-4">
        {isAuthenticated ? (
          <>
            {isPurchased ? (
              <Button asChild className="w-full">
                <Link to={`/ebook/read/${id}`}>Read Now</Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link to={`/landing/ebook/${id}`}>Buy</Link>
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Affiliate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Affiliate Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">
                    Share this course with your audience and earn 30% commission
                    on each sale.
                  </p>
                  {affiliateLink ? (
                    <div className="flex items-center space-x-2">
                      <Input value={affiliateLink} readOnly />
                      <Button size="sm" onClick={copyAffiliateLink}>
                        {showCopied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={createAffiliateLink}>Generate Link</Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Button asChild className="w-full">
            <Link to={`/landing/course/${id}`}>Buy</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EbookCard;
