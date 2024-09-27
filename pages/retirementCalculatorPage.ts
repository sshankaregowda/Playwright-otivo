import { Page, expect } from '@playwright/test';
import * as testData from '../data/testData.json'
import { getPageTitle, waitForTimeout, scroll } from '../utils/commonFunctions';
import { retirementAge as retAge } from './superDetailsPage';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../logger/logger'



export let combinedAnnualRetirementIncome: any


export class RetirementCalculatorPage {
    private page: Page
    downloadDir: string = './downloads/'

    constructor(page: Page) {
        this.page = page;
    }

    //page title
    pageTitle = '//div/h5'

    //Retirement Milestones
    retirementMilestonesTab = () => this.page.locator('//div[contains(text(),"RETIREMENT MILESTONES")]')
    retirementAge = () => this.page.locator('//div[contains(text(),"You will retire")]/parent::div/div[2]')
    annualRetirementIncome = () => this.page.locator('//div[contains(text(),"92")]/following-sibling::div')

    //Super Details
    superDetailsTab = () => this.page.locator('//div[contains(text(),"SUPER DETAILS")]')
    partnerCheckbox = () => this.page.locator('//label[@for="enable partner check checkbox"]')
    partnerAgeTxtBox = () => this.page.locator('//input[@id="Retirement Calculator Partner Age"]')
    partnerCurrentSalary = () => this.page.locator('//input[@data-test="partnerIncome"]')
    partnerSuperBalance = () => this.page.locator('//input[@id="Retirement Calculator Partner Super Balance"]')
    targetAnnualRetirementIncomeTxtBox = () => this.page.locator('//input[@data-test="targetRetirementIncome"]')
    updateBtn = () => this.page.locator('//button[@id="update-graph-data-button"]')
    downloadBtn = () => this.page.locator('//button[@id="download-pdf-button"]')

    //OtherIncomeAssets
    otherIncomeAssetsTab = () => this.page.locator('//div[contains(text(),"OTHER INCOME + ASSETS")]')
    assetTypeDrpDwn = () => this.page.locator('//label[contains(text(),"Asset type")]/parent::div/following-sibling::div')
    currentValue = () => this.page.locator('//input[@id="Asset Value 0"]')
    otherIncomeUpdateBtn = () => this.page.locator('//button[normalize-space()="Update"]')

    //Income Graph
    ageGraph = () => this.page.locator('((//*[local-name()="svg"]//*[name()="g" and @class="highcharts-series-group"]//*[name()="g"])[3]//*[name()="rect" and @class="highcharts-point"])[32]')
    tooltip = () => this.page.locator('div#html-tooltip-info table tr')


    async verifyYourRetirementAge() {
        let title: any

        await this.retirementMilestonesTab().waitFor({ state: 'visible', timeout: 5000 })
        await this.retirementMilestonesTab().click()

        title = await getPageTitle(this.page, this.pageTitle)
        expect(title).toBe('Retirement Milestones')

        await scroll(this.page, 500)

        expect(retAge).toBe(await this.retirementAge().textContent())
        logger.info('Retirement age entered is reflected in retirement milestones tab')
    }

    async verifyYourSuperAmount() {
        let annualRetIncome = await this.annualRetirementIncome().textContent()
        expect(annualRetIncome).toContain(testData.yourSuperDetails.targetAnnualRetirementIncome)
        await waitForTimeout(this.page, 3000)
        logger.info('Super amount entered is reflected in retirement mile stones tab')
    }

    async addPartnerDetails() {
        logger.info('Add the partner super details')
        await this.superDetailsTab().click()
        await this.partnerCheckbox().waitFor({ state: 'visible' })
        await this.partnerCheckbox().click()

        await waitForTimeout(this.page, 2000);
        await this.partnerAgeTxtBox().click()
        await this.partnerAgeTxtBox().fill(testData.partnerDetails.currentAge)

        await this.partnerCurrentSalary().click()
        await this.partnerCurrentSalary().fill(testData.partnerDetails.currentSalary)

        await this.partnerSuperBalance().click()
        await this.partnerSuperBalance().fill(testData.partnerDetails.currentSuperBalance)
        await waitForTimeout(this.page, 3000);

        combinedAnnualRetirementIncome = await this.targetAnnualRetirementIncomeTxtBox().inputValue();
        await this.updateBtn().click()
        await waitForTimeout(this.page, 5000)
    }

    async verifyCombinedAnnualRetirementAmount() {
        await this.retirementMilestonesTab().waitFor({ state: 'visible', timeout: 5000 })
        await this.retirementMilestonesTab().click()

        await scroll(this.page, 500)

        let annualRetIncome = await this.annualRetirementIncome().textContent()
        expect(annualRetIncome).toContain(combinedAnnualRetirementIncome)
        await waitForTimeout(this.page, 3000)
        logger.info('CombinedAnnualRetirementAmount is reflected in retirement milestones tab')

    }

    async retirementResultsPDFDownload() {
        const downloadPromise = this.page.waitForEvent('download');
        await this.downloadBtn().click()
        const download = await downloadPromise;

        if (fs.existsSync(this.downloadDir)) {
            const files = fs.readdirSync(this.downloadDir);
            for (const file of files) {
                const filePath = path.join(this.downloadDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    logger.info(`Deleted file: ${filePath}`);
                }
            }
        } else {
            logger.info(`Directory does not exist: ${this.downloadDir}`);
        }
        await download.saveAs(this.downloadDir + download.suggestedFilename())
    }

    async verifyRetirementResultsPDFDownlaoded() {
        let f_exportedPDFFileName = "retirement_calc.pdf"
        let f_actualfilename = fs.readdirSync(this.downloadDir);
        for (let i = 0; i < f_actualfilename.length; i++) {
            if (f_exportedPDFFileName == f_actualfilename[i]) {
                expect(f_actualfilename[i]).toBe(f_exportedPDFFileName)
                logger.info("PDF File exported successfully")
            }
        }
    }

    async verifySuperAmountInGraph() {
        let count: number;
        let retirementData: string[] = [];

        await scroll(this.page, -500)

        await this.ageGraph().hover({ position: { x: 0, y: 100 } })
        await waitForTimeout(this.page, 5000)
        count = await this.tooltip().count()
        for (let i = 0; i < count; i++) {
            const retirementTxt = await this.tooltip().nth(i).innerText();
            retirementData.push(retirementTxt)
        }
        const superResults = retirementData.map(item => item.replace(/([a-zA-Z])\s+/g, '$1'));
        expect(superResults).toContain('Super$' + testData.yourSuperDetails.targetAnnualRetirementIncome)
        expect(superResults).toContain('Age' + retAge)
        logger.info("Retirement Age and super is validated in the income graph")

    }

    async addOtherIncomeAndAssets() {
        logger.info('Add other income + assets')
        await this.otherIncomeAssetsTab().click()
        await this.assetTypeDrpDwn().waitFor()
        await this.assetTypeDrpDwn().click()
        await this.page.locator('//div[contains(text(),"' + testData.otherIncomeAssetsDetails.assetType + '")]').click()
        await waitForTimeout(this.page, 3000)
        await this.currentValue().click()
        await this.currentValue().fill(testData.otherIncomeAssetsDetails.currentValue)
        await this.otherIncomeUpdateBtn().waitFor()
        await this.otherIncomeUpdateBtn().click()
        await waitForTimeout(this.page, 5000);

    }

}