import { test, expect } from "@playwright/test";
import { DatabaseConnection } from "../../utils/DatabaseConnection";
import { DatabaseService } from "../../utils/DatabaseService";

/**
 * Database Setup and Connection Test Suite
 * Tests database connectivity, schema initialization, and basic operations
 */
test.describe("Database Setup and Connection", () => {
  let dbConnection: DatabaseConnection;
  let dbService: DatabaseService;

  test.beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance();
    dbService = new DatabaseService();
  });

  test.afterAll(async () => {
    await dbConnection.close();
  });

  test.describe("Database Connection", () => {
    test("should establish database connection successfully", async () => {
      const isConnected = await dbConnection.testConnection();

      expect(isConnected).toBe(true);
    });

    test("should handle connection pool properly", async () => {
      // Test multiple concurrent queries
      const promises: Promise<any>[] = Array.from({ length: 5 }, (_, i) =>
        dbConnection.query("SELECT $1 as test_value", [i])
      );

      const results = await Promise.all(promises);

      const testValues = await Promise.all(
        results.map((result) => result.rows[0].test_value)
      );
      expect(testValues).toEqual(["0", "1", "2", "3", "4"]);
    });

    test("should handle connection errors gracefully", async () => {
      // Test invalid query
      await expect(
        dbConnection.query("SELECT * FROM non_existent_table")
      ).rejects.toThrow();
    });
  });

  test.describe("Database Schema", () => {
    test("should initialize database schema successfully", async () => {
      await expect(dbService.initializeDatabase()).resolves.not.toThrow();
    });

    test("should create all required tables", async () => {
      // Check if tables exist
      const tables = ["users", "products", "orders", "order_items"];
      const results = await Promise.all(
        tables.map((table) =>
          dbConnection.query(
            `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            );
          `,
            [table]
          )
        )
      );

      const existsValues = results.map((result) => result.rows[0].exists);
      expect(existsValues).toEqual(tables.map(() => true));
    });

    test("should have correct table structure", async () => {
      // Check users table structure
      const userColumns = await dbConnection.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      expect(userColumns.rows.length).toBeGreaterThan(0);

      // Check for required columns
      const columnNames = userColumns.rows.map((row) => row.column_name);
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("username");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("password");
      expect(columnNames).toContain("first_name");
      expect(columnNames).toContain("last_name");
    });
  });

  test.describe("Database Transactions", () => {
    test("should handle transactions successfully", async () => {
      const queries = [
        {
          text: "CREATE TEMP TABLE test_transaction (id SERIAL, name TEXT)",
          params: [],
        },
        {
          text: "INSERT INTO test_transaction (name) VALUES ($1)",
          params: ["Test 1"],
        },
        {
          text: "INSERT INTO test_transaction (name) VALUES ($1)",
          params: ["Test 2"],
        },
        { text: "SELECT COUNT(*) as count FROM test_transaction", params: [] },
      ];

      await expect(dbConnection.transaction(queries)).resolves.not.toThrow();
    });

    test("should rollback transaction on error", async () => {
      const queries = [
        {
          text: "CREATE TEMP TABLE test_rollback (id SERIAL, name TEXT)",
          params: [],
        },
        {
          text: "INSERT INTO test_rollback (name) VALUES ($1)",
          params: ["Test 1"],
        },
        {
          text: "INSERT INTO test_rollback (name) VALUES ($1)",
          params: ["Test 2"],
        },
        { text: "SELECT * FROM non_existent_table", params: [] }, // This will cause an error
      ];

      await expect(dbConnection.transaction(queries)).rejects.toThrow();
    });
  });

  test.describe("Data Cleanup", () => {
    test("should cleanup test data successfully", async () => {
      // First create some test data
      await dbService.initializeDatabase();

      // Clean up should not throw an error
      await expect(dbService.cleanupTestData()).resolves.not.toThrow();
    });

    test("should handle cleanup on empty database", async () => {
      // Clean up on already empty database
      await expect(dbService.cleanupTestData()).resolves.not.toThrow();
    });
  });

  test.describe("Performance Tests", () => {
    test("should handle concurrent operations efficiently", async () => {
      const startTime = Date.now();

      // Perform multiple concurrent operations
      const operations = Array.from({ length: 10 }, (_, i) =>
        dbConnection.query("SELECT $1 as concurrent_test", [i])
      );

      await Promise.all(operations);

      const results = await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    test("should handle large result sets efficiently", async () => {
      // Create a large temporary dataset
      await dbConnection.query(
        "CREATE TEMP TABLE temp_large_dataset (id SERIAL, value INTEGER)"
      );

      const insertPromises = Array.from({ length: 1000 }, (_, i) =>
        dbConnection.query(
          "INSERT INTO temp_large_dataset (value) VALUES ($1)",
          [i]
        )
      );
      await dbConnection.transaction(insertPromises);

      // Query large dataset
      const startTime = Date.now();
      const { rows } = await dbConnection.query(
        "SELECT COUNT(*) as count FROM temp_large_dataset"
      );
      const duration = Date.now() - startTime;

      expect(rows[0].count).toBe("1000");
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  test.describe("Error Handling", () => {
    test("should handle invalid SQL gracefully", async () => {
      await expect(
        dbConnection.query("INVALID SQL STATEMENT")
      ).rejects.toThrow();
    });

    test("should handle connection timeout", async () => {
      // This test simulates a potential timeout scenario
      const longRunningQuery = dbConnection.query("SELECT pg_sleep(5)");

      // We expect this to either complete or timeout gracefully
      await expect(longRunningQuery).resolves.toBeDefined();
    });

    test("should handle parameter binding errors", async () => {
      // Test with wrong number of parameters
      await expect(dbConnection.query("SELECT $1, $2", [1])).rejects.toThrow();
    });
  });
});
