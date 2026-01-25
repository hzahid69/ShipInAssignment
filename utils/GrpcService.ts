import { GrpcClient } from './GrpcClient';
import { DatabaseTestData } from './DatabaseTestData';
import { STATUS } from './constants';

/**
 * gRPC Service Layer
 * Provides CRUD operations for all entities using gRPC
 */
export class GrpcService {
  private grpcClient: GrpcClient;

  constructor() {
    this.grpcClient = GrpcClient.getInstance();
  }

  // ==================== USER CRUD OPERATIONS ====================

  /**
   * Create a new user via gRPC
   */
  async createUser(userData: any): Promise<any> {
    try {
      const userService = this.grpcClient.getUserService();
      const request = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zip_code: userData.zip_code || '',
        country: userData.country || ''
      };

      const response = await this.grpcClient.executeCall(userService, 'CreateUser', request);
      console.log(`User created via gRPC: ${userData.username}`);
      return response;
    } catch (error) {
      console.error('Failed to create user via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get user by ID via gRPC
   */
  async getUserById(id: number): Promise<any> {
    try {
      const userService = this.grpcClient.getUserService();
      const request = { id };

      const response = await this.grpcClient.executeCall(userService, 'GetUserById', request);
      return response;
    } catch (error) {
      console.error('Failed to get user by ID via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get user by email via gRPC
   */
  async getUserByEmail(email: string): Promise<any> {
    try {
      const userService = this.grpcClient.getUserService();
      const request = { email };

      const response = await this.grpcClient.executeCall(userService, 'GetUserByEmail', request);
      return response;
    } catch (error) {
      console.error('Failed to get user by email via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get all users via gRPC
   */
  async getAllUsers(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const userService = this.grpcClient.getUserService();
      const request = { page, limit };

      const response = await this.grpcClient.executeCall(userService, 'GetAllUsers', request);
      return response;
    } catch (error) {
      console.error('Failed to get all users via gRPC:', error);
      throw error;
    }
  }

  /**
   * Update user via gRPC
   */
  async updateUser(id: number, updates: any): Promise<any> {
    try {
      const userService = this.grpcClient.getUserService();
      const request = {
        id,
        username: updates.username || '',
        email: updates.email || '',
        password: updates.password || '',
        first_name: updates.first_name || '',
        last_name: updates.last_name || '',
        phone: updates.phone || '',
        address: updates.address || '',
        city: updates.city || '',
        state: updates.state || '',
        zip_code: updates.zip_code || '',
        country: updates.country || ''
      };

      const response = await this.grpcClient.executeCall(userService, 'UpdateUser', request);
      console.log(`User updated via gRPC: ID ${id}`);
      return response;
    } catch (error) {
      console.error('Failed to update user via gRPC:', error);
      throw error;
    }
  }

  /**
   * Delete user via gRPC
   */
  async deleteUser(id: number): Promise<any> {
    try {
      const userService = this.grpcClient.getUserService();
      const request = { id };

      const response = await this.grpcClient.executeCall(userService, 'DeleteUser', request);
      console.log(`User deleted via gRPC: ID ${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete user via gRPC:', error);
      throw error;
    }
  }

  // ==================== PRODUCT CRUD OPERATIONS ====================

  /**
   * Create a new product via gRPC
   */
  async createProduct(productData: any): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        brand: productData.brand,
        stock_quantity: productData.stock_quantity,
        sku: productData.sku,
        image_url: productData.image_url || '',
        is_active: productData.is_active !== undefined ? productData.is_active : true
      };

      const response = await this.grpcClient.executeCall(productService, 'CreateProduct', request);
      console.log(`Product created via gRPC: ${productData.name}`);
      return response;
    } catch (error) {
      console.error('Failed to create product via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get product by ID via gRPC
   */
  async getProductById(id: number): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = { id };

      const response = await this.grpcClient.executeCall(productService, 'GetProductById', request);
      return response;
    } catch (error) {
      console.error('Failed to get product by ID via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get product by SKU via gRPC
   */
  async getProductBySku(sku: string): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = { sku };

      const response = await this.grpcClient.executeCall(productService, 'GetProductBySku', request);
      return response;
    } catch (error) {
      console.error('Failed to get product by SKU via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get all products via gRPC
   */
  async getAllProducts(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = { page, limit };

      const response = await this.grpcClient.executeCall(productService, 'GetAllProducts', request);
      return response;
    } catch (error) {
      console.error('Failed to get all products via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get products by category via gRPC
   */
  async getProductsByCategory(category: string, page: number = 1, limit: number = 100): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = { category, page, limit };

      const response = await this.grpcClient.executeCall(productService, 'GetProductsByCategory', request);
      return response;
    } catch (error) {
      console.error('Failed to get products by category via gRPC:', error);
      throw error;
    }
  }

  /**
   * Update product via gRPC
   */
  async updateProduct(id: number, updates: any): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = {
        id,
        name: updates.name || '',
        description: updates.description || '',
        price: updates.price || 0,
        category: updates.category || '',
        brand: updates.brand || '',
        stock_quantity: updates.stock_quantity || 0,
        sku: updates.sku || '',
        image_url: updates.image_url || '',
        is_active: updates.is_active !== undefined ? updates.is_active : true
      };

      const response = await this.grpcClient.executeCall(productService, 'UpdateProduct', request);
      console.log(`Product updated via gRPC: ID ${id}`);
      return response;
    } catch (error) {
      console.error('Failed to update product via gRPC:', error);
      throw error;
    }
  }

  /**
   * Delete product via gRPC
   */
  async deleteProduct(id: number): Promise<any> {
    try {
      const productService = this.grpcClient.getProductService();
      const request = { id };

      const response = await this.grpcClient.executeCall(productService, 'DeleteProduct', request);
      console.log(`Product deleted via gRPC: ID ${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete product via gRPC:', error);
      throw error;
    }
  }

  // ==================== ORDER CRUD OPERATIONS ====================

  /**
   * Create a new order via gRPC
   */
  async createOrder(orderData: any): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = {
        user_id: orderData.user_id,
        order_number: orderData.order_number,
        total_amount: orderData.total_amount,
        status: orderData.status || STATUS.PENDING,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        payment_method: orderData.payment_method
      };

      const response = await this.grpcClient.executeCall(orderService, 'CreateOrder', request);
      console.log(`Order created via gRPC: ${orderData.order_number}`);
      return response;
    } catch (error) {
      console.error('Failed to create order via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get order by ID via gRPC
   */
  async getOrderById(id: number): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { id };

      const response = await this.grpcClient.executeCall(orderService, 'GetOrderById', request);
      return response;
    } catch (error) {
      console.error('Failed to get order by ID via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get order by order number via gRPC
   */
  async getOrderByNumber(orderNumber: string): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { order_number: orderNumber };

      const response = await this.grpcClient.executeCall(orderService, 'GetOrderByNumber', request);
      return response;
    } catch (error) {
      console.error('Failed to get order by number via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get all orders via gRPC
   */
  async getAllOrders(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { page, limit };

      const response = await this.grpcClient.executeCall(orderService, 'GetAllOrders', request);
      return response;
    } catch (error) {
      console.error('Failed to get all orders via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get orders by user ID via gRPC
   */
  async getOrdersByUserId(userId: number, page: number = 1, limit: number = 100): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { user_id: userId, page, limit };

      const response = await this.grpcClient.executeCall(orderService, 'GetOrdersByUserId', request);
      return response;
    } catch (error) {
      console.error('Failed to get orders by user ID via gRPC:', error);
      throw error;
    }
  }

  /**
   * Update order status via gRPC
   */
  async updateOrderStatus(id: number, status: string): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { id, status };

      const response = await this.grpcClient.executeCall(orderService, 'UpdateOrderStatus', request);
      console.log(`Order status updated via gRPC: ID ${id} to ${status}`);
      return response;
    } catch (error) {
      console.error('Failed to update order status via gRPC:', error);
      throw error;
    }
  }

  /**
   * Delete order via gRPC
   */
  async deleteOrder(id: number): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { id };

      const response = await this.grpcClient.executeCall(orderService, 'DeleteOrder', request);
      console.log(`Order deleted via gRPC: ID ${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete order via gRPC:', error);
      throw error;
    }
  }

  // ==================== ORDER ITEM OPERATIONS ====================

  /**
   * Add order item via gRPC
   */
  async addOrderItem(orderItemData: any): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = {
        order_id: orderItemData.order_id,
        product_id: orderItemData.product_id,
        quantity: orderItemData.quantity,
        unit_price: orderItemData.unit_price,
        total_price: orderItemData.total_price
      };

      const response = await this.grpcClient.executeCall(orderService, 'AddOrderItem', request);
      console.log(`Order item added via gRPC: Order ${orderItemData.order_id}, Product ${orderItemData.product_id}`);
      return response;
    } catch (error) {
      console.error('Failed to add order item via gRPC:', error);
      throw error;
    }
  }

  /**
   * Get order items via gRPC
   */
  async getOrderItems(orderId: number): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { order_id: orderId };

      const response = await this.grpcClient.executeCall(orderService, 'GetOrderItems', request);
      return response;
    } catch (error) {
      console.error('Failed to get order items via gRPC:', error);
      throw error;
    }
  }

  /**
   * Remove order item via gRPC
   */
  async removeOrderItem(id: number): Promise<any> {
    try {
      const orderService = this.grpcClient.getOrderService();
      const request = { id };

      const response = await this.grpcClient.executeCall(orderService, 'RemoveOrderItem', request);
      console.log(`Order item removed via gRPC: ID ${id}`);
      return response;
    } catch (error) {
      console.error('Failed to remove order item via gRPC:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Test gRPC connection
   */
  async testConnection(): Promise<boolean> {
    return await this.grpcClient.testConnection();
  }

  /**
   * Close gRPC connections
   */
  close(): void {
    this.grpcClient.close();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): any {
    return this.grpcClient.getConnectionStatus();
  }

  /**
   * Generate and create test data via gRPC
   */
  async createTestData(): Promise<{
    users: any[];
    products: any[];
    orders: any[];
  }> {
    try {
      // Create test users
      const testUsers = DatabaseTestData.generateUsers(3);
      const createdUsers = await Promise.all(
        testUsers.map(async (userData) => {
          const response = await this.createUser(userData);
          return response.success && response.user ? response.user : null;
        })
      ).then(users => users.filter(user => user !== null));

      // Create test products
      const testProducts = DatabaseTestData.generateProducts(5);
      const createdProducts = await Promise.all(
        testProducts.map(async (productData) => {
          const response = await this.createProduct(productData);
          return response.success && response.product ? response.product : null;
        })
      ).then(products => products.filter(product => product !== null));

      // Create test orders
      const userIds = createdUsers.map(user => user.id);
      const testOrders = DatabaseTestData.generateOrders(userIds, 3);
      const createdOrders = await Promise.all(
        testOrders.map(async (orderData) => {
          const response = await this.createOrder(orderData);
          return response.success && response.order ? response.order : null;
        })
      ).then(orders => orders.filter(order => order !== null));

      console.log(`Test data created via gRPC: ${createdUsers.length} users, ${createdProducts.length} products, ${createdOrders.length} orders`);
      
      return {
        users: createdUsers,
        products: createdProducts,
        orders: createdOrders
      };
    } catch (error) {
      console.error('Failed to create test data via gRPC:', error);
      throw error;
    }
  }
} 