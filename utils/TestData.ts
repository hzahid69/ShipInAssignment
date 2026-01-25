export class TestData {
    // User credentials
    static readonly VALID_EMAIL = 'test@example.com';
    static readonly VALID_PASSWORD = 'password123';
    static readonly INVALID_EMAIL = 'invalid@example.com';
    static readonly INVALID_PASSWORD = 'wrongpassword';

    // User information
    static readonly USER_NAME = 'John Doe';
    static readonly USER_EMAIL = 'john.doe@example.com';
    static readonly USER_PASSWORD = 'password123';
    static readonly USER_FIRST_NAME = 'John';
    static readonly USER_LAST_NAME = 'Doe';
    static readonly USER_ADDRESS = '123 Main Street';
    static readonly USER_CITY = 'New York';
    static readonly USER_STATE = 'NY';
    static readonly USER_ZIPCODE = '10001';
    static readonly USER_PHONE = '+1234567890';

    // Additional user information for registration
    static readonly USER_TITLE = 'Mr';
    static readonly USER_BIRTH_DAY = '15';
    static readonly USER_BIRTH_MONTH = 'March';
    static readonly USER_BIRTH_YEAR = '1990';
    static readonly USER_COMPANY = 'Test Company';
    static readonly USER_ADDRESS2 = 'Apt 4B';
    static readonly USER_COUNTRY = 'United States';
    static readonly USER_SUBSCRIBE_NEWSLETTER = true;
    static readonly USER_RECEIVE_OFFERS = false;

    // Alternative user data for testing
    static readonly ALT_USER_NAME = 'Jane Smith';
    static readonly ALT_USER_EMAIL = 'jane.smith@example.com';
    static readonly ALT_USER_FIRST_NAME = 'Jane';
    static readonly ALT_USER_LAST_NAME = 'Smith';
    static readonly ALT_USER_TITLE = 'Mrs';
    static readonly ALT_USER_BIRTH_DAY = '20';
    static readonly ALT_USER_BIRTH_MONTH = 'June';
    static readonly ALT_USER_BIRTH_YEAR = '1985';
    static readonly ALT_USER_COMPANY = 'Tech Solutions Inc';
    static readonly ALT_USER_ADDRESS = '456 Oak Avenue';
    static readonly ALT_USER_ADDRESS2 = 'Suite 100';
    static readonly ALT_USER_COUNTRY = 'Canada';
    static readonly ALT_USER_STATE = 'Ontario';
    static readonly ALT_USER_CITY = 'Toronto';
    static readonly ALT_USER_ZIPCODE = 'M5V 3A8';
    static readonly ALT_USER_PHONE = '+14165551234';

    // Product data
    static readonly SEARCH_PRODUCT = 'dress';
    static readonly PRODUCT_CATEGORY = 'Women';
    static readonly PRODUCT_BRAND = 'Polo';

    // Payment data
    static readonly CARD_NAME = 'John Doe';
    static readonly CARD_NUMBER = '4111111111111111';
    static readonly CVC = '123';
    static readonly EXPIRY_MONTH = '12';
    static readonly EXPIRY_YEAR = '2025';

    // Test comments
    static readonly ORDER_COMMENT = 'Please deliver during business hours';
    static readonly REVIEW_COMMENT = 'Great product, highly recommended!';

    // Newsletter subscription
    static readonly NEWSLETTER_EMAIL = 'newsletter@example.com';

    // Contact form data
    static readonly CONTACT_NAME = 'Jane Smith';
    static readonly CONTACT_EMAIL = 'jane.smith@example.com';
    static readonly CONTACT_SUBJECT = 'General Inquiry';
    static readonly CONTACT_MESSAGE = 'I have a question about your products.';

    // Expected text content
    static readonly EXPECTED_HOME_TITLE = 'Automation Exercise';
    static readonly EXPECTED_PRODUCTS_TITLE = 'ALL PRODUCTS';
    static readonly EXPECTED_CART_TITLE = 'Shopping Cart';
    static readonly EXPECTED_CHECKOUT_TITLE = 'Checkout';
    static readonly EXPECTED_ORDER_SUCCESS_MESSAGE = 'Order Placed!';

    // Timeouts
    static readonly DEFAULT_TIMEOUT = 30000;
    static readonly SHORT_TIMEOUT = 5000;
    static readonly LONG_TIMEOUT = 60000;

    // URLs
    static readonly BASE_URL = 'https://automationexercise.com';
    static readonly HOME_URL = `${TestData.BASE_URL}/`;
    static readonly PRODUCTS_URL = `${TestData.BASE_URL}/products`;
    static readonly CART_URL = `${TestData.BASE_URL}/view_cart`;
    static readonly CHECKOUT_URL = `${TestData.BASE_URL}/checkout`;

    // Generate random email
    static generateRandomEmail(): string {
        const timestamp = Date.now();
        return `test${timestamp}@example.com`;
    }

    // Generate random name
    static generateRandomName(): string {
        const timestamp = Date.now();
        return `Test User ${timestamp}`;
    }

    // Generate random phone number
    static generateRandomPhone(): string {
        const timestamp = Date.now();
        return `+1${timestamp.toString().slice(-10)}`;
    }

    // Generate random address
    static generateRandomAddress(): string {
        const timestamp = Date.now();
        return `${timestamp} Test Street`;
    }

    // Generate random card number (for testing purposes)
    static generateRandomCardNumber(): string {
        return '4111111111111111'; // Test card number
    }

    // Generate random CVC
    static generateRandomCVC(): string {
        return Math.floor(Math.random() * 900 + 100).toString();
    }

    // Generate random expiry month
    static generateRandomExpiryMonth(): string {
        return Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
    }

    // Generate random expiry year
    static generateRandomExpiryYear(): string {
        const currentYear = new Date().getFullYear();
        return (currentYear + Math.floor(Math.random() * 5 + 1)).toString();
    }

    // Get current timestamp
    static getCurrentTimestamp(): number {
        return Date.now();
    }

    // Format price (remove currency symbols and convert to number)
    static formatPrice(priceText: string): number {
        return parseFloat(priceText.replace(/[^\d.]/g, ''));
    }

    // Validate email format
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number format
    static isValidPhone(phone: string): boolean {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone);
    }

    // Validate card number format
    static isValidCardNumber(cardNumber: string): boolean {
        const cardRegex = /^\d{13,19}$/;
        return cardRegex.test(cardNumber.replace(/\s/g, ''));
    }

    // Validate CVC format
    static isValidCVC(cvc: string): boolean {
        const cvcRegex = /^\d{3,4}$/;
        return cvcRegex.test(cvc);
    }

    // Validate expiry date format
    static isValidExpiryDate(month: string, year: string): boolean {
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        return monthNum >= 1 && monthNum <= 12 && 
               yearNum >= currentYear && 
               (yearNum > currentYear || monthNum >= currentMonth);
    }
} 