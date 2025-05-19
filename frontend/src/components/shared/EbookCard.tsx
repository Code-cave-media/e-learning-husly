
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        {isPurchased ? (
          <Button asChild className="w-full">
            <Link to={`/ebook/${id}`}>Read Now</Link>
          </Button>
        ) : (
          <div className="flex w-full space-x-2">
            <Button variant="outline" asChild className="flex-1">
              <Link to={`/ebook/${id}`}>View</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to={`/checkout/ebook/${id}`}>Buy</Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EbookCard;
