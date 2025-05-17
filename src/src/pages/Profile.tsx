import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Settings, Star, Package, History, Heart, Clock, ChevronRight, LogOut, Upload } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/hooks/use-auth";
import MockDataService from "@/services/mockDataService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditFormData {
  name: string;
  department: string;
  year: string;
  location: string;
  avatar: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: "",
    department: "",
    year: "",
    location: "",
    avatar: "",
  });
  const [userData, setUserData] = useState({
    name: "Aditya Kumar",
    email: "aditya.kumar@university.edu",
    department: "Information Technology",
    year: "4th Year",
    avatar: "https://i.pravatar.cc/150?u=aditya",
    location: "North Campus Hostel",
    joinedDate: "August 2021",
    rating: 4.7,
    totalSales: 14,
    totalPurchases: 8,
    listedProducts: [],
    savedProducts: [],
    transactions: [],
    isProfileComplete: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Load user data and products
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile from API
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();

        // Get products from mock data service
        const dataService = MockDataService.getInstance();
        const allProducts = await dataService.getProducts();
        
        // For demo, set first 2 products as user's listings
        const userListings = allProducts.slice(0, 2).map(product => ({
          ...product,
          seller: userData.name
        }));
        
        // Set another product as saved
        const savedProduct = allProducts.slice(2, 3);
        
        // Sample transactions data
        const sampleTransactions = [
          {
            id: "t1",
            type: "sold",
            item: "Physics Lab Manual",
            price: 200,
            buyer: "Rohit S.",
            date: "15 Apr 2023",
            status: "completed"
          },
          {
            id: "t2",
            type: "purchased",
            item: "Programming Fundamentals Textbook",
            price: 400,
            seller: "Neha P.",
            date: "28 Mar 2023",
            status: "completed"
          },
          {
            id: "t3",
            type: "sold",
            item: "USB Multimeter",
            price: 650,
            buyer: "Vikram J.",
            date: "10 Feb 2023",
            status: "completed"
          }
        ];
        
        // Update user data with products
        setUserData(prevData => ({
          ...prevData,
          name: userData.name,
          email: userData.email,
          department: userData.department,
          year: userData.year,
          avatar: userData.avatar,
          location: userData.location,
          joinedDate: userData.joinedDate,
          rating: userData.rating,
          totalSales: userData.totalSales,
          totalPurchases: userData.totalPurchases,
          listedProducts: userListings,
          savedProducts: savedProduct,
          transactions: sampleTransactions,
          isProfileComplete: userData.isProfileComplete
        }));
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.token) {
      loadUserData();
    }
  }, [user]);

  // Load initial form data when modal opens
  useEffect(() => {
    if (isEditModalOpen) {
      setEditForm({
        name: userData.name,
        department: userData.department,
        year: userData.year,
        location: userData.location,
        avatar: userData.avatar,
      });
    }
  }, [isEditModalOpen, userData]);

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Call the logout function from useAuth hook to clear local storage
      logout();
      
      // Clear any remaining user data
      setUserData({
        name: "",
        email: "",
        department: "",
        year: "",
        avatar: "",
        location: "",
        joinedDate: "",
        rating: 0,
        totalSales: 0,
        totalPurchases: 0,
        listedProducts: [],
        savedProducts: [],
        transactions: [],
        isProfileComplete: false
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to logout locally even if the API call fails
      logout();
      navigate('/');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setEditForm(prev => ({
            ...prev,
            avatar: result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Prepare the data to send
      const formData = {
        name: editForm.name,
        department: editForm.department,
        year: editForm.year,
        location: editForm.location,
        avatar: editForm.avatar
      };

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();

      // Update local user data
      setUserData(prevData => ({
        ...prevData,
        name: data.name,
        department: data.department,
        year: data.year,
        location: data.location,
        avatar: data.avatar,
        isProfileComplete: data.isProfileComplete,
      }));

      // Update auth context with new token
      if (data.token) {
        const updatedUser = {
          ...user,
          name: data.name,
          department: data.department,
          year: data.year,
          location: data.location,
          avatar: data.avatar,
          isProfileComplete: data.isProfileComplete,
          token: data.token,
        };
        localStorage.setItem('unimart_user', JSON.stringify(updatedUser));
      }

      // Close modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-unimart-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-gray-600">{userData.email}</p>
                <p className="text-gray-600">{userData.department} • {userData.year}</p>
                {userData.location && <p className="text-gray-600">{userData.location}</p>}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={editForm.avatar || userData.avatar} />
                    <AvatarFallback>{editForm.name?.charAt(0) || userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department
                  </Label>
                  <Select
                    value={editForm.department}
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">
                    Year
                  </Label>
                  <Select
                    value={editForm.year}
                    onValueChange={(value) => handleSelectChange('year', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="listings" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Saved Items
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Transaction History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Listed Products</h2>
              <Button className="bg-unimart-600 hover:bg-unimart-700">
                Add New Listing
              </Button>
            </div>
            
            {userData.listedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.listedProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-6">You haven't listed any products for sale yet.</p>
                <Button className="bg-unimart-600 hover:bg-unimart-700">
                  Create your first listing
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Saved Products</h2>
            
            {userData.savedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.savedProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">❤️</div>
                <h3 className="text-lg font-medium mb-2">No saved items</h3>
                <p className="text-gray-500 mb-6">You haven't saved any products yet.</p>
                <Button variant="outline">
                  Browse products
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            
            {userData.transactions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y">
                  {userData.transactions.map(transaction => (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={transaction.type === "sold" ? "default" : "secondary"} className="capitalize">
                            {transaction.type}
                          </Badge>
                          <div className="font-medium">{transaction.item}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="font-medium mr-4">₹{transaction.price}</div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{transaction.date}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {transaction.type === "sold" ? `Sold to ${transaction.buyer}` : `Purchased from ${transaction.seller}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">No transaction history</h3>
                <p className="text-gray-500">You haven't made any transactions yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
