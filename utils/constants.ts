export const USERNAME = "testuser";
export const EMAIL = "test@example.com";
export const PASSWORD = "password123";
export const FIRST_NAME = "Test";
export const LAST_NAME = "User";

export const LARGE_USER_DATA = {
  username: USERNAME,
  email: EMAIL,
  password: PASSWORD,
  first_name: FIRST_NAME,
  last_name: LAST_NAME,
  phone: "1234567890",
  address: "A".repeat(1000), // Large address
  city: "Test City",
  state: "TS",
  zip_code: "12345",
  country: "Test Country",
};

export const VALID_USER_DATA = {
  username: USERNAME,
  email: EMAIL,
  password: PASSWORD,
  first_name: FIRST_NAME,
  last_name: LAST_NAME,
};

export const INVALID_USER_DATA = {
  username: USERNAME,
  email: "invalidemail",
  password: PASSWORD,
  first_name: FIRST_NAME,
  last_name: LAST_NAME,
};

export const WEAK_PASSWORD_USER = {
  username: USERNAME,
  email: EMAIL,
  password: "123", // Weak password
  first_name: FIRST_NAME,
  last_name: LAST_NAME,
};

export const ADDRESS = "123 Test St, Test City, TS 12345";
export const PAYMENT_METHOD = "Credit Card";
export const STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};
