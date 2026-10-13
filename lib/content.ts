// All site copy and data: from the prototypes, plus later product-approved updates
// (see READBACK.md). Biomarker counts are derived from the lists below, never typed by hand.

export type Biomarker = { name: string; desc: string; /** Annual/once-only tests, e.g. "Once a year · Men". Not shown on the site; omitted = core panel (twice a year), used for CORE_BIOMARKERS */ note?: string };
export type HealthArea = { id: string; name: string; icon: string; tags: Biomarker[] };

// Source: TruDoc_Gold_Test_Menu.xlsx (Core 2x a year + Annual 1x a year), grouped into the 13 health areas.
const areaDefs: HealthArea[] = [
  { id: 'blood', name: 'Blood health', icon: 'bio-blood', tags: [
    { name: 'Red blood cells (RBC)', desc: 'How many oxygen-carrying red cells are in your blood' },
    { name: 'Haemoglobin (Hb)', desc: 'The protein in red blood cells that carries oxygen' },
    { name: 'Haematocrit (PCV)', desc: 'The share of your blood made up of red blood cells' },
    { name: 'MCV', desc: 'The average size of your red blood cells' },
    { name: 'MCH', desc: 'The average amount of haemoglobin in each red blood cell' },
    { name: 'MCHC', desc: 'How concentrated the haemoglobin is inside your red blood cells' },
    { name: 'RDW-CV', desc: 'How much your red blood cells vary in size' },
    { name: 'RDW-SD', desc: 'The size variation of your red blood cells, as an absolute measure' },
    { name: 'Platelets', desc: 'Cells that help your blood clot' },
    { name: 'MPV (mean platelet volume)', desc: 'The average size of your platelets' },
    { name: 'PDW (platelet distribution width)', desc: 'How much your platelets vary in size' },
    { name: 'Ferritin', desc: 'Shows how much iron your body has stored' },
    { name: 'Iron', desc: 'The iron in your blood right now, used to carry oxygen' },
    { name: 'TIBC (total iron-binding capacity)', desc: 'How much iron your blood is able to carry' },
    { name: 'UIBC (unsaturated iron-binding capacity)', desc: 'The spare capacity your blood has to carry more iron' },
    { name: 'Transferrin saturation', desc: 'How much of your blood’s iron-carrying capacity is in use' },
    { name: 'ABO blood group', desc: 'Your blood type: A, B, AB or O', note: 'Once, when you join' },
    { name: 'Rh factor', desc: 'Whether your blood type is positive or negative', note: 'Once, when you join' },
  ] },
  { id: 'heart', name: 'Heart health', icon: 'bio-heart', tags: [
    { name: 'Total cholesterol', desc: 'The overall amount of cholesterol in your blood' },
    { name: 'LDL', desc: '“Bad” cholesterol that can build up in your arteries' },
    { name: 'HDL', desc: '“Good” cholesterol that helps clear fat from your blood' },
    { name: 'Non-HDL', desc: 'All the cholesterol types that can clog your arteries' },
    { name: 'Triglycerides', desc: 'Fats in your blood, often raised by sugar, alcohol and extra weight' },
    { name: 'VLDL', desc: 'Cholesterol carried in triglyceride-rich particles' },
    { name: 'Remnant cholesterol', desc: 'Leftover cholesterol linked to heart risk, even when LDL looks normal' },
    { name: 'Total cholesterol / HDL ratio', desc: 'A simple ratio that sums up your cholesterol balance' },
    { name: 'Triglyceride / HDL ratio', desc: 'A ratio that can hint at insulin resistance' },
    { name: 'ApoB', desc: 'Counts the particles that carry cholesterol into artery walls' },
    { name: '10-year heart risk (PREVENT)', desc: 'Your estimated risk of a heart attack or stroke over the next 10 years' },
    { name: 'Lipoprotein(a)', desc: 'An inherited type of cholesterol linked to heart disease', note: 'Once, when you join' },
  ] },
  { id: 'diabetes', name: 'Diabetes health', icon: 'bio-glucose', tags: [
    { name: 'Fasting glucose', desc: 'Measures blood sugar levels after an overnight fast' },
    { name: 'HbA1c', desc: 'Measures average blood sugar over the past 2–3 months' },
    { name: 'Estimated average glucose (eAG)', desc: 'Your HbA1c shown in everyday blood sugar units' },
    { name: 'Fasting insulin', desc: 'Measures insulin levels after an overnight fast' },
    { name: 'HOMA-IR', desc: 'An estimate of how well your body responds to insulin' },
    { name: 'TyG index', desc: 'Another estimate of insulin resistance, from triglycerides and glucose' },
  ] },
  { id: 'thyroid', name: 'Thyroid health', icon: 'bio-thyroid', tags: [
    { name: 'TSH', desc: 'The signal your brain sends to tell your thyroid how hard to work' },
    { name: 'Free T4', desc: 'The main hormone your thyroid makes' },
  ] },
  { id: 'hormones', name: 'Hormonal health', icon: 'bio-hormones', tags: [
    { name: 'Total testosterone', desc: 'A key hormone for energy, muscle, mood and sex drive', note: 'Once a year · Men' },
    { name: 'SHBG', desc: 'A protein that controls how much of your sex hormones your body can use', note: 'Once a year · Men' },
    { name: 'Free testosterone', desc: 'The testosterone that’s free for your body to use', note: 'Once a year · Men' },
    { name: 'Bioavailable testosterone', desc: 'Testosterone that’s available to your tissues', note: 'Once a year · Men' },
  ] },
  { id: 'liver', name: 'Liver health', icon: 'bio-liver', tags: [
    { name: 'ALT', desc: 'A liver enzyme that rises when liver cells are stressed' },
    { name: 'AST', desc: 'An enzyme from the liver and muscles that rises with damage' },
    { name: 'ALP', desc: 'An enzyme linked to the liver, bile ducts and bones' },
    { name: 'GGT', desc: 'A liver enzyme often raised by alcohol or fatty liver' },
    { name: 'Total bilirubin', desc: 'A yellow pigment your liver clears from old red blood cells' },
    { name: 'Direct bilirubin', desc: 'Bilirubin your liver has processed, a sign of how bile is flowing' },
    { name: 'Indirect bilirubin', desc: 'Bilirubin your liver hasn’t processed yet' },
    { name: 'Total protein', desc: 'All the protein in your blood, including albumin and antibodies' },
    { name: 'Albumin', desc: 'The main protein your liver makes, a sign of liver health and nutrition' },
    { name: 'Globulin', desc: 'Blood proteins that include your antibodies' },
    { name: 'Albumin / globulin ratio', desc: 'The balance between your main blood proteins' },
    { name: 'AST / ALT ratio', desc: 'Helps show the pattern behind raised liver enzymes' },
    { name: 'FIB-4 score', desc: 'Estimates your risk of liver scarring' },
  ] },
  { id: 'kidney', name: 'Kidney health', icon: 'bio-kidney', tags: [
    { name: 'Creatinine', desc: 'A waste product your kidneys filter out of your blood' },
    { name: 'Urea (BUN)', desc: 'Waste from protein breakdown, cleared by your kidneys' },
    { name: 'eGFR', desc: 'An estimate of how well your kidneys are filtering' },
    { name: 'BUN / creatinine ratio', desc: 'Helps tell dehydration apart from a kidney cause' },
    { name: 'Urine albumin', desc: 'The amount of albumin protein in your urine' },
    { name: 'Urine creatinine', desc: 'Corrects your urine results for how concentrated your urine is' },
    { name: 'Urine albumin:creatinine (uACR)', desc: 'Checks for protein leaking into your urine, an early sign of kidney stress' },
    { name: 'Uric acid', desc: 'A waste product that can cause gout and kidney stones when high' },
    { name: 'Sodium', desc: 'Balances fluid in your body and supports your nerves' },
    { name: 'Potassium', desc: 'Keeps your heartbeat and muscles working properly' },
    { name: 'Chloride', desc: 'Helps keep your body’s fluid and acid balance steady' },
    { name: 'Bicarbonate', desc: 'Shows your blood’s acid-base balance' },
    { name: 'Anion gap', desc: 'A calculation that helps spot acid-base problems' },
  ] },
  { id: 'bone', name: 'Bone health', icon: 'bio-bone', tags: [
    { name: 'Calcium', desc: 'Keeps your bones, muscles and nerves working' },
    { name: 'Corrected calcium', desc: 'Your calcium level adjusted for the protein that carries it' },
    { name: 'Phosphorus', desc: 'Works with calcium to build bones and make energy' },
    { name: 'Magnesium', desc: 'A mineral for muscles, nerves, sleep and heart rhythm' },
  ] },
  { id: 'immunity', name: 'Immunity & inflammation', icon: 'bio-immunity', tags: [
    { name: 'White blood cells (WBC)', desc: 'Counts your white blood cells, which fight infection' },
    { name: 'Neutrophils (%)', desc: 'The share of white cells that respond first to bacterial infections' },
    { name: 'Neutrophils (absolute count)', desc: 'The number of neutrophils in your blood' },
    { name: 'Lymphocytes (%)', desc: 'The share of white cells that fight viruses and make antibodies' },
    { name: 'Lymphocytes (absolute count)', desc: 'The number of lymphocytes in your blood' },
    { name: 'Monocytes (%)', desc: 'The share of white cells that clear infections and damaged tissue' },
    { name: 'Monocytes (absolute count)', desc: 'The number of monocytes in your blood' },
    { name: 'Eosinophils (%)', desc: 'The share of white cells involved in allergies and parasitic infections' },
    { name: 'Eosinophils (absolute count)', desc: 'The number of eosinophils in your blood' },
    { name: 'Basophils (%)', desc: 'The share of rare white cells that release histamine in allergies' },
    { name: 'Basophils (absolute count)', desc: 'The number of basophils in your blood' },
    { name: 'Immature granulocytes (%)', desc: 'Young white cells that can rise with infection or inflammation' },
    { name: 'Immature granulocytes (absolute count)', desc: 'The number of immature granulocytes in your blood' },
    { name: 'Neutrophil-to-lymphocyte ratio (NLR)', desc: 'A ratio that reflects inflammation across your body' },
    { name: 'Platelet-to-lymphocyte ratio (PLR)', desc: 'Another ratio linked to inflammation in your body' },
    { name: 'hs-CRP', desc: 'Picks up low-level inflammation linked to heart disease' },
  ] },
  { id: 'urinary', name: 'Urinary health', icon: 'bio-urinary', tags: [
    { name: 'Colour', desc: 'The colour of your urine, a clue to how hydrated you are' },
    { name: 'Appearance', desc: 'Whether your urine is clear or cloudy' },
    { name: 'Specific gravity', desc: 'How concentrated your urine is, a sign of hydration' },
    { name: 'pH', desc: 'How acidic your urine is, linked to kidney stones' },
    { name: 'Protein', desc: 'Checks for protein, which can mean your kidneys are leaking' },
    { name: 'Glucose', desc: 'Checks for sugar spilling into your urine' },
    { name: 'Ketones', desc: 'Appear when your body burns fat for fuel, such as when fasting' },
    { name: 'Bilirubin', desc: 'Can point to a liver or bile problem' },
    { name: 'Urobilinogen', desc: 'Reflects how your liver processes old red blood cells' },
    { name: 'Occult blood', desc: 'Checks for traces of blood you can’t see' },
    { name: 'Nitrite', desc: 'Can signal bacteria in your urine' },
    { name: 'Leukocyte esterase', desc: 'Detects white cells, a possible sign of infection' },
    { name: 'Red blood cells (microscopy)', desc: 'Confirms whether there’s blood in your urine' },
    { name: 'White blood cells (microscopy)', desc: 'Looks for infection or inflammation' },
    { name: 'Squamous epithelial cells', desc: 'Checks the sample was collected cleanly' },
    { name: 'Casts', desc: 'Tiny particles that can show where a kidney problem starts' },
    { name: 'Crystals', desc: 'Can point to a risk of kidney stones' },
    { name: 'Bacteria', desc: 'Looks for bacteria; on its own, this doesn’t mean an infection' },
    { name: 'Yeast', desc: 'Checks for a fungal infection' },
  ] },
  { id: 'vitamins', name: 'Vitamins', icon: 'bio-nutrients', tags: [
    { name: 'Vitamin D', desc: 'Supports strong bones, immunity and mood', note: 'Once a year' },
    { name: 'Vitamin B12', desc: 'Needed for energy, nerves and making red blood cells', note: 'Once a year' },
    { name: 'Folate', desc: 'A B vitamin that helps your body make new cells', note: 'Once a year' },
  ] },
  { id: 'prostate', name: 'Prostate health', icon: 'bio-prostate', tags: [
    { name: 'PSA', desc: 'A protein that helps screen for prostate problems', note: 'Once a year · Men 50+' },
  ] },
  { id: 'bioage', name: 'Biological age', icon: 'bio-age', tags: [
    { name: 'Biological age', desc: 'How old your body seems, based on your blood results' },
    { name: 'Age gap', desc: 'The difference between your biological and actual age, tracked over time' },
  ] },
];

/** Each area's count ("18 biomarkers") is derived from its list, so it can't drift. */
export const areas = areaDefs.map((a) => ({ ...a, count: `${a.tags.length} biomarker${a.tags.length === 1 ? '' : 's'}` }));

/** Every biomarker on the menu (core + annual); used in "We test N biomarkers" lines. */
export const TOTAL_BIOMARKERS = areaDefs.reduce((n, a) => n + a.tags.length, 0);
/** Core panel only (no note): the biomarkers tested twice a year. */
export const CORE_BIOMARKERS = areaDefs.reduce((n, a) => n + a.tags.filter((t) => !t.note).length, 0);

// Only biomarkers that are actually in the test panel.
export const chipsA = ['Cholesterol', 'LDL', 'HDL', 'ApoB', 'Lipoprotein(a)', 'Glucose', 'HbA1c', 'Insulin', 'Uric acid', 'ALT', 'eGFR'];
export const chipsB = ['TSH', 'Free T4', 'Testosterone', 'Cortisol', 'hs-CRP', 'Homocysteine', 'Hemoglobin', 'Vitamin D', 'Vitamin B12', 'Ferritin', 'Magnesium'];

export const heroFeatures = [
  { icon: '/assets/icons/test-tube-y.svg', title: '2 full-body tests in a year', desc: `${TOTAL_BIOMARKERS} biomarkers tested without relying on\ninsurance coverage` },
  { icon: '/assets/icons/user-md-y.svg', title: 'A doctor and specialist by your side, always', desc: 'Get ongoing support from doctors and specialists for\nwhatever your health needs' },
  { icon: '/assets/icons/risk-y.svg', title: 'Spot health risks early', desc: 'Track chronic-risk markers and understand changes\nin your health over time' },
];

export const heroPrices = [
  { label: 'Individual', price: 'AED 1/ day', was: 'AED 2/ day' },
  { label: 'Family of up to 4 adults', price: 'AED 2/ day', was: 'AED 4/ day' },
];

export const steps = [
  { img: '/assets/step1-113.png', title: `${TOTAL_BIOMARKERS} biomarkers, tested at home`, desc: 'One comprehensive test covering key areas like heart, metabolism, hormones, liver, kidney and thyroid' },
  { img: '/assets/step2-113.png', title: 'Your results, made easy to understand', desc: 'See your biomarkers in a simple, easy-to-read app report, with clear ranges showing what’s healthy and what needs attention' },
  { img: '/assets/step3-v2.png', title: 'A doctor by your side, always', desc: 'Talk through your results with a doctor who understands you and provides ongoing, personalised guidance whenever you need it' },
  { img: '/assets/step4.png', title: 'The right specialist when you need one', desc: 'If something needs a closer look, get connected with the right specialist for a more targeted plan' },
  { img: '/assets/step5.png', title: 'Keep track of your progress', desc: 'Test again to see how your health is changing, and let your doctor refine your plan based on your latest results' },
];

// Clinical risks that can be flagged from the test menu. Every marker below is on the menu
// (core or annual). Cards show the first four markers and "+N" for the rest. These support risk
// assessment; they don't confirm a diagnosis on their own (e.g. liver enzymes alone can't diagnose
// fatty liver). \u2060 (word joiner) keeps hyphenated names like hs-CRP on one line.
type Risk = { title: string; markers: string[] };

const risks: Risk[] = [
  { title: 'Cardiovascular disease', markers: ['ApoB', 'LDL', 'Lipoprotein(a)', 'hs-\u2060CRP', 'non-\u2060HDL', 'triglycerides', '10-year heart risk (PREVENT)'] },
  { title: 'Prediabetes & type 2 diabetes', markers: ['HbA1c', 'fasting glucose', 'fasting insulin', 'HOMA-\u2060IR', 'TyG index', 'estimated average glucose'] },
  { title: 'Fatty liver disease', markers: ['ALT', 'AST', 'GGT', 'FIB-\u20604 score', 'triglycerides', 'AST/ALT ratio'] },
  { title: 'Chronic kidney disease', markers: ['eGFR', 'uACR', 'creatinine', 'urine protein', 'urea (BUN)'] },
  { title: 'Hypothyroidism & hyperthyroidism', markers: ['TSH', 'Free T4'] },
  { title: 'Iron-deficiency anaemia', markers: ['haemoglobin', 'ferritin', 'transferrin saturation', 'MCV', 'serum iron', 'TIBC', 'RDW'] },
  { title: 'Vitamin B12 & folate deficiency', markers: ['vitamin B12', 'folate', 'MCV', 'haemoglobin', 'RDW'] },
  { title: 'Low testosterone (men)', markers: ['total testosterone', 'free testosterone', 'SHBG', 'bioavailable testosterone'] },
];

/** "Tracked through A, B, C, D +N" (or "A, B and C" when there are four or fewer). */
function trackedThrough(m: string[]): string {
  if (m.length > 4) return `Tracked through ${m.slice(0, 4).join(', ')} +${m.length - 4}`;
  return `Tracked through ${m.length > 1 ? `${m.slice(0, -1).join(', ')} and ${m[m.length - 1]}` : m[0]}`;
}

const riskCards = risks.map((r) => ({ title: r.title, desc: trackedThrough(r.markers) }));
/** Distinct risks the menu can flag, enumerated in docs/health-risks.md (needs medical sign-off). */
export const HEALTH_RISKS_FLAGGED = 91;
/** Rounded down to the nearest 10 for the headline, so it never overstates: 91 → "90+". */
export const HEALTH_RISKS_LABEL = `${Math.floor(HEALTH_RISKS_FLAGGED / 10) * 10}+`;

// Mobile shows two scrolling rows; desktop concatenates them into one grid.
export const conditionsA = riskCards.slice(0, 4);
export const conditionsB = riskCards.slice(4);

export const doctors = [
  { name: 'Dr. Imaan Chowdhury', role: 'Specialist, American board certified', img: '/assets/doc-imaan.png', w: 378, h: 398 },
  { name: 'Dr. Maya El Khouri', role: 'Specialist, American board certified', img: '/assets/doc-maya.png', w: 480, h: 398 },
  { name: 'Dr. Mehryar Andacheh', role: 'GP certified, DHA licensed', img: '/assets/doc-mehryar.png', w: 398, h: 398 },
  { name: 'Danya Taha', role: 'Nutrionist, DHA licensed', img: '/assets/doc-2.png', w: 374, h: 398 },
  { name: 'Dr. Anas Abdul', role: 'GP certified, DOH licensed', img: '/assets/doc-5.png', w: 416, h: 400 },
];

export const plans = [
  { name: 'Gold Individual', sub: 'For you', amount: 'AED 1', badgeIcon: '/assets/icons/mug-g.svg', badge: 'Less than a cup of karak chai', billed: 'Billed annually at AED 365',
    features: [`${CORE_BIOMARKERS} biomarkers tested 2 times a year`, 'Access to doctors & specialists', 'Spot potential health risks early', 'Personalised guidance for your health needs'], starBoxW: 194, star: '/assets/icons/star-1.svg' },
  { name: 'Gold Family', sub: 'Up to 4 members above 18+ ', amount: 'AED 2', badgeIcon: '/assets/icons/badge-percent-g.svg', badge: 'AED 0.50 per member', billed: 'Billed annually at AED 730',
    features: ['Everything in Individual, for each member', 'Separate results and plan for every person', 'One subscription, managed by you'], starBoxW: 204, star: '/assets/icons/star-2.svg' },
];

// Answers may contain **bold** spans (rendered by components/landing/Faq.tsx).
export const faqs: [string, string][] = [
  ["How is TruDoc Gold different from health insurance?",
    "Health insurance helps cover eligible healthcare expenses, subject to your policy. TruDoc Gold focuses on proactive health management, with **two comprehensive health check-ups every year, regardless of whether you have a diagnosed condition**. You also get access to doctors and specialists who can help you act on your results, followed by a repeat check-up to track your progress."],
  ["Who can I add to my Gold Family Plan?",
    "You can include up to **four members aged 18 or older** in your family plan. Each member gets access to their own health journey and the benefits included in Gold. Children under 18 cannot be added to the plan."],
  ["Are medicines and treatments included in TruDoc Gold?",
    "No. Medicines and treatments are not included in the Gold membership fee. However, as a healthcare provider, TruDoc can help coordinate your care and guide you towards the appropriate treatment. If your insurance covers the prescribed medicines, tests or treatments, we can help you navigate the process, subject to your policy's terms and approvals."],
  ["What happens if my health check-up results show a potential risk?",
    "Your doctor will review your results, explain what needs attention and help you understand the next steps. Where appropriate, you can access specialist consultations and a personalised care plan. Your second annual check-up helps you and your doctor track changes and assess your progress."],
  ["What happens after I join the waitlist?",
    "Once you join the waitlist, our team will get in touch to walk you through the TruDoc Gold plan, understand your health needs and answer any questions you have. **You’ll only be asked to make a payment once you’re comfortable with the plan and ready to proceed.**"],
  ["Are TruDoc Gold lab tests reliable and accurate?",
    "Our lab tests are conducted in laboratories accredited to **ISO 15189:2022**, an international standard for medical laboratory quality and competence, helping ensure reliable results for your doctor to review."],
];
export const FAQ_DEFAULT_OPEN = 3;

export const planOptions = [
  { id: 'individual', label: 'Individual', price: 'AED 1/day', billed: 'Billed annually at AED 365' },
  { id: 'family', label: 'Family', price: 'AED 2/day', billed: 'Billed annually at AED 730' },
] as const;

export const SUBMIT_ERROR = "We couldn't add you to the waitlist. Please try again.";
