import { test, expect } from '@playwright/test';
import { DatabaseService } from '../../utils/DatabaseService';
import { DatabaseTestData } from '../../utils/DatabaseTestData';
import { User, Product, Order, OrderItem, OrderStatus } from '../../utils/DatabaseModels';

/**
 * Order CRUD Operations Test Suite
 * Tests all Create, Read, Update, Delete operations for Order entity and Order Items
 */
test.describe('Order CRUD Operations', () => {
  let dbService: DatabaseService;
  let testUsers: User[];
  let testProducts: Product[];

  test.beforeAll(async () => {
    // Initialize database service and schema
    dbService = new DatabaseService();
    await dbService.initializeDatabase();
    
    // Generate test data
    testUsers = DatabaseTestData.generateUsers(3);
    testProducts = DatabaseTestData.generateProducts(5);
  });

  test.afterAll(async () => {
    // Clean up all test data
    await dbService.cleanupTestData();
  });

  test.beforeEach(async () => {
    // Clean up before each test to ensure isolation
    await dbService.cleanupTestData();
    
    // Small delay to ensure cleanup is processed
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test.describe('Create Operations', () => {
    test('should create a single order successfully', async () => {
      // First create a user
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const orderData = DatabaseTestData.generateSingleOrder(createdUser.id!);
      
      const createdOrder = await dbService.createOrder(orderData);
      
      expect(createdOrder).toBeDefined();
      expect(createdOrder.id).toBeDefined();
      expect(createdOrder.user_id).toBe(createdUser.id);
      expect(createdOrder.order_number).toBe(orderData.order_number);
      expect(createdOrder.total_amount).toBe(orderData.total_amount.toString());
      expect(createdOrder.status).toBe(orderData.status);
      expect(createdOrder.shipping_address).toBe(orderData.shipping_address);
      expect(createdOrder.billing_address).toBe(orderData.billing_address);
      expect(createdOrder.payment_method).toBe(orderData.payment_method);
      expect(createdOrder.created_at).toBeDefined();
    });
    test('should create multiple orders successfully', async () => {
      // First create users
      const createdUsers = await Promise.all(testUsers.map(userData => dbService.createUser(userData)));
      
      // Debug: Check database state after user creation
      await dbService.debugDatabaseState();
      
      // Generate orders for these users
      const userIds = createdUsers.map(user => user.id!);
      const ordersData = DatabaseTestData.generateOrders(userIds, 5);
      
      const createdOrders = await Promise.all(ordersData.map(orderData => dbService.createOrder(orderData)));
      
      expect(createdOrders).toHaveLength(5);
      
      // Verify each order was created correctly
      createdOrders.forEach((order, index) => {
        expect(order.order_number).toBe(ordersData[index].order_number);
        expect(order.user_id).toBe(ordersData[index].user_id);
        expect(order.id).toBeDefined();
      });
    });

    test('should fail to create order with non-existent user', async () => {
      const orderData = DatabaseTestData.generateSingleOrder(99999); // Non-existent user ID
      
      await expect(dbService.createOrder(orderData)).rejects.toThrow();
    });
  });

  test.describe('Read Operations', () => {
    test('should retrieve order by ID', async () => {
      // First create a user and order
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      const orderData = DatabaseTestData.generateSingleOrder(createdUser.id!);
      const createdOrder = await dbService.createOrder(orderData);
      
      const retrievedOrder = await dbService.getOrderById(createdOrder.id!);
      
      expect(retrievedOrder).toBeDefined();
      expect(retrievedOrder!.id).toBe(createdOrder.id);
      expect(retrievedOrder!.order_number).toBe(orderData.order_number);
      expect(retrievedOrder!.user_id).toBe(createdUser.id);
    });

    test('should retrieve order by order number', async () => {
      // First create a user and order
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      const orderData = DatabaseTestData.generateSingleOrder(createdUser.id!);
      const createdOrder = await dbService.createOrder(orderData);
      
      const retrievedOrder = await dbService.getOrderByNumber(orderData.order_number);
      
      expect(retrievedOrder).toBeDefined();
      expect(retrievedOrder!.id).toBe(createdOrder.id);
      expect(retrievedOrder!.order_number).toBe(orderData.order_number);
    });

    test('should return null for non-existent order ID', async () => {
      const retrievedOrder = await dbService.getOrderById(99999);
      
      expect(retrievedOrder).toBeNull();
    });

    test('should retrieve all orders', async () => {
      // First create users
      const createdUsers = await Promise.all(testUsers.map(userData => dbService.createUser(userData)));
      
      // Create orders
      const userIds = createdUsers.map(user => user.id!);
      const ordersData = DatabaseTestData.generateOrders(userIds, 5);
      
      const createdOrders = await Promise.all(
        ordersData.map(orderData => dbService.createOrder(orderData))
      );
      
      const allOrders = await dbService.getAllOrders();
      
      expect(allOrders).toHaveLength(5);
      
      // Verify all created orders are in the result
      const foundOrders = await Promise.all(
        createdOrders.map(createdOrder => allOrders.find(order => order.id === createdOrder.id))
      );
      
      const foundOrdersMap = createdOrders.reduce((map, createdOrder) => {
        const foundOrder = allOrders.find(order => order.id === createdOrder.id);
        expect(foundOrder).toBeDefined();
        expect(foundOrder!.order_number).toBe(createdOrder.order_number);
        if (createdOrder.id !== undefined) {
          map[createdOrder.id] = foundOrder;
        }
        return map;
      }, {} as Record<number, Order | undefined>);
    });

    test('should retrieve orders by user ID', async () => {
      // First create users
      const userData1 = DatabaseTestData.generateSingleUser();
      const userData2 = DatabaseTestData.generateSingleUser();
      userData2.username = 'user2';
      userData2.email = 'user2@example.com';
      
      const createdUser1 = await dbService.createUser(userData1);
      const createdUser2 = await dbService.createUser(userData2);
      
      // Create orders for both users
      const order1 = DatabaseTestData.generateSingleOrder(createdUser1.id!);
      const order2 = DatabaseTestData.generateSingleOrder(createdUser1.id!);
      order2.order_number = 'ORD-USER1-002';
      const order3 = DatabaseTestData.generateSingleOrder(createdUser2.id!);
      order3.order_number = 'ORD-USER2-001';
      
      await dbService.createOrder(order1);
      await dbService.createOrder(order2);
      await dbService.createOrder(order3);
      
      const user1Orders = await dbService.getOrdersByUserId(createdUser1.id!);
      
      expect(user1Orders).toHaveLength(2);
      expect(user1Orders.every(o => o.user_id === createdUser1.id)).toBe(true);
    });
  });

  test.describe('Update Operations', () => {
    test('should update order status successfully', async () => {
      // First create a user and order
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      const orderData = DatabaseTestData.generateSingleOrder(createdUser.id!);
      const createdOrder = await dbService.createOrder(orderData);
      
      const newStatus = OrderStatus.CONFIRMED;
      const updatedOrder = await dbService.updateOrderStatus(createdOrder.id!, newStatus);
      
      expect(updatedOrder).toBeDefined();
      expect(updatedOrder!.status).toBe(newStatus);
      expect(updatedOrder!.id).toBe(createdOrder.id);
    });

    test('should fail to update non-existent order', async () => {
      await expect(dbService.updateOrderStatus(99999, OrderStatus.CONFIRMED)).rejects.toThrow();
    });
  });

  test.describe('Delete Operations', () => {
    test('should delete order successfully', async () => {
      // First create a user and order
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      const orderData = DatabaseTestData.generateSingleOrder(createdUser.id!);
      const createdOrder = await dbService.createOrder(orderData);
      
      const deleteResult = await dbService.deleteOrder(createdOrder.id!);
      
      expect(deleteResult).toBe(true);
      
      // Verify order is deleted
      const retrievedOrder = await dbService.getOrderById(createdOrder.id!);
      expect(retrievedOrder).toBeNull();
    });

    test('should fail to delete non-existent order', async () => {
      const deleteResult = await dbService.deleteOrder(99999);
      
      expect(deleteResult).toBe(false);
    });
  });
}); 