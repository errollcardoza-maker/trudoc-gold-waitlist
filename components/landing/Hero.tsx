import Image from 'next/image';
import { chipsA, chipsB, heroFeatures, heroPrices } from '@/lib/content';
import { Icon } from '../Icon';

const fade = 'linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%)';
const chipsMask = 'linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)';
const humanMaskDesktop =
  'linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(180deg, #000 72%, transparent 100%)';

type Size = 'mobile' | 'desktop';

function ChipSet({ chips, size }: { chips: string[]; size: Size }) {
  return (
    <div className="flex shrink-0 items-center gap-[11.294px] pr-[11.294px]">
      {chips.map((c) =>
        size === 'mobile' ? (
          <div
            key={c}
            className="flex h-[23.708px] shrink-0 items-center justify-center rounded-full bg-white/20 px-[6.708px] py-[3.354px] shadow-[0_0_0_0.838px_rgba(255,255,255,0.5)]"
          >
            <span className="text-[15.0588px] leading-[16.941px] font-medium whitespace-nowrap text-white">{c}</span>
          </div>
        ) : (
          <div
            key={c}
            className="flex h-[30px] shrink-0 items-center justify-center rounded-full bg-white/20 px-2.5 py-1 shadow-[0_0_0_0.838px_rgba(255,255,255,0.5)]"
          >
            <span className="text-[16px] leading-5 font-medium whitespace-nowrap text-white">{c}</span>
          </div>
        ),
      )}
    </div>
  );
}

function Marquee({ chips, dir, size }: { chips: string[]; dir: 'l' | 'r'; size: Size }) {
  const row = size === 'mobile' ? 'h-[38.766px] py-[7.529px]' : 'h-[46px]';
  return (
    <div className={`flex items-center overflow-hidden ${row}`}>
      <div className={`flex w-max shrink-0 items-center ${dir === 'l' ? 'marquee-l' : 'marquee-r'} ${size === 'desktop' ? 'marquee-slow' : ''}`}>
        <ChipSet chips={chips} size={size} />
        <ChipSet chips={chips} size={size} />
      </div>
    </div>
  );
}

function Features({ size }: { size: Size }) {
  if (size === 'mobile') {
    return heroFeatures.map((f) => (
      <div key={f.title} className="flex items-start gap-4">
        <div className="flex size-9 shrink-0 items-center rounded-[200px] bg-[rgba(246,181,30,0.2)] p-2">
          <div className="size-5 p-0.5">
            <Icon src={f.icon} w={16} h={16} loading="eager" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-base leading-[22px] font-medium text-white">{f.title}</span>
          <span className="text-sm leading-5 font-normal whitespace-pre-line text-white/70">{f.desc}</span>
        </div>
      </div>
    ));
  }
  return heroFeatures.map((f) => (
    <div key={f.title} className="flex items-start gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(246,181,30,0.2)]">
        <Icon src={f.icon} w={20} h={20} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[18px] leading-[26px] font-medium text-white">{f.title}</span>
        {/* Desktop ignores the mobile line breaks in the copy. */}
        <span className="text-[16px] leading-6 font-normal text-white/70">{f.desc.replace(/\n/g, ' ')}</span>
      </div>
    </div>
  ));
}

/** < 768px. Unchanged from the mobile prototype. */
function MobileHero() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-[linear-gradient(180deg,rgb(0,0,2)_0%,rgb(24,15,0)_52.43%)] px-4 py-10 md:hidden">
      <div data-reveal="hero" data-reveal-delay="120" aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pointer-events-none absolute top-[90px] right-0 left-0 flex flex-col items-stretch gap-2 opacity-50">
          <Marquee chips={chipsA} dir="l" size="mobile" />
          <Marquee chips={chipsB} dir="r" size="mobile" />
        </div>
      </div>
      <Icon
        src="/assets/icons/hero-glow-c.svg"
        w={1193}
        h={1193}
        loading="eager"
        fetchPriority="high"
        className="pointer-events-none absolute top-[-630px] left-[-409px] max-w-none opacity-[0.04]"
      />

      <div className="relative flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div data-reveal="hero" data-reveal-delay="200" className="relative h-[157px] overflow-hidden">
            <Image
              src="/assets/human.png"
              alt=""
              width={394}
              height={189}
              loading="eager"
              fetchPriority="high"
              sizes="394px"
              className="pointer-events-none absolute top-[-14px] left-1/2 ml-[-197px] block h-[189px] w-[394px] max-w-none"
              style={{ WebkitMaskImage: fade, maskImage: fade }}
            />
            <div className="absolute top-[109px] right-0 left-0 h-12 bg-[linear-gradient(180deg,rgba(7,4,1,0)_0%,rgb(10,6,1)_100%)]" />
          </div>

          <div data-reveal="hero" data-reveal-delay="320" className="flex flex-col gap-2">
            <h1 className="m-0 max-w-[310px] text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-white">
              Make proactive healthcare simple.
            </h1>
          </div>

          <div data-reveal="hero" data-reveal-delay="420" className="flex flex-col gap-5">
            <Features size="mobile" />
          </div>

          <div data-reveal="hero" data-reveal-delay="520" className="flex items-stretch gap-3">
            {heroPrices.map((p) => (
              <div
                key={p.label}
                className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl bg-white/5 p-3 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)]"
              >
                <span className="text-xs leading-[1.2] font-medium text-white/70">{p.label}</span>
                <div className="flex flex-col gap-1">
                  <span className="text-base leading-[1.2] font-semibold whitespace-nowrap text-white">{p.price}</span>
                  <span className="text-xs leading-[1.2] font-medium whitespace-nowrap text-white/70 line-through">{p.was}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** ≥ 768px: two columns from 1001px, stacked (copy first) below. */
function DesktopHero() {
  return (
    <section className="relative hidden overflow-hidden bg-[linear-gradient(180deg,rgb(0,0,2)_0%,rgb(24,15,0)_70%)] px-(--side) pt-[88px] pb-[104px] md:block">
      <Icon
        src="/assets/icons/hero-glow-c.svg"
        w={1600}
        h={1600}
        className="pointer-events-none absolute top-[-700px] left-1/2 ml-[-200px] max-w-none opacity-5"
      />
      <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 duo:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] duo:gap-16">
        <div className="flex flex-col gap-10">
          <h1
            data-reveal="hero"
            data-reveal-delay="120"
            className="m-0 max-w-[560px] text-[clamp(40px,4.4vw,60px)] leading-[1.05] font-medium tracking-[-0.03em] text-balance text-white"
          >
            Make proactive healthcare simple.
          </h1>
          <div data-reveal="hero" data-reveal-delay="240" className="flex max-w-[520px] flex-col gap-6">
            <Features size="desktop" />
          </div>
          <div data-reveal="hero" data-reveal-delay="360" className="grid max-w-[520px] grid-cols-[1fr_1fr] gap-3">
            {heroPrices.map((p) => (
              <div
                key={p.label}
                className="flex flex-col gap-3.5 rounded-[14px] bg-white/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              >
                <span className="text-[14px] leading-[1.2] font-medium text-white/70">{p.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] leading-[1.2] font-semibold whitespace-nowrap text-white">{p.price}</span>
                  <span className="text-[14px] leading-[1.2] font-medium whitespace-nowrap text-white/70 line-through">{p.was}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-reveal="hero" data-reveal-delay="200" className="relative flex min-h-[420px] items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-[-80px] left-[-40px] flex -translate-y-1/2 flex-col gap-2.5 opacity-50"
            style={{ WebkitMaskImage: chipsMask, maskImage: chipsMask }}
          >
            <Marquee chips={chipsA} dir="l" size="desktop" />
            <Marquee chips={chipsB} dir="r" size="desktop" />
            <Marquee chips={chipsA} dir="l" size="desktop" />
          </div>
          {/* TODO: swap in a 2x human.png (≥1300px wide); the current asset is 656px and soft at this size. */}
          <Image
            src="/assets/human.png"
            alt=""
            width={656}
            height={314}
            sizes="(min-width: 1001px) 52vw, 128vw"
            className="relative mx-[-14%] block h-auto w-[128%] max-w-none"
            style={{
              WebkitMaskImage: humanMaskDesktop,
              maskImage: humanMaskDesktop,
              WebkitMaskComposite: 'source-in',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}
