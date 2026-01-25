import { User, Product, Order, OrderItem, OrderStatus } from './DatabaseModels';

/**
 * Test Data Generator
 * Provides sample data for database testing scenarios
 */
export class DatabaseTestData {
  
  /**
   * Generate sample user data
   */
  static generateUsers(count: number = 5): User[] {
    const users: User[] = [];
    
    Array.from({ length: count }, (_, i) => i + 1).forEach(index => {
      users.push({
        username: `testuser${index}`,
        email: `testuser${index}@example.com`,
        password: `password${index}`,
        first_name: `Test${index}`,
        last_name: `User${index}`,
        phone: `+1-555-${String(index).padStart(3, '0')}-${String(index).padStart(4, '0')}`,
        address: `${index} Test Street`,
        city: 'Test City',
        state: 'TS',
        zip_code: `${String(index).padStart(5, '0')}`,
        country: 'Test Country'
      });
    });
    
    return users;
  }

  /**
   * Generate sample product data
   */
  static generateProducts(count: number = 10): Product[] {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
    const brands = ['TestBrand', 'SampleCorp', 'DemoInc', 'MockLtd', 'FakeCo'];
    
    const products: Product[] = [];
    Array.from({ length: count }, (_, i) => {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      
      products.push({
        name: `Test Product ${i + 1}`,
        description: `This is a test product ${i + 1} for testing purposes. It belongs to the ${category} category.`,
        price: Math.round((Math.random() * 1000 + 10) * 100) / 100, // Random price between 10-1010
        category: category,
        brand: brand,
        stock_quantity: Math.floor(Math.random() * 100) + 1,
        sku: `SKU-${String(i + 1).padStart(6, '0')}`,
        image_url: `https://example.com/images/product${i + 1}.jpg`,
        is_active: Math.random() > 0.1 // 90% chance of being active
      });
    });
    return products;
  }

  /**
   * Generate sample order data
   */
  static generateOrders(userIds: number[], count: number = 8): Order[] {
    const statuses = Object.values(OrderStatus);
    const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'];
    
    const orders = userIds.flatMap((userId, index) => {
      const status = statuses[index % statuses.length];
      const paymentMethod = paymentMethods[index % paymentMethods.length];
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      
      return {
        user_id: userId,
        order_number: `ORD-${timestamp}-${index + 1}-${randomSuffix}`,
        total_amount: Math.round((Math.random() * 500 + 50) * 100) / 100, // Random amount between 50-550
        status: status,
        shipping_address: `${index + 1} Shipping Street, Test City, TS ${String(index + 1).padStart(5, '0')}`,
        billing_address: `${index + 1} Billing Street, Test City, TS ${String(index + 1).padStart(5, '0')}`,
        payment_method: paymentMethod
      };
    });
    
    return orders;
  }

  /**
   * Generate sample order item data
   */
  static generateOrderItems(orderIds: number[], productIds: number[], count: number = 15): OrderItem[] {
    return Array.from({ length: count }, (_, i) => {
      const orderId = orderIds[i % orderIds.length];
      const productId = productIds[i % productIds.length];
      const quantity = Math.floor(Math.random() * 5) + 1; // Random quantity 1-5
      const unitPrice = Math.round((Math.random() * 100 + 10) * 100) / 100; // Random price 10-110
      const totalPrice = Math.round(quantity * unitPrice * 100) / 100;
      
      return {
        order_id: orderId,
        product_id: productId,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      };
    });
  }

  /**
   * Generate a complete test dataset
   */
  static generateCompleteTestData(): {
    users: User[];
    products: Product[];
    orders: Order[];
    orderItems: OrderItem[];
  } {
    const users = this.generateUsers(5);
    const products = this.generateProducts(10);
    
    // Note: orders and orderItems should be generated with actual database IDs
    // This method is for reference only - use actual IDs in tests
    const orders: Order[] = [];
    const orderItems: OrderItem[] = [];
    
    return {
      users,
      products,
      orders,
      orderItems
    };
  }

  /**
   * Generate a single test user
   */
  static generateSingleUser(): User {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    return {
      username: `singletestuser_${timestamp}_${randomSuffix}`,
      email: `singletestuser_${timestamp}_${randomSuffix}@example.com`,
      password: 'testpassword123',
      first_name: 'Single',
      last_name: 'TestUser',
      phone: '+1-555-123-4567',
      address: '123 Single Test Street',
      city: 'Single Test City',
      state: 'ST',
      zip_code: '12345',
      country: 'Single Test Country'
    };
  }

  /**
   * Generate a single test product
   */
  static generateSingleProduct(): Product {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    return {
      name: `Single Test Product ${timestamp}`,
      description: 'This is a single test product for individual testing scenarios.',
      price: 99.99,
      category: 'Electronics',
      brand: 'SingleTestBrand',
      stock_quantity: 50,
      sku: `SKU-SINGLE-${timestamp}-${randomSuffix}`,
      image_url: 'https://example.com/images/single-product.jpg',
      is_active: true
    };
  }

  /**
   * Generate a single test order
   */
  static generateSingleOrder(userId: number): Order {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    return {
      user_id: userId,
      order_number: `ORD-SINGLE-${timestamp}-${randomSuffix}`,
      total_amount: 199.99,
      status: OrderStatus.PENDING,
      shipping_address: '123 Single Shipping Street, Single Test City, ST 12345',
      billing_address: '123 Single Billing Street, Single Test City, ST 12345',
      payment_method: 'Credit Card'
    };
  }

  /**
   * Generate a single test order item
   */
  static generateSingleOrderItem(orderId: number, productId: number): OrderItem {
    return {
      order_id: orderId,
      product_id: productId,
      quantity: 2,
      unit_price: 49.99,
      total_price: 99.98
    };
  }

  /**
   * Generate test data for specific scenarios
   */
  static generateScenarioData(scenario: 'minimal' | 'large' | 'mixed'): {
    users: User[];
    products: Product[];
    orders: Order[];
    orderItems: OrderItem[];
  } {
    switch (scenario) {
      case 'minimal':
        return {
          users: this.generateUsers(2),
          products: this.generateProducts(3),
          orders: [], // Should be generated with actual user IDs
          orderItems: [] // Should be generated with actual order/product IDs
        };
      
      case 'large':
        return {
          users: this.generateUsers(20),
          products: this.generateProducts(50),
          orders: [], // Should be generated with actual user IDs
          orderItems: [] // Should be generated with actual order/product IDs
        };
      
      case 'mixed':
        return {
          users: this.generateUsers(10),
          products: this.generateProducts(25),
          orders: [], // Should be generated with actual user IDs
          orderItems: [] // Should be generated with actual order/product IDs
        };
      
      default:
        return this.generateCompleteTestData();
    }
  }
} 