# Automation Exercise E2E Test Framework

This project contains a comprehensive end-to-end test suite for [automationexercise.com](https://automationexercise.com) using Playwright with TypeScript, the Page Object Model (POM) design pattern, and advanced database and gRPC testing capabilities.

---

## 🏗️ Project Structure

```
playwright-assignment/
├── pages/                          # Page Object Model classes
│   ├── BasePage.ts                 # Base page with common functionality
│   ├── HomePage.ts                 # Home page specific methods
│   ├── ProductsPage.ts             # Products listing page
│   ├── ProductDetailPage.ts        # Product detail page
│   ├── CartPage.ts                 # Shopping cart page
│   ├── CheckoutPage.ts             # Checkout and payment page
├── utils/
│   ├── TestData.ts                 # Test data and utility functions
│   ├── DatabaseConnection.ts       # PostgreSQL connection management
│   ├── DatabaseService.ts          # CRUD and business logic
│   ├── DatabaseModels.ts           # TypeScript interfaces and schema
│   ├── DatabaseTestData.ts         # Test data generation for DB
│   ├── GrpcClient.ts               # gRPC client utilities
│   ├── GrpcService.ts              # gRPC service layer
├── proto/                          # Protocol Buffer definitions
│   ├── user.proto
│   ├── product.proto
│   └── order.proto
├── tests/
│   ├── automation-exercise-e2e.spec.ts  # Main E2E test suite
│   ├── quick-demo.spec.ts
│   ├── database/
│   │   ├── database-setup.spec.ts
│   │   ├── user-crud.spec.ts
│   │   ├── product-crud.spec.ts
│   │   └── order-crud.spec.ts
│   └── grpc/
│       ├── grpc-setup.spec.ts
│       ├── user-crud.spec.ts
│       ├── product-crud.spec.ts
│       └── order-crud.spec.ts
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Project dependencies
├── run-tests.js                    # Custom test runner
├── env.example                     # Environment variable template
└── README.md                       # This file (comprehensive documentation)
```

---

## 📚 Table of Contents

- [Test Coverage](#-test-coverage)
- [Getting Started](#-getting-started)
- [Database Testing](#-database-testing)
- [gRPC Testing](#-grpc-testing)
- [Page Object Model (POM)](#-page-object-model-pom)
- [Configuration](#-configuration)
- [Test Structure](#-test-structure)
- [Customization & Extensibility](#-customization--extensibility)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [CI/CD Integration](#-cicd-integration)
- [Security Considerations](#-security-considerations)
- [License](#-license)

---

## 🎯 Test Coverage

### 1. **Complete E2E Shopping Flow**
- Navigation to home page
- Product search, browsing, filtering, and detail viewing
- Cart management (add, update, remove)
- Checkout and payment simulation
- Order confirmation

### 2. **Home Page Features**
- Slider, featured items, categories, brands
- Newsletter subscription
- Scroll functionality

### 3. **Product Management**
- Search, filter, sort, review

### 4. **Cart Management**
- Add/remove items, update quantities, clear cart

### 5. **Database & gRPC Testing**
- Full CRUD for Users, Products, Orders (DB & gRPC)
- Data validation, business logic, performance
- Test data generation and cleanup

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (for DB tests)
- gRPC server (for gRPC tests)

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright-assignment
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

### Environment Configuration
- Copy `env.example` to `.env` and fill in DB/gRPC details:
  ```env
  # Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=mydatabase
  DB_USER=your_username
  DB_PASSWORD=your_password
  # gRPC
  GRPC_HOST=localhost
  GRPC_PORT=50051
  GRPC_PROTO_PATH=./proto
  GRPC_TIMEOUT=30000
  NODE_ENV=test
  ```

---

## 🧪 Running Tests

### UI/E2E Tests
```bash
npx playwright test
npx playwright test tests/automation-exercise-e2e.spec.ts
npx playwright test --ui
npx playwright test --headed
npx playwright test --project=chromium
npx playwright test --debug
```

### Database Tests
```bash
npm run test:db
npm run test:db:users
npm run test:db:products
npm run test:db:orders
npx playwright test tests/database/
```

### gRPC Tests
```bash
npm run test:grpc
npm run test:grpc:users
npm run test:grpc:products
npm run test:grpc:orders
npx playwright test tests/grpc/
```

### Reports
```bash
npx playwright show-report
```

---

## 🗄️ Database Testing

- **Connection Management**: Singleton pool, transaction support
- **CRUD Operations**: Users, Products, Orders, Order Items
- **Schema**: E-commerce tables with constraints, timestamps, relationships
- **Test Data**: Automatic generation, scenario-based, cleanup
- **Performance**: Bulk/concurrent ops, query monitoring
- **Test Suites**: Setup, CRUD, validation, business logic, performance
- **Extensibility**: Add new entities by updating models, service, test data, and tests

#### Example: Add Category Entity
```typescript
// 1. Add interface in DatabaseModels.ts
export interface Category { ... }
// 2. Add CRUD in DatabaseService.ts
async createCategory(category: Category): Promise<Category> { ... }
// 3. Add generator in DatabaseTestData.ts
static generateCategories(count: number = 5): Category[] { ... }
// 4. Write test suite in tests/database/
test.describe('Category CRUD Operations', () => { ... });
```

#### Best Practices
- Test isolation (beforeEach/afterAll cleanup)
- Realistic data, edge cases, error handling
- Use transactions for complex ops
- Monitor performance
- Secure credentials

---

## 🔌 gRPC Testing

- **Proto Definitions**: `proto/user.proto`, `proto/product.proto`, `proto/order.proto`
- **Client/Service**: Singleton client, service layer for CRUD
- **Test Suites**: Setup, CRUD, validation, business logic, performance
- **Test Data**: Auto-generation, cleanup
- **Performance**: Connection pooling, concurrent ops
- **Extensibility**: Add new proto/service, implement in client/service, add tests

#### Example: Add New Service
1. Create `.proto` file
2. Add to GrpcClient
3. Implement in GrpcService
4. Write test suite

#### Best Practices
- Always close connections after use
- Use beforeEach/afterAll for cleanup
- Handle errors and edge cases
- Monitor performance
- Secure connections (TLS/SSL in prod)

---

## 🧩 Page Object Model (POM)

- **Consistent patterns** for UI, DB, and gRPC
- **BasePage**: Navigation, common locators, assertions
- **Page-specific classes**: HomePage, ProductsPage, ProductDetailPage, CartPage, CheckoutPage
- **DatabasePage/GrpcPage**: CRUD, scenario creation, performance, health checks
- **Benefits**: Maintainability, reusability, readability, test isolation

#### Example Usage
```typescript
// Database POM
const user = await databasePage.createUser(userData);
// gRPC POM
const product = await grpcPage.createProduct(productData);
```

#### Arrange-Act-Assert Pattern
```typescript
test('should perform operation', async () => {
  // Arrange
  const testData = generateTestData();
  // Act
  const result = await pageObject.performOperation(testData);
  // Assert
  expect(result).toBeDefined();
});
```

---

## ⚙️ Configuration

- **Playwright**: `playwright.config.ts` (testDir, parallel, reporter, browsers, trace)
- **Test Data**: `utils/TestData.ts` (credentials, search terms, payment info, URLs)
- **Database**: `utils/DatabaseConnection.ts`, `.env`
- **gRPC**: `utils/GrpcClient.ts`, `.env`, `proto/`

---

## 📝 Test Structure

- **Main E2E Flow**: Home → Search → Products → Filter → Details → Cart → Checkout → Payment → Confirmation
- **Database**: Setup, CRUD, validation, performance, business logic
- **gRPC**: Setup, CRUD, validation, performance, business logic
- **Arrange-Act-Assert**: All tests follow this pattern

---

## 🛠️ Customization & Extensibility

- **Add New Tests**: Create in `tests/`, import page objects, use TestData
- **Modify Page Objects**: Update locators/methods, maintain BasePage inheritance
- **Update Test Data**: Edit `TestData.ts` or `DatabaseTestData.ts`
- **Add Entities/Services**: Update models, service, test data, and tests

---

## 📈 Best Practices

- Use POM for separation of concerns
- Centralize test data
- Use meaningful assertions
- Implement error handling
- Document code and tests
- Use descriptive names
- Ensure test isolation and cleanup
- Monitor performance
- Secure sensitive data

---

## 🐛 Troubleshooting

- **Element not found**: Check locators
- **Timeouts**: Increase in TestData or config
- **Browser issues**: Try different browser/headed mode
- **Network issues**: Check connection/website
- **DB/gRPC errors**: Check server/config, run setup tests
- **Debug**: `npx playwright test --debug`, `npx playwright show-trace`

---

**Note**: This test suite is designed for the automationexercise.com website. Make sure the website is accessible before running tests. For questions or contributions, please refer to this README or create an issue in the repository. 