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
  await faq.getByText(/^Health insurance often covers tests/).click();
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
  await expect(page.getByText('Doctors and specialists for lifelong wellbeing', { exact: true }).first()).toBeAttached();
  await expect(page.getByText('A doctor by your side, always', { exact: true })).toBeAttached();
  for (const t of ['Cardiovascular risk', 'Iron-deficiency anaemia', 'Vitamin D deficiency']) await expect(page.getByText(t, { exact: true }).first()).toBeAttached();
  const scroller = page.getByTestId('conditions-scroller');
  await expect(scroller.getByText(/^Tracked through/)).toHaveCount(8);
  await expect(scroller.getByText(/^Tracked through LDL, non-\u2060HDL, Lipoprotein\(a\), triglycerides \+3$/)).toBeAttached();
  await expect(scroller.getByText('Tracked through TSH, Free T4 and Free T3', { exact: true })).toBeAttached();
  // No risk card names a test that isn't on the v4 menu
  await expect(scroller.getByText(/ApoB|insulin|HOMA|uACR|testosterone|folate|hs-/)).toHaveCount(0);
  await expect(page.getByText('4.5 Rating').first()).toBeAttached();
  await expect(page.getByText('GP certified, DoH licensed')).toBeAttached();
  await expect(page.getByText('Personalised guidance for your health needs')).toBeAttached();
  // Footer toll-free number
  await expect(page.locator('a[href="tel:800878362"]').first()).toHaveText('800 878 362');
  // Removed: experience lines, payment providers, the person image, non-tested chips
  await expect(page.getByText(/years of experience/)).toHaveCount(0);
  await expect(page.getByText('Split your payment with')).toHaveCount(0);
  await expect(page.locator('img[src*="human.png"], img[src*="tabby"], img[src*="tamara"]')).toHaveCount(0);
  await expect(page.getByText('Blood Pressure')).toHaveCount(0);
  // Hero chips name tested markers only (v4)
  const hero = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Make proactive healthcare simple.' }) });
  for (const gone of ['ApoB', 'Insulin', 'Testosterone', 'Cortisol', 'Homocysteine', 'Magnesium']) await expect(hero.getByText(gone, { exact: true })).toHaveCount(0);
  // New hero art
  await expect(page.locator('img[src*="test-tube.png"]').first()).toBeAttached();
});

test('FAQ answers render **bold** phrases as bold text, with no stray asterisks', async ({ page }) => {
  const faq = page.getByTestId('faq');
  await faq.getByRole('button', { name: 'What happens after I join the waitlist?' }).click();
  await expect(faq.locator('strong', { hasText: 'only be asked to make a payment' })).toBeVisible();
  await expect(faq.locator('strong')).toHaveCount(3);
  await expect(faq.locator('strong', { hasText: 'ISO 15189:2022' })).toBeAttached();
  await expect(faq.getByRole('button')).toHaveCount(6);
  await expect(faq.getByText(/\*\*/)).toHaveCount(0);
});

test('test menu v4: 13 shown health areas, 104 biomarkers (101 core), counts derived', async ({ page }) => {
  const list = page.getByTestId('biomarkers');
  await expect(page.getByRole('heading', { name: /We test 100\+ biomarkers\s+across 13 health areas/ })).toBeAttached();
  for (const [area, n] of [['Immunity & inflammation', 16], ['Urinary health', 19], ['Bone health', 2], ['Prostate health', 1], ['Biological age', 2]] as const)
    await expect(list.getByRole('button', { name: new RegExp(`^${area}\\s*${n} biomarkers?$`) })).toBeAttached();
  // Paid add-ons are listed and tagged but kept out of every count
  await expect(list.getByRole('button', { name: /^Blood health\s*19 biomarkers$/ })).toBeAttached();
  await expect(page.getByText(/ABO blood group|Rh factor/)).toHaveCount(0);
  await expect(list.getByRole('button', { name: /^Hormonal health\s*3 paid add-ons$/ })).toBeAttached();
  await list.getByRole('button', { name: /^Hormonal health/ }).click();
  await expect(page.locator('#area-panel-hormones').getByText('Paid add-on', { exact: true })).toHaveCount(3);
  await expect(list.getByRole('button')).toHaveCount(13);
  // Frequency notes aren't shown, just the one-line explanation
  await list.getByRole('button', { name: /^Prostate health/ }).click();
  await expect(page.locator('#area-panel-prostate').getByText('A protein that helps screen for prostate problems')).toBeVisible();
  await expect(list.getByText(/Once a year|Once, when you join/)).toHaveCount(0);
  // Twice-a-year claims use the core count
  await expect(page.getByText('100+ biomarkers tested 2 times a year')).toBeAttached();
  await expect(page.getByText(/(50\+|59|101|104|113) biomarkers/)).toHaveCount(0);
});

test('risks section ends with a tall "80+" summary card spanning both rows, with a disclaimer', async ({ page }) => {
  const box = page.getByTestId('risks-summary');
  await expect(box).toContainText('80+');
  await expect(box).toContainText('Health risks we can help you spot early');
  await expect(box).toContainText('not a diagnosis');
  const cards = page.getByTestId('conditions-scroller').locator('.rounded-xl').filter({ hasNot: page.getByText('80+') });
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
