// All copy and data below is taken verbatim from the prototype
// (`TruDoc Gold Waitlist.dc.html`). Do not edit copy here without design sign-off.

export const chipsA = ['Heart Rate', 'Blood Pressure', 'BMI', 'SpO2', 'HRV', 'Sleep', 'Glucose', 'Cholesterol', 'Cortisol'];
export const chipsB = ['HbA1c', 'LDL', 'HDL', 'Triglycerides', 'CRP', 'TSH', 'Vitamin D', 'Ferritin', 'Creatinine'];

export const heroFeatures = [
  { icon: '/assets/icons/test-tube-y.svg', title: 'Full-body tested 2x a year', desc: '50+ biomarkers tested without relying on\ninsurance coverage' },
  { icon: '/assets/icons/user-md-y.svg', title: 'Review with a doctor who gets you', desc: 'Review your results with a doctor and leave with a\nclear action plan.' },
  { icon: '/assets/icons/risk-y.svg', title: 'Spot health risks early', desc: 'Track chronic-risk markers and understand changes\nin your health over time' },
];

export const heroPrices = [
  { label: 'Individual', price: 'AED 1/ day', was: 'AED 2/ day' },
  { label: 'Family of up to 4 adults', price: 'AED 2/ day', was: 'AED 4/ day' },
];

export const steps = [
  { img: '/assets/step1.png', title: '50+ biomarkers, tested at home', desc: 'One comprehensive test covering key areas like heart, metabolism, hormones, liver, kidney and thyroid' },
  { img: '/assets/step2.png', title: 'Your results, made easy to understand', desc: 'See your biomarkers in a simple, easy-to-read app report, with clear ranges showing what’s healthy and what needs attention' },
  { img: '/assets/step3.png', title: 'A doctor who makes sense of it', desc: 'Talk through your results with a doctor who understands you and gives you clear, personalised guidance on what to do next' },
  { img: '/assets/step4.png', title: 'The right specialist when you need one', desc: 'If something needs a closer look, get connected with the right specialist for a more targeted plan' },
  { img: '/assets/step5.png', title: 'Keep track of your progress', desc: 'Test again to see how your health is changing, and let your doctor refine your plan based on your latest results' },
];

export type Biomarker = { name: string; desc: string };
export type HealthArea = { id: string; name: string; count: string; icon: string; tags: Biomarker[] };

export const areas: HealthArea[] = [
  { id: 'heart', name: 'Heart', count: '7 biomarkers', icon: 'bio-heart', tags: [
    { name: 'Total cholesterol', desc: 'The overall amount of cholesterol in your blood' },
    { name: 'LDL', desc: '“Bad” cholesterol that can build up in your arteries' },
    { name: 'HDL', desc: '“Good” cholesterol that helps clear fat from your blood' },
    { name: 'Non-HDL', desc: 'All the cholesterol types that can clog your arteries' },
    { name: 'Triglycerides', desc: 'Fats in your blood, often raised by sugar, alcohol and extra weight' },
    { name: 'ApoB', desc: 'Counts the particles that carry cholesterol into artery walls' },
    { name: 'Lipoprotein(a)', desc: 'An inherited type of cholesterol linked to heart disease' },
  ] },
  { id: 'diabetes', name: 'Diabetes health', count: '3 biomarkers', icon: 'bio-glucose', tags: [
    { name: 'HbA1c', desc: 'Measures average blood sugar over the past 2–3 months' },
    { name: 'Fasting glucose', desc: 'Measures blood sugar levels after an overnight fast' },
    { name: 'Fasting insulin', desc: 'Measures insulin levels after an overnight fast' },
  ] },
  { id: 'kidney', name: 'Kidney ', count: '5 biomarkers', icon: 'bio-kidney', tags: [
    { name: 'Creatinine', desc: 'A waste product your kidneys filter out of your blood' },
    { name: 'Urea (BUN)', desc: 'Waste from protein breakdown, cleared by your kidneys' },
    { name: 'eGFR', desc: 'An estimate of how well your kidneys are filtering' },
    { name: 'Urine albumin:creatinine (uACR)', desc: 'Checks for protein leaking into your urine, an early sign of kidney stress' },
    { name: 'Uric acid', desc: 'A waste product that can cause gout and kidney stones when high' },
  ] },
  { id: 'liver', name: 'Liver', count: '7 biomarkers', icon: 'bio-liver', tags: [
    { name: 'ALT', desc: 'A liver enzyme that rises when liver cells are stressed' },
    { name: 'AST', desc: 'An enzyme from the liver and muscles that rises with damage' },
    { name: 'ALP', desc: 'An enzyme linked to the liver, bile ducts and bones' },
    { name: 'GGT', desc: 'A liver enzyme often raised by alcohol or fatty liver' },
    { name: 'Total bilirubin', desc: 'A yellow pigment your liver clears from old red blood cells' },
    { name: 'Albumin', desc: 'The main protein your liver makes, a sign of liver health and nutrition' },
    { name: 'Total protein', desc: 'All the protein in your blood, including albumin and antibodies' },
  ] },
  { id: 'thyroid', name: 'Thyroid', count: '4 biomarkers', icon: 'bio-thyroid', tags: [
    { name: 'TSH', desc: 'The signal your brain sends to tell your thyroid how hard to work' },
    { name: 'Free T4', desc: 'The main hormone your thyroid makes' },
    { name: 'Free T3', desc: 'The active thyroid hormone that drives your energy and metabolism' },
    { name: 'TPO antibodies', desc: 'Show if your immune system is attacking your thyroid' },
  ] },
  { id: 'hormones', name: 'Hormones', count: '4 biomarkers', icon: 'bio-hormones', tags: [
    { name: 'Total testosterone', desc: 'A key hormone for energy, muscle, mood and sex drive' },
    { name: 'SHBG', desc: 'A protein that controls how much of your sex hormones your body can use' },
    { name: 'DHEA-S', desc: 'A hormone from your adrenal glands that your body uses to make sex hormones' },
    { name: 'Morning cortisol', desc: 'Your main stress hormone, measured when it naturally peaks' },
  ] },
  { id: 'blood', name: 'Inflammation & blood', count: '7 biomarkers', icon: 'bio-blood', tags: [
    { name: 'hs-CRP', desc: 'Picks up low-level inflammation linked to heart disease' },
    { name: 'Homocysteine', desc: 'An amino acid that can harm blood vessels when high' },
    { name: 'Full blood count (WBC + differential)', desc: 'Counts your white blood cells, which fight infection' },
    { name: 'Hemoglobin', desc: 'The protein in red blood cells that carries oxygen' },
    { name: 'Hematocrit', desc: 'The share of your blood made up of red blood cells' },
    { name: 'Platelets', desc: 'Cells that help your blood clot' },
    { name: 'ESR', desc: 'A general test for inflammation in your body' },
  ] },
  { id: 'nutrients', name: 'Nutrients & vitamins', count: '11 biomarkers', icon: 'bio-nutrients', tags: [
    { name: 'Vitamin D', desc: 'Supports strong bones, immunity and mood' },
    { name: 'Vitamin B12', desc: 'Needed for energy, nerves and making red blood cells' },
    { name: 'Folate', desc: 'A B vitamin that helps your body make new cells' },
    { name: 'Ferritin', desc: 'Shows how much iron your body has stored' },
    { name: 'Iron', desc: 'The iron in your blood right now, used to carry oxygen' },
    { name: 'Transferrin saturation', desc: 'How much of your blood’s iron-carrying capacity is in use' },
    { name: 'Magnesium', desc: 'A mineral for muscles, nerves, sleep and heart rhythm' },
    { name: 'Calcium', desc: 'Keeps your bones, muscles and nerves working' },
    { name: 'Phosphorus', desc: 'Works with calcium to build bones and make energy' },
    { name: 'Sodium', desc: 'Balances fluid in your body and supports your nerves' },
    { name: 'Potassium', desc: 'Keeps your heartbeat and muscles working properly' },
  ] },
];

export const conditionsA = [
  { title: 'Heart disease', desc: 'Early signs of cholesterol and artery problems' },
  { title: 'Type 2 diabetes', desc: 'Rising blood sugar and insulin resistance, years before diagnosis' },
  { title: 'Fatty liver', desc: 'Liver stress linked to diet, weight and alcohol' },
  { title: 'Kidney disease', desc: 'Changes in how well your kidneys filter' },
];
export const conditionsB = [
  { title: 'Thyroid disorders', desc: 'An under- or overactive thyroid affecting energy and weight' },
  { title: 'Chronic inflammation', desc: 'Low-grade inflammation linked to many long-term conditions' },
  { title: 'Anaemia and deficiencies', desc: 'Low iron and vitamins behind fatigue and poor recovery' },
  { title: 'Hormone imbalance', desc: 'Shifts that affect energy, mood, sleep and metabolism' },
];

export const doctors = [
  { name: 'Dr. Mehryar Andacheh', role: 'GP certified, DHA licensed', exp: '10+ years of experience', img: '/assets/doc-1.png', w: 416, h: 398 },
  { name: 'Danya Taha', role: 'Nutrionist, DHA licensed', exp: '4+ years of experience', img: '/assets/doc-2.png', w: 374, h: 398 },
  { name: 'Dr. Rana Ahmed', role: 'DHA licensed', exp: '18+ years of experience', img: '/assets/doc-3.png', w: 416, h: 398 },
  { name: 'Dr. Azza Elhadi', role: 'DHA licensed', exp: '7+ years of experience', img: '/assets/doc-4.png', w: 416, h: 398 },
  { name: 'Dr. Anas Abdul', role: 'DHA licensed', exp: '3+ years of experience', img: '/assets/doc-5.png', w: 416, h: 400 },
];

export const plans = [
  { name: 'Gold Individual', sub: 'For you', amount: 'AED 1', badgeIcon: '/assets/icons/mug-g.svg', badge: 'Less than a cup of karak chai', billed: 'Billed annually at AED 365',
    features: ['50+ biomarkers, tested through the year', 'Your own ongoing health plan', 'Doctor review of every result'], starBoxW: 194, star: '/assets/icons/star-1.svg' },
  { name: 'Gold Family', sub: 'Up to 4 members above 18+ ', amount: 'AED 2', badgeIcon: '/assets/icons/badge-percent-g.svg', badge: 'Less than AED 0.50/ per member', billed: 'Billed annually at AED 730',
    features: ['Everything in Individual, for each member', 'Separate results and plan for every person', 'One subscription, managed by you'], starBoxW: 204, star: '/assets/icons/star-2.svg' },
];

export const faqs: [string, string][] = [
  ['Are the tests covered by my insurance?',
    'Gold is a subscription for proactive health monitoring, with testing included as part of your plan. Coverage under your existing insurance depends on your policy, so Gold offers a separate way to access the tests included in your subscription.'],
  ['Is Gold different from my insurance or annual health check?',
    'Insurance helps cover eligible medical care, while an annual health check gives you a snapshot of your health. Gold brings regular biomarker testing, easy-to-understand results and doctor-led guidance together to help you track changes over time.'],
  ['Are medicines and treatment included in my Gold plan?',
    "Gold includes testing and doctor-led guidance to help you understand your health. Any medication, treatment or additional specialist services included in your subscription will depend on the plan's coverage."],
  ['What happens after I get my results?',
    'Your results are presented in an easy-to-read report in the app. A doctor reviews your results with you, explains what needs attention and helps you understand the next steps.'],
  ['What if my results show a potential health risk?',
    'Your doctor will help you understand your results and recommend the next steps. If a closer assessment is needed, you can be connected with the appropriate specialist for further guidance.'],
];
export const FAQ_DEFAULT_OPEN = 3;

export const planOptions = [
  { id: 'individual', label: 'Individual', price: 'AED 1/day', billed: 'Billed annually at AED 365' },
  { id: 'family', label: 'Family', price: 'AED 2/day', billed: 'Billed annually at AED 730' },
] as const;

export const SUBMIT_ERROR = "We couldn't add you to the waitlist. Please try again.";
