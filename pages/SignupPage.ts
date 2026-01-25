import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { getTextContent } from '../utils/utils';

export class SignupPage extends BasePage {
    readonly signupForm: Locator;
    readonly titleMr: Locator;
    readonly titleMrs: Locator;
    readonly passwordInput: Locator;
    readonly dayDropdown: Locator;
    readonly monthDropdown: Locator;
    readonly yearDropdown: Locator;
    readonly newsletterCheckbox: Locator;
    readonly offersCheckbox: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly companyInput: Locator;
    readonly address1Input: Locator;
    readonly address2Input: Locator;
    readonly countryDropdown: Locator;
    readonly stateInput: Locator;
    readonly cityInput: Locator;
    readonly zipcodeInput: Locator;
    readonly mobileNumberInput: Locator;
    readonly createAccountButton: Locator;
    readonly accountCreatedMessage: Locator;
    readonly continueButton: Locator;
    readonly accountDeletedMessage: Locator;
    readonly signupNameInput: Locator;
    readonly signupEmailInput: Locator;
    readonly signupButton: Locator;
    readonly signupErrorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.signupForm = page.locator('.signup-form');
        this.titleMr = page.locator('#id_gender1');
        this.titleMrs = page.locator('#id_gender2');
        this.passwordInput = page.locator('#password');
        this.dayDropdown = page.locator('#days');
        this.monthDropdown = page.locator('#months');
        this.yearDropdown = page.locator('#years');
        this.newsletterCheckbox = page.locator('#newsletter');
        this.offersCheckbox = page.locator('#optin');
        this.firstNameInput = page.locator('#first_name');
        this.lastNameInput = page.locator('#last_name');
        this.companyInput = page.locator('#company');
        this.address1Input = page.locator('#address1');
        this.address2Input = page.locator('#address2');
        this.countryDropdown = page.locator('#country');
        this.stateInput = page.locator('#state');
        this.cityInput = page.locator('#city');
        this.zipcodeInput = page.locator('#zipcode');
        this.mobileNumberInput = page.locator('#mobile_number');
        this.createAccountButton = page.locator('button[data-qa="create-account"]');
        this.accountCreatedMessage = page.locator('h2:has-text("Account Created!")');
        this.continueButton = page.locator('a[data-qa="continue-button"]');
        this.accountDeletedMessage = page.locator('h2:has-text("Account Deleted!")');
        this.signupNameInput = page.locator('input[data-qa="signup-name"]');
        this.signupEmailInput = page.locator('input[data-qa="signup-email"]');
        this.signupButton = page.locator('button[data-qa="signup-button"]');
        this.signupErrorMessage = page.locator('.signup-form p');
    }
    
    async signup(name: string, email: string) {
        await this.signupNameInput.fill(name);
        await this.signupEmailInput.fill(email);
        await this.signupButton.click();
    }

    async fillAccountInformation(
        title: 'Mr' | 'Mrs',
        password: string,
        day: string,
        month: string,
        year: string,
        subscribeNewsletter: boolean = false,
        receiveOffers: boolean = false
    ) {
        // Select title
        if (title === 'Mr') {
            await this.titleMr.check();
        } else {
            await this.titleMrs.check();
        }

        // Fill password
        await this.passwordInput.fill(password);

        // Select date of birth
        await this.dayDropdown.selectOption(day);
        await this.monthDropdown.selectOption(month);
        await this.yearDropdown.selectOption(year);

        // Handle checkboxes
        if (subscribeNewsletter) {
            await this.newsletterCheckbox.check();
        }
        if (receiveOffers) {
            await this.offersCheckbox.check();
        }
    }

    async fillAddressInformation(
        firstName: string,
        lastName: string,
        company: string,
        address1: string,
        address2: string,
        country: string,
        state: string,
        city: string,
        zipcode: string,
        mobileNumber: string
    ) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.companyInput.fill(company);
        await this.address1Input.fill(address1);
        await this.address2Input.fill(address2);
        await this.countryDropdown.selectOption(country);
        await this.stateInput.fill(state);
        await this.cityInput.fill(city);
        await this.zipcodeInput.fill(zipcode);
        await this.mobileNumberInput.fill(mobileNumber);
    }

    async createAccount() {
        await this.createAccountButton.click();
    }

    async continueAfterAccountCreation() {
        await this.continueButton.click();
    }

    async isSignupFormVisible(): Promise<boolean> {
        return await this.signupForm.isVisible();
    }
    
    async getSignupErrorMessage(): Promise<string> {
        return await getTextContent(await this.signupErrorMessage);
    }

    async isAccountCreated(): Promise<boolean> {
        return await this.accountCreatedMessage.isVisible();
    }

    async isAccountDeleted(): Promise<boolean> {
        return await this.accountDeletedMessage.isVisible();
    }

    async getAccountCreatedMessage(): Promise<string> {
        return await getTextContent(await this.accountCreatedMessage);
    }

    async getAccountDeletedMessage(): Promise<string> {
        return await getTextContent(await this.accountDeletedMessage);
    }
} 