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

test('FAQ: "What happens if my health check-up results show a potential risk?" is open by default; one open at a time', async ({ page }) => {
  const faq = page.getByTestId('faq');
  const q3 = faq.getByRole('button', { name: 'What happens if my health check-up results show a potential risk?' });
  const q0 = faq.getByRole('button', { name: 'How is TruDoc Gold different from health insurance?' });

  await expect(q3).toHaveAttribute('aria-expanded', 'true');
  await expect(faq.locator('button[aria-expanded="true"]')).toHaveCount(1);

  await q0.click();
  await expect(q0).toHaveAttribute('aria-expanded', 'true');
  await expect(q3).toHaveAttribute('aria-expanded', 'false');

  // Tapping the answer text (not just the question) also toggles, as in the prototype.
  await faq.getByText(/^Health insurance helps cover eligible/).click();
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
  for (const t of ['Cardiovascular disease', 'Iron-deficiency anaemia', 'Low testosterone (men)']) await expect(page.getByText(t, { exact: true }).first()).toBeAttached();
  const scroller = page.getByTestId('conditions-scroller');
  await expect(scroller.getByText(/^Tracked through/)).toHaveCount(8);
  await expect(scroller.getByText(/^Tracked through ApoB, LDL, Lipoprotein\(a\), hs-\u2060CRP \+3$/)).toBeAttached();
  await expect(scroller.getByText('Tracked through TSH and Free T4', { exact: true })).toBeAttached();
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

test('FAQ answers render **bold** phrases as bold text, with no stray asterisks', async ({ page }) => {
  const faq = page.getByTestId('faq');
  await faq.getByRole('button', { name: 'What happens after I join the waitlist?' }).click();
  await expect(faq.locator('strong', { hasText: 'only be asked to make a payment' })).toBeVisible();
  await expect(faq.locator('strong')).toHaveCount(4);
  await expect(faq.locator('strong', { hasText: 'ISO 15189:2022' })).toBeAttached();
  await expect(faq.getByRole('button')).toHaveCount(6);
  await expect(faq.getByText(/\*\*/)).toHaveCount(0);
});

test('test menu: 13 health areas, 113 biomarkers (102 core), counts derived', async ({ page }) => {
  const list = page.getByTestId('biomarkers');
  await expect(page.getByRole('heading', { name: /We test 113 biomarkers\s+across 13 health areas/ })).toBeAttached();
  for (const [area, n] of [['Blood health', 18], ['Immunity & inflammation', 16], ['Urinary health', 19], ['Bone health', 4], ['Prostate health', 1], ['Biological age', 2]] as const)
    await expect(list.getByRole('button', { name: new RegExp(`^${area}\\s*${n} biomarkers?$`) })).toBeAttached();
  await expect(list.getByRole('button')).toHaveCount(13);
  // Frequency notes aren't shown, just the one-line explanation
  await list.getByRole('button', { name: /^Prostate health/ }).click();
  await expect(page.locator('#area-panel-prostate').getByText('A protein that helps screen for prostate problems')).toBeVisible();
  await expect(list.getByText(/Once a year|Once, when you join/)).toHaveCount(0);
  // Twice-a-year claims use the core count
  await expect(page.getByText('102 biomarkers tested 2 times a year')).toBeAttached();
  await expect(page.getByText(/(50\+|59) biomarkers/)).toHaveCount(0);
});

test('risks section ends with a tall "90+" summary card spanning both rows, with a disclaimer', async ({ page }) => {
  const box = page.getByTestId('risks-summary');
  await expect(box).toContainText('90+');
  await expect(box).toContainText('Health risks we can help you spot early');
  await expect(box).toContainText('not a diagnosis');
  const cards = page.getByTestId('conditions-scroller').locator('.rounded-xl').filter({ hasNot: page.getByText('90+') });
  const top = await cards.first().boundingBox();
  const bottom = await cards.nth(4).boundingBox(); // first card of row 2
  const b = await box.boundingBox();
  expect(Math.round(b!.y)).toBe(Math.round(top!.y));
  expect(Math.round(b!.y + b!.height)).toBe(Math.round(bottom!.y + bottom!.height));
  // Same width as the other cards
  expect(Math.round(b!.width)).toBe(Math.round(top!.width));
  // Same 8px gap between rows as between cards in a row
  const second = await cards.nth(1).boundingBox();
  expect(Math.round(bottom!.y - (top!.y + top!.height))).toBe(Math.round(second!.x - (top!.x + top!.width)));
});
