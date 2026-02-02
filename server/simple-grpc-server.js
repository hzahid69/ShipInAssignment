const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const loadProto = (file) =>
  grpc.loadPackageDefinition(
    protoLoader.loadSync(path.join(__dirname, '..', 'proto', file), protoOptions)
  );

const userProto = loadProto('user.proto').user;
const productProto = loadProto('product.proto').product;
const orderProto = loadProto('order.proto').order;

// Minimal implementations that return safe default responses
const userImpl = {
  GetAllUsers: (call, cb) =>
    cb(null, { users: [], total: 0, page: call.request.page || 1, limit: call.request.limit || 100, message: 'OK', success: true }),
  CreateUser: (call, cb) => cb(null, { user: { id: 1, ...call.request }, message: 'created', success: true }),
  GetUserById: (call, cb) => cb(null, { user: { id: call.request.id || 1 }, message: 'OK', success: true }),
  GetUserByEmail: (call, cb) => cb(null, { user: { email: call.request.email || '' }, message: 'OK', success: true }),
  UpdateUser: (call, cb) => cb(null, { user: { id: call.request.id || 1, ...call.request }, message: 'updated', success: true }),
  DeleteUser: (call, cb) => cb(null, { success: true, message: 'deleted' }),
};

const productImpl = {
  GetAllProducts: (call, cb) => cb(null, { products: [], total: 0, page: call.request.page || 1, limit: call.request.limit || 100, message: 'OK', success: true }),
  CreateProduct: (call, cb) => cb(null, { product: { id: 1, ...call.request }, message: 'created', success: true }),
  GetProductById: (call, cb) => cb(null, { product: { id: call.request.id || 1 }, message: 'OK', success: true }),
  GetProductBySku: (call, cb) => cb(null, { product: { sku: call.request.sku || '' }, message: 'OK', success: true }),
  UpdateProduct: (call, cb) => cb(null, { product: { id: call.request.id || 1, ...call.request }, message: 'updated', success: true }),
  DeleteProduct: (call, cb) => cb(null, { success: true, message: 'deleted' }),
};

const orderImpl = {
  GetAllOrders: (call, cb) => cb(null, { orders: [], total: 0, page: call.request.page || 1, limit: call.request.limit || 100, message: 'OK', success: true }),
  CreateOrder: (call, cb) => cb(null, { order: { id: 1, ...call.request }, message: 'created', success: true }),
  GetOrderById: (call, cb) => cb(null, { order: { id: call.request.id || 1 }, message: 'OK', success: true }),
  GetOrderByNumber: (call, cb) => cb(null, { order: { order_number: call.request.order_number || '' }, message: 'OK', success: true }),
  UpdateOrderStatus: (call, cb) => cb(null, { order: { id: call.request.id || 1, status: call.request.status }, message: 'updated', success: true }),
  DeleteOrder: (call, cb) => cb(null, { success: true, message: 'deleted' }),
  AddOrderItem: (call, cb) => cb(null, { order_item: { id: 1, ...call.request }, message: 'added', success: true }),
  GetOrderItems: (call, cb) => cb(null, { order_items: [], message: 'OK', success: true }),
  RemoveOrderItem: (call, cb) => cb(null, { success: true, message: 'removed' }),
};

function start() {
  const server = new grpc.Server();

  server.addService(userProto.UserService.service, userImpl);
  server.addService(productProto.ProductService.service, productImpl);
  server.addService(orderProto.OrderService.service, orderImpl);

  const host = process.env.GRPC_HOST || 'localhost';
  const port = process.env.GRPC_PORT || '50051';
  const address = `${host}:${port}`;

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, portBound) => {
    if (err) return console.error('Server bind failed:', err);
    // bindAsync already starts the server; explicit start() is deprecated
    console.log(`gRPC mock server started at ${address}`);
  });
}

start();
