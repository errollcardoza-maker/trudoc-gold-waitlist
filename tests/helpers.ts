import { expect, type Page } from '@playwright/test';

const octet = () => Math.floor(Math.random() * 254) + 1;

/** Each test gets its own client IP so the per-IP rate limit never couples tests together. */
export const randomIp = () => `10.${octet()}.${octet()}.${octet()}`;

/** A unique valid UAE mobile, e.g. `05X XXX XXXX`, so duplicate checks don't collide across tests. */
export const randomPhone = () => `05${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`;

export async function withFreshIp(page: Page) {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': randomIp() });
}

export async function openForm(page: Page) {
  await page.getByTestId('join-cta').click();
  await expect(page.getByRole('heading', { name: 'Join the waitlist' })).toBeVisible();
  await expect(page).toHaveURL(/\?join=1$/);
}

export async function fillValid(page: Page, { name = 'Jane Doe', phone = randomPhone(), plan = 'Individual' } = {}) {
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Phone number').fill(phone);
  await page.getByRole('radio', { name: new RegExp(`^${plan}`) }).click();
  return { name, phone };
}

/** The API ignores submissions made < 1.5s after the form opened (bot heuristic). */
export const waitPastBotWindow = (page: Page) => page.waitForTimeout(1600);
