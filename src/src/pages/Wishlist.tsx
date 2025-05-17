import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ProductCardProps } from "@/components/ProductCard";
import MockDataService from "@/services/mockDataService";
import DataService from "@/services/dataService";

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    const loadWishlist = async () => {
      setIsLoading(true);
      try {
        const storedWishlist = localStorage.getItem("unimart_wishlist");
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        } else {
          // Demo data if no wishlist exists
          const dataService = MockDataService.getInstance();
          const products = await dataService.getProducts();
          const demoWishlist = [products[0], products[3]].slice(0, 2);
          
          setWishlistItems(demoWishlist);
          localStorage.setItem("unimart_wishlist", JSON.stringify(demoWishlist));
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      const dataService = DataService.getInstance();
      await dataService.removeFromWishlist(productId);
      // Refresh wishlist
      setWishlistItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
      toast({
        title: "Removed",
        description: "Item removed from your wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.setItem("unimart_wishlist", JSON.stringify([]));
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist.",
    });
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
            <h1 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h1>
            <p className="text-gray-600 mb-8">
              You need to be logged in to save and view your wishlist items.
            </p>
            <Link to="/auth">
              <Button className="bg-unimart-600 hover:bg-unimart-700">
                Login or Register
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            {wishlistItems.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearWishlist}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-unimart-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your wishlist...</p>
            </div>
          ) : wishlistItems.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {wishlistItems.map((item, index) => (
                <div key={item.id}>
                  <div className="p-4 md:p-6 flex flex-col md:flex-row">
                    <div className="w-full md:w-24 h-24 flex-shrink-0 mb-4 md:mb-0">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="md:ml-6 flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <Link to={`/product/${item.id}`} className="text-lg font-medium hover:text-unimart-600 transition-colors">
                            {item.title}
                          </Link>
                          <p className="text-gray-500 text-sm mt-1">
                            {item.category} • {item.condition} • {item.subject}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Seller: {item.seller}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-xl font-bold">
                          ₹{item.price}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link to={`/product/${item.id}`}>
                          <Button variant="default" className="bg-unimart-600 hover:bg-unimart-700">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={() => removeFromWishlist(item.id)}>
                          <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < wishlistItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-lg">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">
                Save items you're interested in by clicking the heart icon on product pages.
              </p>
              <Link to="/products">
                <Button className="bg-unimart-600 hover:bg-unimart-700">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Wishlist;
