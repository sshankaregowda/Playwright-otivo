import { Page } from '@playwright/test';


export const getPageTitle = async (page: Page, selector: string) => {
  return await page.locator(selector).textContent()
};

export const waitForTimeout = async (page: Page, time: number) => {
  await page.waitForTimeout(time)
}

export const scroll = async (page: Page, yaxis: number) => {
  await page.evaluate((y) => {
    window.scrollBy(0, y);
  }, yaxis);
}

