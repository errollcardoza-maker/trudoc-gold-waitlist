import { expect, test } from '@playwright/test';
import { fillValid, openForm, randomPhone, withFreshIp, waitPastBotWindow } from './helpers';

test.beforeEach(async ({ page }) => {
  await withFreshIp(page);
  await page.goto('/');
});

test('shows every validation message and focuses the first invalid field', async ({ page }) => {
  await openForm(page);
  const name = page.getByLabel('Name');
  const phone = page.getByLabel('Phone number');

  await page.getByTestId('submit').click();
  await expect(page.getByText('Please enter your name')).toBeVisible();
  await expect(page.getByText('Please enter your phone number')).toBeVisible();
  await expect(page.getByText('Please choose a plan')).toBeVisible();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');

  await name.fill('J');
  await expect(page.getByText('Please enter a valid name')).toBeVisible();
  await name.fill('J0hn');
  await expect(page.getByText('Please enter a valid name')).toBeVisible();
  await name.fill('Jöhn O\'Neil-Smith');
  await expect(page.getByText('Please enter a valid name')).toHaveCount(0);

  await phone.fill('0401234567');
  await expect(page.getByText('Please enter a valid UAE mobile number, e.g. 050 123 4567')).toBeVisible();
  await page.getByTestId('submit').click();
  await expect(phone).toBeFocused();

  await phone.fill('050 123 4567');
  await expect(page.getByText(/valid UAE mobile/)).toHaveCount(0);
  await page.getByRole('radio', { name: /^Family/ }).click();
  await expect(page.getByRole('radio', { name: /^Family/ })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('Please choose a plan')).toHaveCount(0);
});

test('errors appear only after a touched field is blurred', async ({ page }) => {
  await openForm(page);
  const name = page.getByLabel('Name');
  await name.fill('x');
  await expect(page.getByText('Please enter a valid name')).toHaveCount(0); // still focused
  await page.getByLabel('Phone number').focus();
  await expect(page.getByText('Please enter a valid name')).toBeVisible();
});

test('phone input strips everything except digits, spaces and +', async ({ page }) => {
  await openForm(page);
  const phone = page.getByLabel('Phone number');
  await phone.pressSequentially('50-12a3 4567');
  await expect(phone).toHaveValue('50123 4567');
});

for (const [value, valid] of [
  ['0501234567', true],
  ['+971 50 123 4567', true],
  ['971501234567', true],
  ['501234567', true],
  ['0401234567', false],
  ['5012345', false],
] as const) {
  test(`phone "${value}" is ${valid ? 'valid' : 'invalid'} in the form`, async ({ page }) => {
    await openForm(page);
    await page.getByLabel('Phone number').fill(value);
    await page.getByLabel('Name').focus();
    await expect(page.getByText(/valid UAE mobile/)).toHaveCount(valid ? 0 : 1);
  });
}

test('submits, shows the success screen, and clears saved progress', async ({ page }) => {
  await openForm(page);
  await fillValid(page, { name: 'Jane  Doe', phone: '+971 55 987 6543' });
  await waitPastBotWindow(page);
  const res = page.waitForResponse('**/api/waitlist');
  await page.getByLabel('Phone number').press('Enter'); // Enter submits
  expect((await res).status()).toBe(200);

  await expect(page.getByRole('heading', { name: "You're on the waitlist Jane" })).toBeVisible();
  await expect(page.getByText("We'll contact you on +971 55 987 6543 as soon as TruDoc Gold launches")).toBeVisible();
  await expect(page).toHaveURL(/\?join=success$/);
  expect(await page.evaluate(() => localStorage.getItem('tdg-waitlist'))).toBeNull();
});

test('a duplicate phone still shows the normal success screen', async ({ page, browser }) => {
  const phone = randomPhone();
  for (let i = 0; i < 2; i++) {
    const p = i === 0 ? page : await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
    await withFreshIp(p);
    if (i) await p.goto('/');
    await openForm(p);
    await fillValid(p, { phone });
    await waitPastBotWindow(p);
    const res = p.waitForResponse('**/api/waitlist');
    await p.getByTestId('submit').click();
    const body = await (await res).json();
    expect(body).toEqual(i === 0 ? { ok: true } : { ok: true, duplicate: true });
    await expect(p.getByRole('heading', { name: "You're on the waitlist Jane" })).toBeVisible();
  }
});

test('server error shows the inline error, keeps values, and can retry', async ({ page }) => {
  await page.route('**/api/waitlist', (r) => r.fulfill({ status: 500, json: { ok: false, error: 'server_error' } }));
  await openForm(page);
  const { phone } = await fillValid(page);
  await page.getByTestId('submit').click();

  await expect(page.getByRole('alert').filter({ hasText: "We couldn't add you to the waitlist. Please try again." })).toBeVisible();
  await expect(page.getByTestId('submit')).toHaveText('Try again');
  await expect(page.getByLabel('Name')).toHaveValue('Jane Doe');
  await expect(page.getByLabel('Phone number')).toHaveValue(phone);

  await page.unroute('**/api/waitlist');
  await waitPastBotWindow(page);
  await page.getByTestId('submit').click();
  await expect(page.getByRole('heading', { name: /You're on the waitlist/ })).toBeVisible();
});

test('shows a loading state and blocks double submits', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/waitlist', async (r) => {
    calls++;
    await new Promise((f) => setTimeout(f, 800));
    await r.fulfill({ json: { ok: true } });
  });
  await openForm(page);
  await fillValid(page);
  await page.getByTestId('submit').click();
  await expect(page.getByTestId('submit')).toHaveText('Joining…');
  await expect(page.getByLabel('Name')).toBeDisabled();
  await page.getByTestId('submit').click({ force: true });
  await expect(page.getByRole('heading', { name: /You're on the waitlist/ })).toBeVisible();
  expect(calls).toBe(1);
});

test('a refresh restores form progress', async ({ page }) => {
  await openForm(page);
  await page.getByLabel('Name').fill('Sara');
  await page.getByRole('radio', { name: /^Family/ }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Join the waitlist' })).toBeVisible();
  await expect(page.getByLabel('Name')).toHaveValue('Sara');
  await expect(page.getByRole('radio', { name: /^Family/ })).toHaveAttribute('aria-checked', 'true');
});

test('landing on ?join=success without a submission redirects to the landing', async ({ page }) => {
  await page.goto('/?join=success');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('join-cta')).toBeVisible();
});

test('no horizontal overflow on the form or success screen at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.route('**/api/waitlist', (r) => r.fulfill({ json: { ok: true } }));
  await openForm(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await fillValid(page, { name: 'Maximiliana-Alexandrina-Konstantinopoulou' });
  await page.getByTestId('submit').click();
  await expect(page.getByRole('heading', { name: /You're on the waitlist/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
