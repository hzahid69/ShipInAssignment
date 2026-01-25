import { test, expect } from '@playwright/test';
import { DatabaseService } from '../../utils/DatabaseService';
import { DatabaseTestData } from '../../utils/DatabaseTestData';
import { User } from '../../utils/DatabaseModels';

/**
 * User CRUD Operations Test Suite
 * Tests all Create, Read, Update, Delete operations for User entity
 */
test.describe('User CRUD Operations', () => {
  let dbService: DatabaseService;
  let testUsers: User[];

  test.beforeAll(async () => {
    // Initialize database service and schema
    dbService = new DatabaseService();
    await dbService.initializeDatabase();
    
    // Generate test data
    testUsers = DatabaseTestData.generateUsers(3);
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
    test('should create a single user successfully', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      
      const createdUser = await dbService.createUser(userData);
      
      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.username).toBe(userData.username);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.first_name).toBe(userData.first_name);
      expect(createdUser.last_name).toBe(userData.last_name);
      expect(createdUser.created_at).toBeDefined();
    });
    
    test('should create multiple users successfully', async () => {
      const createdUsers = await Promise.all(testUsers.map(userData => dbService.createUser(userData)));
      
      expect(createdUsers).toHaveLength(testUsers.length);
      
      // Verify each user was created correctly
      await Promise.all(createdUsers.map((createdUser, index) => {
        expect(createdUser.username).toBe(testUsers[index].username);
        expect(createdUser.email).toBe(testUsers[index].email);
        expect(createdUser.id).toBeDefined();
      }));
    });

    test('should fail to create user with duplicate email', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      
      // Create first user
      await dbService.createUser(userData);
      
      // Try to create second user with same email but different username
      const duplicateUser = { 
        ...userData, 
        username: `different_username_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      };
      
      await expect(dbService.createUser(duplicateUser)).rejects.toThrow();
    });

    test('should fail to create user with duplicate username', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      
      // Create first user
      await dbService.createUser(userData);
      
      // Try to create second user with same username but different email
      const duplicateUser = { 
        ...userData, 
        email: `different_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@example.com`
      };
      
      await expect(dbService.createUser(duplicateUser)).rejects.toThrow();
    });
  });

  test.describe('Read Operations', () => {
    test('should retrieve user by ID', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const retrievedUser = await dbService.getUserById(createdUser.id!);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser!.id).toBe(createdUser.id);
      expect(retrievedUser!.username).toBe(userData.username);
      expect(retrievedUser!.email).toBe(userData.email);
    });

    test('should retrieve user by email', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const retrievedUser = await dbService.getUserByEmail(userData.email);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser!.id).toBe(createdUser.id);
      expect(retrievedUser!.email).toBe(userData.email);
    });

    test('should return null for non-existent user ID', async () => {
      const retrievedUser = await dbService.getUserById(99999);
      
      expect(retrievedUser).toBeNull();
    });

    test('should return null for non-existent email', async () => {
      const retrievedUser = await dbService.getUserByEmail('nonexistent@example.com');
      
      expect(retrievedUser).toBeNull();
    });
    
    test('should retrieve all users', async () => {
      // Create multiple users
      const createdUsers = await Promise.all(testUsers.map(userData => dbService.createUser(userData)));
      
      const allUsers = await dbService.getAllUsers();
      
      expect(allUsers).toHaveLength(testUsers.length);
      
      // Verify all created users are in the result
      await Promise.all(createdUsers.map(createdUser => expect(allUsers.find(user => user.id === createdUser.id)).toBeDefined()));
      await Promise.all(createdUsers.map(createdUser => expect(allUsers.find(user => user.id === createdUser.id)?.username).toBe(createdUser.username)));
    });

    test('should return empty array when no users exist', async () => {
      const allUsers = await dbService.getAllUsers();
      
      expect(allUsers).toHaveLength(0);
    });
  });

  test.describe('Update Operations', () => {
    test('should update user information successfully', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const updates = {
        first_name: 'Updated First Name',
        last_name: 'Updated Last Name',
        phone: '+1-555-999-8888',
        address: 'Updated Address'
      };
      
      const updatedUser = await dbService.updateUser(createdUser.id!, updates);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.first_name).toBe(updates.first_name);
      expect(updatedUser!.last_name).toBe(updates.last_name);
      expect(updatedUser!.phone).toBe(updates.phone);
      expect(updatedUser!.address).toBe(updates.address);
      expect(updatedUser!.updated_at).toBeDefined();
      
      // Verify original fields remain unchanged
      expect(updatedUser!.username).toBe(userData.username);
      expect(updatedUser!.email).toBe(userData.email);
    });

    test('should update only specified fields', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const updates = {
        first_name: 'Partial Update'
      };
      
      const updatedUser = await dbService.updateUser(createdUser.id!, updates);
      
      expect(updatedUser!.first_name).toBe(updates.first_name);
      expect(updatedUser!.last_name).toBe(userData.last_name); // Should remain unchanged
      expect(updatedUser!.email).toBe(userData.email); // Should remain unchanged
    });

    test('should return null when updating non-existent user', async () => {
      const updates = {
        first_name: 'Updated Name'
      };
      
      const updatedUser = await dbService.updateUser(99999, updates);
      
      expect(updatedUser).toBeNull();
    });

    test('should handle empty update object', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const updatedUser = await dbService.updateUser(createdUser.id!, {});
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.id).toBe(createdUser.id);
    });
  });

  test.describe('Delete Operations', () => {
    test('should delete user successfully', async () => {
      const userData = DatabaseTestData.generateSingleUser();
      const createdUser = await dbService.createUser(userData);
      
      const deleteResult = await dbService.deleteUser(createdUser.id!);
      
      expect(deleteResult).toBe(true);
      
      // Verify user no longer exists
      const retrievedUser = await dbService.getUserById(createdUser.id!);
      expect(retrievedUser).toBeNull();
    });

    test('should return false when deleting non-existent user', async () => {
      const deleteResult = await dbService.deleteUser(99999);
      
      expect(deleteResult).toBe(false);
    });
    test('should delete multiple users', async () => {
      // Create multiple users
      const createdUsers = await Promise.all(testUsers.map(userData => dbService.createUser(userData)));
      
      // Delete all users
      const deleteResults = await Promise.all(createdUsers.map(createdUser => dbService.deleteUser(createdUser.id!)));
      expect(deleteResults.every(result => result === true)).toBe(true);
      
      // Verify all users are deleted
      const allUsers = await dbService.getAllUsers();
      expect(allUsers).toHaveLength(0);
    });
  });
}); 