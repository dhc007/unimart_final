import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import BlockchainStatus from "./BlockchainStatus";
import { toast } from "@/hooks/use-toast";
import DataService from "@/services/dataService";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle menu animation
  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const dataService = DataService.getInstance();
      const results = await dataService.searchProducts(searchQuery);
      
      // Store results temporarily in localStorage
      localStorage.setItem('unimart_search_results', JSON.stringify(results));
      localStorage.setItem('unimart_last_search', searchQuery);
      
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      
      toast({
        title: "Search Results",
        description: `Found ${results.length} items matching "${searchQuery}"`,
      });
    } catch (error) {
      console.error("Search error:", error);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Toggle search in desktop mode
  const toggleDesktopSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Focus the input after state update
    if (!isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById('desktop-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-unimart-600 to-unimart-800 bg-clip-text text-transparent">
                UniMart
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <motion.nav 
              className="mx-auto hidden space-x-10 md:flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <NavLink to="/">Home</NavLink>
              <NavLink to="/products">Browse</NavLink>
              <NavLink to="/sell">Sell</NavLink>
              <NavLink to="/about">About</NavLink>
            </motion.nav>
          )}

          {/* Desktop Right section */}
          {!isMobile && (
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BlockchainStatus />
              
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.form 
                    onSubmit={handleSearch} 
                    className="relative"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "200px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      id="desktop-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="pr-8"
                      autoFocus
                      onBlur={() => {
                        // Small delay to allow for clicking the search button
                        setTimeout(() => {
                          if (!searchQuery.trim()) {
                            setIsSearchOpen(false);
                          }
                        }, 200);
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={toggleDesktopSearch}
                      className="hover:bg-gray-100"
                    >
                      <Search className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Heart className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              
              <Link to={isAuthenticated ? "/profile" : "/auth"}>
                {isAuthenticated && user ? (
                  <Avatar className="transition-all hover:ring-2 hover:ring-unimart-500">
                    <AvatarFallback className="bg-unimart-100 text-unimart-800">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="transition-all hover:ring-2 hover:ring-unimart-500">
                    <AvatarFallback className="bg-unimart-100 text-unimart-800">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </Link>
            </motion.div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center space-x-4">
              <BlockchainStatus />
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hover:bg-gray-100"
              >
                <Search className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              
              <Link to="/wishlist" className="flex items-center justify-center">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <Heart className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {isMobile && isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pb-3"
            >
              <form onSubmit={handleSearch} className="flex">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full"
                  autoFocus
                />
                <Button type="submit" className="ml-2 bg-unimart-600">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobile && (
            <motion.div 
              className="md:hidden overflow-hidden"
              initial="hidden"
              animate={isMenuOpen ? "visible" : "hidden"}
              variants={menuVariants}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pb-4 pt-2 space-y-1">
                <MobileNavLink to="/">Home</MobileNavLink>
                <MobileNavLink to="/products">Browse</MobileNavLink>
                <MobileNavLink to="/sell">Sell</MobileNavLink>
                <MobileNavLink to="/about">About</MobileNavLink>
                <MobileNavLink to="/wishlist">Wishlist</MobileNavLink>
                <MobileNavLink to={isAuthenticated ? "/profile" : "/auth"}>
                  {isAuthenticated ? "Profile" : "Login / Register"}
                </MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink = ({ to, children }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-1 py-2 text-sm font-medium transition-colors`}
    >
      {children}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 w-full bg-unimart-500"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </Link>
  );
};

const MobileNavLink = ({ to, children }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive 
          ? 'bg-unimart-50 text-unimart-700' 
          : 'hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
