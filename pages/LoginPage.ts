import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { getTextContent } from '../utils/utils';

export class LoginPage extends BasePage {
    readonly loginForm: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly loginFormButton: Locator;
    readonly loginErrorMessage: Locator;
    readonly logoutButton: Locator;
    readonly accountCreatedMessage: Locator;
    readonly accountDeletedMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.loginForm = page.locator('.login-form');
        this.emailInput = page.locator('input[data-qa="login-email"]');
        this.passwordInput = page.locator('input[data-qa="login-password"]');
        this.loginButton = page.locator('a[href="/login"]');
        this.loginFormButton = page.locator('button[data-qa="login-button"]');
        this.loginErrorMessage = page.locator('.login-form p');
        this.logoutButton = page.locator('a[href="/logout"]');
        this.accountCreatedMessage = page.locator('h2:has-text("Account Created!")');
        this.accountDeletedMessage = page.locator('h2:has-text("Account Deleted!")');
    }

    async navigateToLogin() {
        await this.goto('/login');
        await this.waitForPageLoad();
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginFormButton.click();
        await this.waitForPageLoad();
    }

    async logout() {
        await this.logoutButton.click();
        await this.waitForPageLoad();
    }

    async isLoginFormVisible(): Promise<boolean> {
        return await this.loginForm.isVisible();
    }

    async isLoggedIn(): Promise<boolean> {
        return await this.logoutButton.isVisible();
    }

    async isLoggedOut(): Promise<boolean> {
        return await this.loginForm.isVisible();
    }

    async getLoginErrorMessage(): Promise<string> {
        return await getTextContent(await this.loginErrorMessage);
    }

    async isAccountCreated(): Promise<boolean> {
        return await this.accountCreatedMessage.isVisible();
    }

    async isAccountDeleted(): Promise<boolean> {
        return await this.accountDeletedMessage.isVisible();
    }
} 