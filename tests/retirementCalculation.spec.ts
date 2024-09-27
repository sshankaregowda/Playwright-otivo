import { test } from '@playwright/test'
import { SuperDetailsPage } from '../pages/superDetailsPage';
import { RetirementCalculatorPage } from '../pages/retirementCalculatorPage';

let page: any
let superDetailsPage: SuperDetailsPage;
let retirementCalculatorPage: RetirementCalculatorPage

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  superDetailsPage = new SuperDetailsPage(page);
  retirementCalculatorPage = new RetirementCalculatorPage(page)
});


test.afterAll(async () => {
  await page.close();
});


test('verify your retirement age in retirement milestones tab', async () => {

  await superDetailsPage.navigateTo()
  await superDetailsPage.enterYourSuperDetails()
  await retirementCalculatorPage.verifyYourRetirementAge()
  await retirementCalculatorPage.verifyYourSuperAmount()
});

test('verify your super amount and age in income graph', async () => {
  await retirementCalculatorPage.verifySuperAmountInGraph()
});


test('Add partner details, other income asset details and verify the combined annual retirement income amount in retirement milestones', async () => {
  await retirementCalculatorPage.addPartnerDetails()
  await retirementCalculatorPage.addOtherIncomeAndAssets()
  await retirementCalculatorPage.verifyCombinedAnnualRetirementAmount()
});

test('verify retirement results PDF statement is downloaded', async () => {
  await retirementCalculatorPage.retirementResultsPDFDownload()
  await retirementCalculatorPage.verifyRetirementResultsPDFDownlaoded()
});