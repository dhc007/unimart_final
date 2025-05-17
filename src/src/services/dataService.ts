import api from './api';

class DataService {
  private static instance: DataService;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Get all products with optional filters
  async getProducts(filters = {}): Promise<any[]> {
    try {
      const { data } = await api.get('/products', { params: filters });
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to localStorage if API fails
      const products = localStorage.getItem("unimart_products") || "[]";
      return JSON.parse(products);
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<any> {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      // Fallback to localStorage if API fails
      const products = JSON.parse(localStorage.getItem("unimart_products") || "[]");
      return products.find((p: any) => p.id === id || p._id === id);
    }
  }

  // Create a product
  async createProduct(productData: any): Promise<any> {
    try {
      const { data } = await api.post('/products', productData);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      // Fallback to localStorage if API fails
      const products = JSON.parse(localStorage.getItem("unimart_products") || "[]");
      const newProduct = { 
        id: Date.now().toString(), 
        _id: Date.now().toString(),
        ...productData,
        createdAt: new Date().toISOString() 
      };
      const updatedProducts = [newProduct, ...products];
      localStorage.setItem("unimart_products", JSON.stringify(updatedProducts));
      return newProduct;
    }
  }

  // Get seller's products
  async getSellerProducts(): Promise<any[]> {
    try {
      const { data } = await api.get('/products/seller');
      return data;
    } catch (error) {
      console.error('Error fetching seller products:', error);
      // Fallback to localStorage if API fails
      const user = JSON.parse(localStorage.getItem("unimart_user") || "{}");
      const products = JSON.parse(localStorage.getItem("unimart_products") || "[]");
      return products.filter((p: any) => p.seller === user._id || p.sellerName === user.name);
    }
  }

  // Search products
  async searchProducts(query: string): Promise<any[]> {
    try {
      const { data } = await api.get('/products', { params: { search: query } });
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      // Fallback to localStorage if API fails
      const products = JSON.parse(localStorage.getItem("unimart_products") || "[]");
      if (!query || query.trim() === '') {
        return products;
      }
      
      const lowercaseQuery = query.toLowerCase();
      return products.filter((product: any) => {
        const searchFields = ['title', 'description', 'category', 'subject', 'sellerName'];
        return searchFields.some(field => 
          product[field] && product[field].toLowerCase().includes(lowercaseQuery)
        );
      });
    }
  }

  // Get wishlist
  async getWishlist(): Promise<any[]> {
    try {
      const { data } = await api.get('/wishlist');
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Fallback to localStorage if API fails
      return JSON.parse(localStorage.getItem("unimart_wishlist") || "[]");
    }
  }

  // Add to wishlist
  async addToWishlist(productId: string): Promise<any[]> {
    try {
      const { data } = await api.post('/wishlist', { productId });
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to localStorage if API fails
      const wishlist = JSON.parse(localStorage.getItem("unimart_wishlist") || "[]");
      const products = JSON.parse(localStorage.getItem("unimart_products") || "[]");
      const product = products.find((p: any) => p.id === productId || p._id === productId);
      if (product && !wishlist.some((p: any) => (p.id === productId || p._id === productId))) {
        const newWishlist = [...wishlist, product];
        localStorage.setItem("unimart_wishlist", JSON.stringify(newWishlist));
        return newWishlist;
      }
      return wishlist;
    }
  }

  // Remove from wishlist
  async removeFromWishlist(productId: string): Promise<any[]> {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      return data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to localStorage if API fails
      const wishlist = JSON.parse(localStorage.getItem("unimart_wishlist") || "[]");
      const filteredWishlist = wishlist.filter((p: any) => p.id !== productId && p._id !== productId);
      localStorage.setItem("unimart_wishlist", JSON.stringify(filteredWishlist));
      return filteredWishlist;
    }
  }

  // Clear wishlist
  async clearWishlist(): Promise<any> {
    try {
      const { data } = await api.delete('/wishlist');
      return data;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      // Fallback to localStorage if API fails
      localStorage.setItem("unimart_wishlist", JSON.stringify([]));
      return { message: 'Wishlist cleared' };
    }
  }

  // User login
  async login(email: string, password: string): Promise<any> {
    try {
      const { data } = await api.post('/users/login', { email, password });
      return {
        ...data,
        isLoggedIn: true
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // User registration
  async register(userData: any): Promise<any> {
    try {
      const { data } = await api.post('/users', userData);
      return {
        ...data,
        isLoggedIn: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    try {
      const { data } = await api.get('/users/profile');
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to localStorage if API fails
      return JSON.parse(localStorage.getItem("unimart_user") || "{}");
    }
  }
}

export default DataService;