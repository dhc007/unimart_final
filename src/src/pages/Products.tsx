import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, SlidersHorizontal, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductCard from "@/components/ProductCard";
import DataService from "@/services/dataService";

const categories = [
  "All Categories",
  "Textbooks",
  "Notes",
  "Electronics",
  "Lab Equipment",
  "Stationery",
  "Others",
];

const subjects = [
  "All Subjects",
  "Computer Networks",
  "Data Structures",
  "Database Management",
  "Operating Systems",
  "Engineering Graphics",
  "Mechanics",
  "Electronics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
];

const conditions = [
  "All Conditions",
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedCondition, setSelectedCondition] = useState("All Conditions");
  const [sortOption, setSortOption] = useState("newest");
  const [showBlockchainOnly, setShowBlockchainOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load initial search query from URL
  useEffect(() => {
    const urlSearchQuery = searchParams.get("search");
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "All Categories") count++;
    if (selectedSubject !== "All Subjects") count++;
    if (selectedCondition !== "All Conditions") count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (showBlockchainOnly) count++;
    setActiveFilters(count);
  }, [
    selectedCategory,
    selectedSubject,
    selectedCondition,
    priceRange,
    showBlockchainOnly,
  ]);

  // Fetch products with applied filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters: any = {};
        
        // Apply search query
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        // Apply category filter
        if (selectedCategory !== "All Categories") {
          filters.category = selectedCategory;
        }
        
        // Apply subject filter
        if (selectedSubject !== "All Subjects") {
          filters.subject = selectedSubject;
        }
        
        // Apply condition filter
        if (selectedCondition !== "All Conditions") {
          filters.condition = selectedCondition;
        }
        
        // Apply price range filter
        if (priceRange[0] > 0 || priceRange[1] < 10000) {
          filters.minPrice = priceRange[0];
          filters.maxPrice = priceRange[1];
        }
        
        // Apply blockchain filter
        if (showBlockchainOnly) {
          filters.blockchainVerified = true;
        }
        
        // Apply sorting
        filters.sort = sortOption;
        
        const dataService = DataService.getInstance();
        const data = await dataService.getProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedSubject,
    selectedCondition,
    priceRange,
    showBlockchainOnly,
    sortOption,
    toast,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedSubject("All Subjects");
    setSelectedCondition("All Conditions");
    setPriceRange([0, 10000]);
    setShowBlockchainOnly(false);
    if (searchQuery) {
      // Keep search query if it exists
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  // Format price for display
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  // Filter UI content (shared between mobile and desktop)
  const filterContent = (
    <div className="space-y-6">
      {/* Search (only in mobile sheet) */}
      {isMobile && (
        <div className="space-y-2">
          <div className="font-medium">Search</div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Category filter */}
      <div className="space-y-2">
        <div className="font-medium">Category</div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject filter */}
      <div className="space-y-2">
        <div className="font-medium">Subject</div>
        <Select
          value={selectedSubject}
          onValueChange={setSelectedSubject}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition filter */}
      <div className="space-y-2">
        <div className="font-medium">Condition</div>
        <Select
          value={selectedCondition}
          onValueChange={setSelectedCondition}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range filter */}
      <div className="space-y-2">
        <div className="font-medium">Price Range</div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
        />
        <div className="flex justify-between text-sm">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Blockchain verified only filter */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="blockchain-verified"
          className="h-4 w-4 rounded border-gray-300 text-unimart-600 focus:ring-unimart-500"
          checked={showBlockchainOnly}
          onChange={(e) => setShowBlockchainOnly(e.target.checked)}
        />
        <label htmlFor="blockchain-verified" className="text-sm text-gray-600">
          Blockchain verified only
        </label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/sell">
          <Button>Sell Your Product</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar (desktop) */}
        <div className="hidden md:block w-64">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Filters</h2>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            {filterContent}
          </div>
        </div>

        {/* Filters drawer (mobile) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-1">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down your search.
                </SheetDescription>
              </SheetHeader>
              <Separator />
              {filterContent}
              <div className="mt-6 flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Products list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Select
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id || product.id} {...product} />
                ))
              ) : (
                <div className="col-span-full text-center">
                  <p>No products found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
