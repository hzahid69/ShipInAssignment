import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * gRPC Client Manager
 * Handles gRPC connections and provides a clean interface for service operations
 */
export class GrpcClient {
  private static instance: GrpcClient;
  private client: grpc.Client | null = null;
  private userService: any;
  private productService: any;
  private orderService: any;

  private constructor() {
    this.initializeServices();
  }

  /**
   * Get singleton instance of GrpcClient
   */
  public static getInstance(): GrpcClient {
    if (!GrpcClient.instance) {
      GrpcClient.instance = new GrpcClient();
    }
    return GrpcClient.instance;
  }

  /**
   * Initialize gRPC services
   */
  private initializeServices(): void {
    const protoPath = process.env.GRPC_PROTO_PATH || './proto';
    const host = process.env.GRPC_HOST || 'localhost';
    const port = process.env.GRPC_PORT || '50051';
    const address = `${host}:${port}`;

    try {
      // Load User service
      const userPackageDefinition = protoLoader.loadSync(
        path.join(protoPath, 'user.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      );
      const userProto = grpc.loadPackageDefinition(userPackageDefinition) as any;
      this.userService = new userProto.user.UserService(
        address,
        grpc.credentials.createInsecure()
      );

      // Load Product service
      const productPackageDefinition = protoLoader.loadSync(
        path.join(protoPath, 'product.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      );
      const productProto = grpc.loadPackageDefinition(productPackageDefinition) as any;
      this.productService = new productProto.product.ProductService(
        address,
        grpc.credentials.createInsecure()
      );

      // Load Order service
      const orderPackageDefinition = protoLoader.loadSync(
        path.join(protoPath, 'order.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      );
      const orderProto = grpc.loadPackageDefinition(orderPackageDefinition) as any;
      this.orderService = new orderProto.order.OrderService(
        address,
        grpc.credentials.createInsecure()
      );

      console.log(`gRPC services initialized at ${address}`);
    } catch (error) {
      console.error('Failed to initialize gRPC services:', error);
      throw error;
    }
  }

  /**
   * Get User service
   */
  public getUserService(): any {
    if (!this.userService) {
      throw new Error('User service not initialized');
    }
    return this.userService;
  }

  /**
   * Get Product service
   */
  public getProductService(): any {
    if (!this.productService) {
      throw new Error('Product service not initialized');
    }
    return this.productService;
  }

  /**
   * Get Order service
   */
  public getOrderService(): any {
    if (!this.orderService) {
      throw new Error('Order service not initialized');
    }
    return this.orderService;
  }

  /**
   * Execute gRPC call with timeout and error handling
   */
  public async executeCall<T>(
    service: any,
    method: string,
    request: any,
    timeout: number = 30000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const deadline = new Date();
      deadline.setMilliseconds(deadline.getMilliseconds() + timeout);

      const metadata = new grpc.Metadata();
      metadata.add('timeout', timeout.toString());

      service[method](
        request,
        metadata,
        { deadline },
        (error: any, response: T) => {
          if (error) {
            console.error(`gRPC call failed for ${method}:`, error);
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  /**
   * Test gRPC connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Try to call a simple method to test connection
      const userService = this.getUserService();
      const request = { page: 1, limit: 1 };
      
      await this.executeCall(userService, 'GetAllUsers', request, 5000);
      console.log('gRPC connection test successful');
      return true;
    } catch (error) {
      console.error('gRPC connection test failed:', error);
      return false;
    }
  }

  /**
   * Close gRPC connections
   */
  public close(): void {
    if (this.userService) {
      this.userService.close();
    }
    if (this.productService) {
      this.productService.close();
    }
    if (this.orderService) {
      this.orderService.close();
    }
    console.log('gRPC connections closed');
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    userService: boolean;
    productService: boolean;
    orderService: boolean;
  } {
    return {
      userService: !!this.userService,
      productService: !!this.productService,
      orderService: !!this.orderService
    };
  }
} 