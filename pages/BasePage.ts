import { Page, Locator, expect } from '@playwright/test';
import { configDotenv } from 'dotenv';

configDotenv();

export class BasePage {
    readonly page: Page;
    readonly header: Locator;
    readonly footer: Locator;
    readonly cartButton: Locator;
    readonly loginButton: Locator;
    readonly signupButton: Locator;
    readonly logoutButton: Locator;
    readonly deleteAccountButton: Locator;
    readonly contactUsButton: Locator;
    readonly testCasesButton: Locator;
    readonly productsButton: Locator;
    readonly subscriptionEmail: Locator;
    readonly subscriptionButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('header');
        this.footer = page.locator('footer');
        this.cartButton = page.locator('header a[href="/view_cart"]');
        this.loginButton = page.locator('a[href="/login"]');
        this.signupButton = page.locator('a[href="/signup"]');
        this.logoutButton = page.locator('a[href="/logout"]');
        this.deleteAccountButton = page.locator('a[href="/delete_account"]');
        this.contactUsButton = page.locator('a[href="/contact_us"]');
        this.testCasesButton = page.locator('a[href="/test_cases"]');
        this.productsButton = page.locator('a[href="/products"]');
        this.subscriptionEmail = page.locator('#susbscribe_email');
        this.subscriptionButton = page.locator('#subscribe');
    }

    async goto(path: string = '') {
        await this.page.goto(`${process.env.BASE_URL}${path}`);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    async clickCart() {
        await this.cartButton.click();
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async clickSignup() {
        await this.signupButton.click();
    }

    async clickLogout() {
        await this.logoutButton.click();
    }

    async clickProducts() {
        await this.productsButton.click();
    }

    async clickContactUs() {
        await this.contactUsButton.click();
    }

    async clickTestCases() {
        await this.testCasesButton.click();
    }

    async subscribeToNewsletter(email: string) {
        await this.subscriptionEmail.fill(email);
        await this.subscriptionButton.click();
    }

    async expectToBeVisible(locator: Locator) {
        await expect(locator).toBeVisible();
    }

    async expectToHaveText(locator: Locator, text: string) {
        await expect(locator).toHaveText(text);
    }

    async expectToContainText(locator: Locator, text: string) {
        await expect(locator).toContainText(text);
    }

    /**
     * Clicks on a locator that contains the specified text
     * @param locator - The locator to search within
     * @param text - The text to match
     * @param options - Optional parameters for text matching
     */
    async clickLocatorWithText(
        locator: Locator, 
        text: string, 
        options: { 
            exact?: boolean; 
            timeout?: number;
            index?: number;
        } = {}
    ) {
        const { exact = false, timeout = 5000, index = 0 } = options;
        
        // Wait for the locator to be visible
        await expect(locator.first()).toBeVisible({ timeout });
        
        // Get all matching elements
        const elements = exact 
            ? locator.filter({ hasText: new RegExp(`^${text}$`, 'i') })
            : locator.filter({ hasText: text });
        
        // Get count of matching elements
        const count = await elements.count();
        
        if (count === 0) {
            throw new Error(`No elements found with text "${text}"`);
        }
        
        if (index >= count) {
            throw new Error(`Index ${index} is out of range. Found ${count} elements with text "${text}"`);
        }
        
        // Click on the element at the specified index
        await elements.nth(index).click();
    }

    /**
     * Clicks on the first locator that contains the specified text
     * @param locator - The locator to search within
     * @param text - The text to match
     * @param exact - Whether to match exact text (case-insensitive)
     */
    async clickFirstLocatorWithText(locator: Locator, text: string, exact: boolean = false) {
        await this.clickLocatorWithText(locator, text, { exact, index: 0 });
    }

    /**
     * Clicks on a locator that has exact text match
     * @param locator - The locator to search within
     * @param text - The exact text to match
     * @param index - Index of the element to click (default: 0)
     */
    async clickLocatorWithExactText(locator: Locator, text: string, index: number = 0) {
        await this.clickLocatorWithText(locator, text, { exact: true, index });
    }
} 