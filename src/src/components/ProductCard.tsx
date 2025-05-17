
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  condition: string;
  seller: string;
  subject: string;  // Added subject property
  rating: number;
  postedDate: string;
  isBlockchainVerified?: boolean;
}

const ProductCard = ({
  id,
  title,
  price,
  description,
  image,
  category,
  condition,
  seller,
  rating,
  postedDate,
  isBlockchainVerified = false,
}: ProductCardProps) => {
  return (
    <motion.div
      className="group h-full flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${id}`} className="relative overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
          />
        </div>
        
        {/* Condition badge */}
        <Badge
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800"
          variant="outline"
        >
          {condition}
        </Badge>
        
        {/* Blockchain verification badge */}
        {isBlockchainVerified && (
          <Badge
            className="absolute top-3 right-3 bg-unimart-600 text-white"
          >
            <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V12L12 16L20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 12V18L12 22L20 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Verified
          </Badge>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-gray-50 text-gray-600">
            {category}
          </Badge>
          <span className="flex items-center text-amber-500 text-sm font-medium">
            <Star className="h-3.5 w-3.5 mr-1 fill-amber-500" />
            {rating.toFixed(1)}
          </span>
        </div>

        <Link to={`/product/${id}`} className="group-hover:text-unimart-600 transition-colors">
          <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
        </Link>

        <p className="text-sm text-gray-500 mt-1 mb-2 line-clamp-2">{description}</p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span>{postedDate}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Price</span>
            <span className="text-lg font-semibold">₹{price.toLocaleString()}</span>
          </div>
          
          <Button variant="outline" className="border-unimart-200 hover:bg-unimart-50 hover:text-unimart-700">
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
