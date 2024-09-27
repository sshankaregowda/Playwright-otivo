import { Page, expect } from '@playwright/test';
import * as testData from '../data/testData.json'
import { getPageTitle, waitForTimeout } from '../utils/commonFunctions';
import logger from '../logger/logger'

export let retirementAge: any;

export class SuperDetailsPage {
    private page: Page


    constructor(page: Page) {
        this.page = page;
    }

    // page title
    pageTitle: string = '//div/h5'

    // Your Super Details
    currentAgeTxtBox = () => this.page.locator('//input[@id="Retirement Calculator Age"]')
    currentSalaryTxtBox = () => this.page.locator('//div[@data-test="userIncome"]/div/input')
    currentSuperBalanceTxtBox = () => this.page.locator('//input[@id="Retirement Calculator Super Balance"]')
    targetAnnualRetirementIncomeTxtBox = () => this.page.locator('//input[@data-test="targetRetirementIncome"]')
    doYouOwnYourHomeDrpDown = () => this.page.locator('//div[@data-test="ownsHome"]')
    retirementAgeTxtBox = () => this.page.locator('//input[@id="Retirement Calculator Retirement Age"]')
    nextBtn = () => this.page.locator('//button[@id="update-graph-data-button"]')
    hov = () => this.page.locator('((//*[local-name()="svg"]//*[name()="g" and @class="highcharts-series-group"]//*[name()="g"])[3]//*[name()="rect" and @class="highcharts-point"])[32]')


    async navigateTo() {
        let title: any

        await this.page.goto(testData.URL, { waitUntil: 'load' });
        title = await getPageTitle(this.page, this.pageTitle)

        expect(title).toBe('Super details')
        logger.info('Home page is loaded')
    }


    async enterYourSuperDetails() {
        logger.info('Enter the super details')
        await this.currentAgeTxtBox().waitFor({ state: 'visible', timeout: 5000 })
        await this.currentAgeTxtBox().click()
        await this.currentAgeTxtBox().fill(testData.yourSuperDetails.currentAge)

        await this.currentSalaryTxtBox().waitFor()
        await this.currentSalaryTxtBox().click()
        await this.currentSalaryTxtBox().fill(testData.yourSuperDetails.currentSalary)

        await this.currentSuperBalanceTxtBox().waitFor()
        await this.currentSuperBalanceTxtBox().click()
        await this.currentSuperBalanceTxtBox().fill(testData.yourSuperDetails.currentSuperBalance)
        await this.currentSuperBalanceTxtBox().waitFor()

        await this.doYouOwnYourHomeDrpDown().click()
        await waitForTimeout(this.page, 3000)
        await this.page.locator('//div[contains(text(),"' + testData.yourSuperDetails.doYouOwnYourHome + '")]').click()

        await waitForTimeout(this.page, 3000)
        await this.targetAnnualRetirementIncomeTxtBox().waitFor()
        await this.targetAnnualRetirementIncomeTxtBox().fill(testData.yourSuperDetails.targetAnnualRetirementIncome)

        await waitForTimeout(this.page, 3000)
        retirementAge = await this.retirementAgeTxtBox().inputValue()

        await this.nextBtn().click()
        await waitForTimeout(this.page, 3000)
    }

}