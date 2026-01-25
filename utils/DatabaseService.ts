import { DatabaseConnection } from './DatabaseConnection';
import { User, Product, Order, OrderItem, OrderStatus, CREATE_TABLES_QUERIES, CLEANUP_QUERIES } from './DatabaseModels';

/**
 * Database Service
 * Provides CRUD operations for all entities
 */
export class DatabaseService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Initialize database schema
   */
  async initializeDatabase(): Promise<void> {
    try {
      console.log('Initializing database schema...');
      
      // Create tables in order (respecting foreign key constraints)
      await this.db.query(CREATE_TABLES_QUERIES.users);
      await this.db.query(CREATE_TABLES_QUERIES.products);
      await this.db.query(CREATE_TABLES_QUERIES.orders);
      await this.db.query(CREATE_TABLES_QUERIES.order_items);
      
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  /**
   * Verify that cleanup was successful by checking if tables are empty
   */
  async verifyCleanup(): Promise<boolean> {
    try {
      const userCount = await this.db.query('SELECT COUNT(*) FROM users');
      const productCount = await this.db.query('SELECT COUNT(*) FROM products');
      const orderCount = await this.db.query('SELECT COUNT(*) FROM orders');
      const orderItemCount = await this.db.query('SELECT COUNT(*) FROM order_items');
      
      const isClean = userCount.rows[0].count === '0' && 
                     productCount.rows[0].count === '0' && 
                     orderCount.rows[0].count === '0' && 
                     orderItemCount.rows[0].count === '0';
      
      if (!isClean) {
        console.warn('Cleanup verification failed - tables not empty:', {
          users: userCount.rows[0].count,
          products: productCount.rows[0].count,
          orders: orderCount.rows[0].count,
          orderItems: orderItemCount.rows[0].count
        });
      }
      
      return isClean;
    } catch (error) {
      console.error('Failed to verify cleanup:', error);
      return false;
    }
  }

  /**
   * Clean up all test data
   */
  async cleanupTestData(): Promise<void> {
    try {
      console.log('Cleaning up test data...');
      
      // Use TRUNCATE with CASCADE to completely reset all tables and sequences
      await this.db.query('TRUNCATE TABLE order_items, orders, products, users RESTART IDENTITY CASCADE;');
      
      // Reset the client connection to ensure clean state
      await this.db.resetClient();
      
      // Verify cleanup was successful
      const isClean = await this.verifyCleanup();
      if (!isClean) {
        throw new Error('Cleanup verification failed');
      }
      
      console.log('Test data cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup test data:', error);
      // Try alternative cleanup approach with individual TRUNCATE statements
      try {
        console.log('Trying alternative cleanup approach...');
        await this.db.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;');
        await this.db.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE;');
        await this.db.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
        await this.db.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        await this.db.resetClient();
        
        const isClean = await this.verifyCleanup();
        if (!isClean) {
          throw new Error('Alternative cleanup verification failed');
        }
        
        console.log('Alternative cleanup successful');
      } catch (altError) {
        console.error('Alternative cleanup also failed:', altError);
        // Last resort: try DELETE with CASCADE
        try {
          console.log('Trying DELETE cleanup as last resort...');
          await this.db.query('DELETE FROM order_items;');
          await this.db.query('DELETE FROM orders;');
          await this.db.query('DELETE FROM products;');
          await this.db.query('DELETE FROM users;');
          await this.db.resetClient();
          
          const isClean = await this.verifyCleanup();
          if (!isClean) {
            throw new Error('DELETE cleanup verification failed');
          }
          
          console.log('DELETE cleanup successful');
        } catch (deleteError) {
          console.error('All cleanup methods failed:', deleteError);
          throw deleteError;
        }
      }
    }
  }

  /**
   * Debug method to check current database state
   */
  async debugDatabaseState(): Promise<void> {
    try {
      const userCount = await this.db.query('SELECT COUNT(*) FROM users');
      const productCount = await this.db.query('SELECT COUNT(*) FROM products');
      const orderCount = await this.db.query('SELECT COUNT(*) FROM orders');
      const orderItemCount = await this.db.query('SELECT COUNT(*) FROM order_items');
      
      console.log('Current database state:', {
        users: userCount.rows[0].count,
        products: productCount.rows[0].count,
        orders: orderCount.rows[0].count,
        orderItems: orderItemCount.rows[0].count
      });
      
      // Show existing users
      const users = await this.db.query('SELECT id, username, email FROM users ORDER BY id');
      if (users.rows.length > 0) {
        console.log('Existing users:', users.rows);
      }
    } catch (error) {
      console.error('Failed to debug database state:', error);
    }
  }

  // ==================== USER CRUD OPERATIONS ====================

  async createUser(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (username, email, password, first_name, last_name, phone, address, city, state, zip_code, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        user.username, user.email, user.password, user.first_name, user.last_name,
        user.phone, user.address, user.city, user.state, user.zip_code, user.country
      ]);
      
      const createdUser = result.rows[0];
      console.log(`User created: ${user.username} with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get user by email:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.db.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
      const values = Object.values(updates).filter((_, index) => fields[index]);
      
      if (fields.length === 0) return await this.getUserById(id);
      
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
      
      const result = await this.db.query(query, [id, ...values]);
      console.log(`User updated: ID ${id}`);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      const deleted = result.rows.length > 0;
      console.log(`User deleted: ID ${id} - ${deleted ? 'Success' : 'Not found'}`);
      return deleted;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  // ==================== PRODUCT CRUD OPERATIONS ====================

  async createProduct(product: Product): Promise<Product> {
    try {
      const query = `
        INSERT INTO products (name, description, price, category, brand, stock_quantity, sku, image_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        product.name, product.description, product.price, product.category, product.brand,
        product.stock_quantity, product.sku, product.image_url, product.is_active
      ]);
      
      console.log(`Product created: ${product.name}`);
      return result.rows[0];
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      const result = await this.db.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get product by ID:', error);
      throw error;
    }
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      const result = await this.db.query('SELECT * FROM products WHERE sku = $1', [sku]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get product by SKU:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const result = await this.db.query('SELECT * FROM products ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Failed to get all products:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const result = await this.db.query('SELECT * FROM products WHERE category = $1 ORDER BY name', [category]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get products by category:', error);
      throw error;
    }
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
      const values = Object.values(updates).filter((_, index) => fields[index]);
      
      if (fields.length === 0) return await this.getProductById(id);
      
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const query = `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
      
      const result = await this.db.query(query, [id, ...values]);
      console.log(`Product updated: ID ${id}`);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      const deleted = result.rows.length > 0;
      console.log(`Product deleted: ID ${id} - ${deleted ? 'Success' : 'Not found'}`);
      return deleted;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  // ==================== ORDER CRUD OPERATIONS ====================

  async createOrder(order: Order): Promise<Order> {
    try {
      // First verify that the user exists
      const userExists = await this.getUserById(order.user_id);
      if (!userExists) {
        throw new Error(`User with ID ${order.user_id} does not exist`);
      }
      
      const query = `
        INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, billing_address, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        order.user_id, order.order_number, order.total_amount, order.status,
        order.shipping_address, order.billing_address, order.payment_method
      ]);
      
      const createdOrder = result.rows[0];
      console.log(`Order created: ${order.order_number} for user ID: ${order.user_id}`);
      return createdOrder;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order | null> {
    try {
      const result = await this.db.query('SELECT * FROM orders WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get order by ID:', error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const result = await this.db.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get order by number:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      const result = await this.db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get orders by user ID:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const result = await this.db.query('SELECT * FROM orders ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Failed to get all orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | null> {
    try {
      const result = await this.db.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      console.log(`Order status updated: ID ${id} to ${status}`);
      return result.rows[0];
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  async deleteOrder(id: number): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
      const deleted = result.rows.length > 0;
      console.log(`Order deleted: ID ${id} - ${deleted ? 'Success' : 'Not found'}`);
      return deleted;
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  }

  // ==================== ORDER ITEM OPERATIONS ====================

  async addOrderItem(orderItem: OrderItem): Promise<OrderItem> {
    try {
      const query = `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        orderItem.order_id, orderItem.product_id, orderItem.quantity,
        orderItem.unit_price, orderItem.total_price
      ]);
      
      console.log(`Order item added: Order ${orderItem.order_id}, Product ${orderItem.product_id}`);
      return result.rows[0];
    } catch (error) {
      console.error('Failed to add order item:', error);
      throw error;
    }
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const result = await this.db.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get order items:', error);
      throw error;
    }
  }

  async removeOrderItem(id: number): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM order_items WHERE id = $1 RETURNING id', [id]);
      const deleted = result.rows.length > 0;
      console.log(`Order item deleted: ID ${id} - ${deleted ? 'Success' : 'Not found'}`);
      return deleted;
    } catch (error) {
      console.error('Failed to remove order item:', error);
      throw error;
    }
  }
} 