
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/layouts/MainLayout";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import MockDataService from "@/services/mockDataService";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const dataService = MockDataService.getInstance();
        const products = await dataService.getProducts();
        setFeaturedProducts(products.slice(0, 4)); // Get first 4 products
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading products:", error);
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Check out these popular items from fellow students in your university.
            </p>
          </motion.div>
          
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link to="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
