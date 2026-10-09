import { expect, test, type Page } from '@playwright/test';
import { fillValid, withFreshIp, waitPastBotWindow } from './helpers';

test.use({ viewport: { width: 1440, height: 900 }, hasTouch: false });

const cta = (page: Page) => page.getByTestId('join-cta-desktop');
const dialog = (page: Page) => page.getByRole('dialog', { name: 'Join the waitlist' });

async function openModal(page: Page) {
  await cta(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect(page).toHaveURL(/\?join=1$/);
}

async function expectClosed(page: Page) {
  await expect(page.getByTestId('waitlist-modal')).toHaveCount(0, { timeout: 2000 });
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
}

test.beforeEach(async ({ page }) => {
  await withFreshIp(page);
  await page.goto('/');
});

test('floating CTA is visible and the mobile CTA is hidden', async ({ page }) => {
  await expect(cta(page)).toBeInViewport();
  await expect(page.getByTestId('join-cta')).toBeHidden();
});

test('modal opens from the CTA (FLIP), keeps the landing mounted, and locks scroll', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, 1200));
  await openModal(page);
  const vars = await dialog(page).evaluate((el) => ({
    sx: parseFloat(el.style.getPropertyValue('--sx')),
    anim: el.style.animation,
  }));
  expect(vars.sx).toBeLessThan(1); // starts at the button's scale
  expect(vars.anim).toContain('tdFlipIn');
  await expect(page.getByRole('heading', { name: 'Make proactive healthcare simple.' })).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  expect(await page.evaluate(() => scrollY)).toBe(1200);
  await expect(page.getByLabel('Name')).toBeFocused({ timeout: 2000 });
});

for (const how of ['close button', 'backdrop', 'Escape', 'browser back'] as const) {
  test(`closes via ${how} and returns focus to the CTA`, async ({ page }) => {
    await openModal(page);
    if (how === 'close button') await page.getByRole('button', { name: 'Close' }).click();
    if (how === 'backdrop') await page.getByTestId('modal-backdrop').click({ position: { x: 20, y: 20 } });
    if (how === 'Escape') await page.keyboard.press('Escape');
    if (how === 'browser back') await page.goBack();
    if (how !== 'Escape') expect(await dialog(page).evaluate((el) => el.style.animation)).toContain('tdFlipOut');
    await expectClosed(page);
    await expect(cta(page)).toBeFocused();
  });
}

test('focus is trapped inside the modal', async ({ page }) => {
  await openModal(page);
  await expect(page.getByLabel('Name')).toBeFocused({ timeout: 2000 });
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog(page).evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await dialog(page).evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
});

test('double-clicking the CTA opens one modal', async ({ page }) => {
  await cta(page).dblclick();
  await expect(page.getByTestId('waitlist-modal')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expectClosed(page);
});

test('success renders inside the modal; closing resets the form', async ({ page }) => {
  await openModal(page);
  await fillValid(page, { name: 'Omar Haddad', phone: '+971 52 111 2233' });
  await waitPastBotWindow(page);
  await page.getByTestId('submit').click();
  await expect(dialog(page).getByRole('heading', { name: "You're on the waitlist Omar" })).toBeVisible();
  await expect(dialog(page).getByText('+971 52 111 2233')).toBeVisible();
  await expect(page).toHaveURL(/\?join=success$/);

  await page.getByRole('button', { name: 'Close' }).click();
  await expectClosed(page);
  await openModal(page);
  await expect(page.getByLabel('Name')).toHaveValue('');
  await expect(page.getByLabel('Phone number')).toHaveValue('');
  await expect(page.getByRole('radio', { name: /^Individual/ })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByText('Please enter your name')).toHaveCount(0);
});

test('validation and server errors work inside the modal', async ({ page }) => {
  await page.route('**/api/waitlist', (r) => r.fulfill({ status: 500, json: { ok: false } }));
  await openModal(page);
  await page.getByTestId('submit').click();
  await expect(page.getByText('Please enter your name')).toBeVisible();
  await fillValid(page);
  await page.getByTestId('submit').click();
  await expect(dialog(page).getByText("We couldn't add you to the waitlist. Please try again.")).toBeVisible();
});

test('a deep link opens the modal with the fallback animation', async ({ page }) => {
  await page.goto('/?join=1');
  await expect(dialog(page)).toBeVisible();
  expect(await dialog(page).evaluate((el) => el.style.getPropertyValue('--ty'))).toBe('40px');
  await page.goBack();
  await expectClosed(page);
});

test('resizing while open keeps the modal centred', async ({ page }) => {
  await openModal(page);
  await page.waitForTimeout(700);
  await page.setViewportSize({ width: 1100, height: 800 });
  const box = await dialog(page).boundingBox();
  expect(Math.abs(box!.x + box!.width / 2 - 550)).toBeLessThan(2);
});

test('biomarkers: Heart open by default, single-open, sticky heading', async ({ page }) => {
  const list = page.getByTestId('biomarkers');
  const heart = list.getByRole('button', { name: /^Heart/ });
  const liver = list.getByRole('button', { name: /^Liver/ });
  await expect(heart).toHaveAttribute('aria-expanded', 'true');
  await liver.click();
  await expect(heart).toHaveAttribute('aria-expanded', 'false');
  await expect(list.locator('[aria-expanded="true"]')).toHaveCount(1);
  const pos = await page
    .getByRole('heading', { name: /We test 50\+ biomarkers/ })
    .evaluate((el) => getComputedStyle(el.parentElement!).position);
  expect(pos).toBe('sticky');
});

test('doctors scroller snaps and scrolls with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  const scroller = page.getByTestId('doctors-scroller');
  expect(await scroller.evaluate((el) => getComputedStyle(el).scrollSnapType)).toContain('mandatory');
  await scroller.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

for (const width of [768, 900, 1024, 1100, 1280, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('layout collapses: hero stacks ≤1000px, splits stack ≤1100px, conditions 2 columns <1000px', async ({ page }) => {
  const cols = (sel: string) =>
    page.locator(sel).first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  await page.setViewportSize({ width: 1000, height: 900 });
  expect(await cols('[data-testid="conditions-grid"]')).toBe(4);
  await page.setViewportSize({ width: 999, height: 900 });
  expect(await cols('[data-testid="conditions-grid"]')).toBe(2);
  await page.setViewportSize({ width: 1100, height: 900 });
  expect(await page.getByTestId('biomarkers').evaluate((el) => getComputedStyle(el.parentElement!).gridTemplateColumns.split(' ').length)).toBe(1);
  await page.setViewportSize({ width: 1101, height: 900 });
  expect(await page.getByTestId('biomarkers').evaluate((el) => getComputedStyle(el.parentElement!).gridTemplateColumns.split(' ').length)).toBe(2);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('modal opens and closes instantly, without FLIP', async ({ page }) => {
    await openModal(page);
    expect(await dialog(page).evaluate((el) => el.style.getPropertyValue('--sx'))).toBe('0.96'); // no button rect
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('waitlist-modal')).toHaveCount(0, { timeout: 200 });
  });
});
