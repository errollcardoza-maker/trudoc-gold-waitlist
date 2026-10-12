import { expect, test } from '@playwright/test';
import { withFreshIp } from './helpers';

test.beforeEach(async ({ page }) => {
  await withFreshIp(page);
  await page.goto('/');
});

test('biomarkers: Heart is open by default and only one area opens at a time', async ({ page }) => {
  const list = page.getByTestId('biomarkers');
  const heart = list.getByRole('button', { name: /^Heart/ });
  const diabetes = list.getByRole('button', { name: /^Diabetes health/ });

  await expect(heart).toHaveAttribute('aria-expanded', 'true');
  await expect(list.locator('[aria-expanded="true"]')).toHaveCount(1);
  await expect(list.getByText('Lipoprotein(a)', { exact: true })).toBeVisible();

  await diabetes.click();
  await expect(diabetes).toHaveAttribute('aria-expanded', 'true');
  await expect(heart).toHaveAttribute('aria-expanded', 'false');
  await expect(list.locator('[aria-expanded="true"]')).toHaveCount(1);

  // Tapping the open one closes it, leaving none open.
  await diabetes.click();
  await expect(list.locator('[aria-expanded="true"]')).toHaveCount(0);

  // Keyboard: Enter and Space toggle.
  await heart.focus();
  await page.keyboard.press('Enter');
  await expect(heart).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(heart).toHaveAttribute('aria-expanded', 'false');
});

test('FAQ: "What happens after I get my results?" is open by default; one open at a time', async ({ page }) => {
  const faq = page.getByTestId('faq');
  const q3 = faq.getByRole('button', { name: 'What happens after I get my results?' });
  const q0 = faq.getByRole('button', { name: 'Are the tests covered by my insurance?' });

  await expect(q3).toHaveAttribute('aria-expanded', 'true');
  await expect(faq.locator('button[aria-expanded="true"]')).toHaveCount(1);

  await q0.click();
  await expect(q0).toHaveAttribute('aria-expanded', 'true');
  await expect(q3).toHaveAttribute('aria-expanded', 'false');

  // Tapping the answer text (not just the question) also toggles, as in the prototype.
  await faq.getByText(/^Your Gold plan already includes the tests/).click();
  await expect(faq.locator('button[aria-expanded="true"]')).toHaveCount(0);
});

test('sticky CTA is visible from first paint', async ({ page }) => {
  await expect(page.getByTestId('join-cta')).toBeInViewport();
  await expect(page.getByText('From AED 1/day').filter({ visible: true })).toHaveCount(1);
});

test('captures UTM params into sessionStorage', async ({ page }) => {
  await page.goto('/?utm_source=ig&utm_campaign=launch&foo=bar');
  const utm = await page.evaluate(() => sessionStorage.getItem('tdg-utm'));
  expect(JSON.parse(utm!)).toEqual({ utm_source: 'ig', utm_campaign: 'launch' });
});

for (const width of [320, 360, 375, 390, 414, 430, 480]) {
  test(`no horizontal overflow on the landing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw).toBeLessThanOrEqual(width);
  });
}

test.describe('mobile layout snapshot', () => {
  test.use({ reducedMotion: 'reduce' });

  test('mobile landing (< 768px) matches the approved snapshot', async ({ page }) => {
    await page.goto('/');
    // Load every lazy image first so the full-page capture is complete and stable.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => img.setAttribute('loading', 'eager'));
      await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))));
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot('mobile-landing.png', { fullPage: true, maxDiffPixelRatio: 0.01, animations: 'disabled' });
  });
});

test('Oct 12 change set: copy, phone, removed items', async ({ page }) => {
  // Hero feature #2, How it works step 2, conditions and doctors copy
  await expect(page.getByText('A doctor and specialist by your side, always').first()).toBeAttached();
  await expect(page.getByText('A doctor by your side, always', { exact: true })).toBeAttached();
  for (const t of ['Gout', 'Anaemia', 'Low testosterone']) await expect(page.getByText(t, { exact: true }).first()).toBeAttached();
  await expect(page.getByText('4.5 Rating').first()).toBeAttached();
  await expect(page.getByText('GP certified, DOH licensed')).toBeAttached();
  await expect(page.getByText('Personalised guidance for your health needs')).toBeAttached();
  // Footer toll-free number
  await expect(page.locator('a[href="tel:800878362"]').first()).toHaveText('800 878 362');
  // Removed: experience lines, payment providers, the person image, non-tested chips
  await expect(page.getByText(/years of experience/)).toHaveCount(0);
  await expect(page.getByText('Split your payment with')).toHaveCount(0);
  await expect(page.locator('img[src*="human.png"], img[src*="tabby"], img[src*="tamara"]')).toHaveCount(0);
  await expect(page.getByText('Blood Pressure')).toHaveCount(0);
  // New hero art
  await expect(page.locator('img[src*="test-tube.png"]').first()).toBeAttached();
});
