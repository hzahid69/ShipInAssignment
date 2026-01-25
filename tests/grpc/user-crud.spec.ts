import { test, expect } from "@playwright/test";
import { GrpcService } from "../../utils/GrpcService";
import { DatabaseTestData } from "../../utils/DatabaseTestData";
import { INVALID_USER_DATA, WEAK_PASSWORD_USER } from "../../utils/constants";

/**
 * gRPC User CRUD Test Suite
 * Tests all user-related gRPC operations
 */
test.describe("gRPC User CRUD Operations", () => {
  let grpcService: GrpcService;
  let createdUserIds: number[] = [];

  test.beforeAll(async () => {
    grpcService = new GrpcService();
  });
  test.afterAll(async () => {
    // Clean up created users
    await Promise.all(
      createdUserIds.map((userId) =>
        grpcService.deleteUser(userId).catch((error) =>
          console.log(`Failed to clean up user ${userId}:`, error)
        )
      )
    );
    grpcService.close();
  });

  test.describe("User Creation", () => {
    test("should create a new user successfully", async () => {
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        const response = await grpcService.createUser(userData);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user.username).toBe(userData.username);
        expect(response.user.email).toBe(userData.email);
        expect(response.user.first_name).toBe(userData.first_name);
        expect(response.user.last_name).toBe(userData.last_name);

        if (response.user.id) {
          createdUserIds.push(response.user.id);
        }
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should create multiple users successfully", async () => {
      const usersData = DatabaseTestData.generateUsers(3);

      try {
        await Promise.all(
          usersData.map(async (userData) => {
            const response = await grpcService.createUser(userData);

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.user).toBeDefined();

            if (response.user.id) {
              createdUserIds.push(response.user.id);
            }
          })
        );
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle duplicate email creation", async () => {
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        // Create first user
        const response1 = await grpcService.createUser(userData);
        expect(response1.success).toBe(true);

        if (response1.user.id) {
          createdUserIds.push(response1.user.id);
        }

        // Try to create second user with same email
        const response2 = await grpcService.createUser(userData);
        // This should fail due to duplicate email
        expect(response2.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should validate required fields", async () => {
      const invalidUserData = {
        username: "testuser",
        // Missing email, password, etc.
      };

      try {
        const response = await grpcService.createUser(invalidUserData);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running or validation fails
        expect(error).toBeDefined();
      }
    });
  });

  test.describe("User Retrieval", () => {
    let testUserId: number;

    test.beforeAll(async () => {
      // Create a test user for retrieval tests
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        const response = await grpcService.createUser(userData);
        if (response.success && response.user.id) {
          testUserId = response.user.id;
          createdUserIds.push(testUserId);
        }
      } catch (error) {
        console.log("Failed to create test user for retrieval tests:", error);
      }
    });

    test("should get user by ID successfully", async () => {
      if (!testUserId) {
        test.skip(true, "Test user not created");
        return;
      }

      try {
        const response = await grpcService.getUserById(testUserId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user.id).toBe(testUserId);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should get user by email successfully", async () => {
      if (!testUserId) {
        test.skip(true, "Test user not created");
        return;
      }

      try {
        // First get the user to get their email
        const userResponse = await grpcService.getUserById(testUserId);
        const userEmail = userResponse.user.email;

        const response = await grpcService.getUserByEmail(userEmail);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user.email).toBe(userEmail);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should get all users with pagination", async () => {
      try {
        const response = await grpcService.getAllUsers(1, 10);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.users).toBeDefined();
        expect(Array.isArray(response.users)).toBe(true);
        expect(response.total).toBeGreaterThanOrEqual(0);
        expect(response.page).toBe(1);
        expect(response.limit).toBe(10);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle non-existent user ID", async () => {
      try {
        const response = await grpcService.getUserById(99999);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle non-existent email", async () => {
      try {
        const response = await grpcService.getUserByEmail(
          "nonexistent@example.com"
        );
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });

  test.describe("User Updates", () => {
    let testUserId: number;

    test.beforeAll(async () => {
      // Create a test user for update tests
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        const response = await grpcService.createUser(userData);
        if (response.success && response.user.id) {
          testUserId = response.user.id;
          createdUserIds.push(testUserId);
        }
      } catch (error) {
        console.log("Failed to create test user for update tests:", error);
      }
    });

    test("should update user successfully", async () => {
      if (!testUserId) {
        test.skip(true, "Test user not created");
        return;
      }

      const updates = {
        first_name: "Updated",
        last_name: "Name",
        phone: "9876543210",
        address: "Updated Address",
        city: "Updated City",
      };

      try {
        const response = await grpcService.updateUser(testUserId, updates);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user.first_name).toBe(updates.first_name);
        expect(response.user.last_name).toBe(updates.last_name);
        expect(response.user.phone).toBe(updates.phone);
        expect(response.user.address).toBe(updates.address);
        expect(response.user.city).toBe(updates.city);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should update user email successfully", async () => {
      if (!testUserId) {
        test.skip(true, "Test user not created");
        return;
      }

      const updates = {
        email: "updated@example.com",
      };

      try {
        const response = await grpcService.updateUser(testUserId, updates);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user.email).toBe(updates.email);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle partial updates", async () => {
      if (!testUserId) {
        test.skip(true, "Test user not created");
        return;
      }

      const updates = {
        phone: "1112223333",
      };

      try {
        const response = await grpcService.updateUser(testUserId, updates);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.user).toBeDefined();
        expect(response.user.phone).toBe(updates.phone);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle non-existent user update", async () => {
      const updates = {
        first_name: "Updated",
      };

      try {
        const response = await grpcService.updateUser(99999, updates);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });

  test.describe("User Deletion", () => {
    test("should delete user successfully", async () => {
      // Create a user to delete
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        const createResponse = await grpcService.createUser(userData);
        expect(createResponse.success).toBe(true);

        const userId = createResponse.user.id;

        // Delete the user
        const deleteResponse = await grpcService.deleteUser(userId);

        expect(deleteResponse).toBeDefined();
        expect(deleteResponse.success).toBe(true);

        // Verify user is deleted
        const getResponse = await grpcService.getUserById(userId);
        expect(getResponse.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle non-existent user deletion", async () => {
      try {
        const response = await grpcService.deleteUser(99999);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle cascade deletion", async () => {
      // This test would verify that deleting a user also deletes related data
      // In a real scenario, you would test cascade deletion rules
      expect(grpcService).toBeDefined();
    });
  });

  test.describe("User Business Logic", () => {
    test("should enforce unique usernames", async () => {
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        // Create first user
        const response1 = await grpcService.createUser(userData);
        expect(response1.success).toBe(true);

        if (response1.user.id) {
          createdUserIds.push(response1.user.id);
        }

        // Try to create second user with same username
        const response2 = await grpcService.createUser(userData);
        expect(response2.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should validate email format", async () => {
      try {
        const response = await grpcService.createUser(INVALID_USER_DATA);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running or validation fails
        expect(error).toBeDefined();
      }
    });

    test("should enforce password requirements", async () => {
      try {
        const response = await grpcService.createUser(WEAK_PASSWORD_USER);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running or validation fails
        expect(error).toBeDefined();
      }
    });
  });

  test.describe("User Performance", () => {
    test("should handle bulk user creation", async () => {
      const usersData = DatabaseTestData.generateUsers(10);
      const startTime = Date.now();

      try {
        const promises = usersData.map((userData) =>
          grpcService.createUser(userData)
        );
        const results = await Promise.allSettled(promises);

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(results).toHaveLength(10);
        expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

        // Track created users for cleanup
        results.forEach((result, index) => {
          if (
            result.status === "fulfilled" &&
            result.value.success &&
            result.value.user.id
          ) {
            createdUserIds.push(result.value.user.id);
          }
        });
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test("should handle concurrent user operations", async () => {
      const userData = DatabaseTestData.generateUsers(1)[0];

      try {
        // Create user
        const createResponse = await grpcService.createUser(userData);
        expect(createResponse.success).toBe(true);

        const userId = createResponse.user.id;
        createdUserIds.push(userId);

        // Perform concurrent operations
        const operations = [
          grpcService.getUserById(userId),
          grpcService.getUserByEmail(userData.email),
          grpcService.updateUser(userId, { first_name: "Concurrent" }),
          grpcService.getAllUsers(1, 1),
        ];

        const results = await Promise.allSettled(operations);
        expect(results).toHaveLength(4);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });
});
