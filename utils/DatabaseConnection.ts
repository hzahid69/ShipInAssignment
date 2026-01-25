import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Database Connection Manager
 * Handles PostgreSQL connections for test automation
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;
  private client: PoolClient | null = null;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "mydatabase",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Handle pool errors
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  /**
   * Get singleton instance of DatabaseConnection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Get a client from the pool
   */
  public async getClient(): Promise<PoolClient> {
    if (!this.client) {
      this.client = await this.pool.connect();
    }
    return this.client;
  }

  /**
   * Execute a query with parameters
   */
  public async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await this.getClient();
    try {
      return await client.query(text, params);
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  public async transaction(
    queries: Array<{ text: string; params?: any[] }>
  ): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");

      await Promise.all(
        queries.map((query) => client.query(query.text, query.params))
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", error);
      throw error;
    }
  }

  /**
   * Reset the client connection (useful for cleanup)
   */
  public async resetClient(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
    await this.pool.end();
  }

  /**
   * Test database connectivity
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query("SELECT NOW()");
      console.log("Database connection successful:", result.rows[0]);
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }
}
