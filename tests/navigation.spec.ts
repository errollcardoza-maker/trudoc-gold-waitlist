import { expect, test, type Page } from '@playwright/test';
import { openForm, withFreshIp } from './helpers';

const form = (page: Page) => page.locator('form[data-screen-label="02 Join the waitlist"]');

test.beforeEach(async ({ page }) => {
  await withFreshIp(page);
  await page.goto('/');
});

test('form expands out of the CTA button', async ({ page }) => {
  const cta = await page.getByTestId('join-cta').boundingBox();
  await page.getByTestId('join-cta').click();
  const anim = await form(page).evaluate((el) => ({
    animation: el.style.animation,
    top: el.style.getPropertyValue('--ex-t'),
  }));
  expect(anim.animation).toContain('tdExpand');
  expect(parseFloat(anim.top)).toBeCloseTo(cta!.y, 0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

for (const via of ['back button', 'browser back'] as const) {
  test(`${via} collapses the form into the landing at the previous scroll position`, async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(100);
    const y = await page.evaluate(() => scrollY);
    await openForm(page);

    if (via === 'back button') await page.getByRole('button', { name: 'Back' }).click();
    else await page.goBack();

    // During the collapse the form is a fixed, non-interactive overlay above the landing.
    await expect(form(page)).toHaveCSS('position', 'fixed');
    await expect(form(page)).toHaveCSS('pointer-events', 'none');
    expect(await form(page).evaluate((el) => el.style.animation)).toContain('tdCollapse');
    await expect(page.getByTestId('join-cta')).toBeAttached();

    await expect(form(page)).toHaveCount(0, { timeout: 2000 }); // unmounted after ~560ms
    await expect(page).toHaveURL(/\/$/);
    expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(2);
  });
}

test('browser forward re-opens the form', async ({ page }) => {
  await openForm(page);
  await page.goBack();
  await expect(form(page)).toHaveCount(0, { timeout: 2000 });
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Join the waitlist' })).toBeVisible();
});

test('intro reveal plays on first load only', async ({ page }) => {
  await expect(page.locator('html')).toHaveClass(/td-intro/);
  await expect(page.locator('[data-reveal="hero"]').first()).toHaveAttribute('data-shown', '');
  await openForm(page);
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('html')).not.toHaveClass(/td-intro/);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('skips the intro and all transitions', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveClass(/td-intro/);
    const h1 = page.getByRole('heading', { name: 'Make proactive healthcare simple.' });
    expect(await h1.evaluate((el) => getComputedStyle(el.closest('[data-reveal]')!).opacity)).toBe('1');
    const marquee = await page.locator('.marquee-l').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(marquee).toBe('none');

    await openForm(page);
    await page.getByRole('button', { name: 'Back' }).click();
    // No collapse overlay: the form is removed straight away.
    await expect(form(page)).toHaveCount(0, { timeout: 200 });
  });
});
