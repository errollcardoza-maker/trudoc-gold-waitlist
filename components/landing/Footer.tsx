import type { CSSProperties } from 'react';
import { Icon } from '../Icon';

const gradient = 'bg-[linear-gradient(180deg,rgb(0,0,2)_0%,rgb(24,15,0)_52.43%)]';
const links = [
  { href: 'tel:800878362', label: '800 878 362' },
  { href: 'mailto:info@trudocgroup.com', label: 'info@trudocgroup.com' },
];

function Wordmark({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/icons/wordmark-footer-w.svg"
      alt="TruDoc"
      width={381}
      height={83}
      loading="lazy"
      className={className}
      style={{ aspectRatio: '381.308 / 82.628', ...style }}
    />
  );
}

/** < 768px. Unchanged from the mobile prototype. */
function MobileFooter() {
  return (
    <>
      <footer data-reveal="section" className={`relative flex h-[364px] flex-col gap-6 overflow-hidden px-4 pt-20 pb-12 md:hidden ${gradient}`}>
        <Icon
          data-reveal="glow"
          src="/assets/icons/star-1.svg"
          w={549}
          h={549}
          className="pointer-events-none absolute top-[164px] left-1/2 ml-[-274.5px] max-w-none"
          // Inline so the reveal rules (which set `filter`) can't override the glow blur.
          style={{ filter: 'blur(10px)' }}
        />
        <div className="relative flex flex-col gap-3">
          <span className="text-sm leading-[1.4] font-normal text-white">Contact</span>
          <div className="flex flex-col gap-2 text-sm leading-[1.4] font-normal text-white/70">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-white/70">{l.label}</a>
            ))}
            <span>
              Office 701, Bay Square, Building 1,
              <br />
              Business Bay, Dubai, UAE
            </span>
          </div>
        </div>
        <Wordmark className="absolute top-[268px] left-[-3px] block h-auto w-[calc(100%+6.308px)] max-w-none" />
      </footer>
      {/* Spacer so the fixed CTA never covers content and no white shows beneath it. */}
      <div aria-hidden="true" className="h-[calc(124px+env(safe-area-inset-bottom))] bg-[rgb(24,15,0)] md:hidden" />
    </>
  );
}

/** ≥ 768px. */
function DesktopFooter() {
  return (
    <>
      <footer data-reveal="section" className={`relative hidden overflow-hidden px-(--side) pt-20 md:block ${gradient}`}>
        <Icon
          data-reveal="glow"
          src="/assets/icons/star-1.svg"
          w={900}
          h={900}
          className="pointer-events-none absolute top-[180px] left-1/2 ml-[-450px] max-w-none"
          style={{ filter: 'blur(14px)' }}
        />
        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-4">
          <span className="text-[16px] leading-[1.4] font-medium text-white">Contact</span>
          <div className="flex flex-wrap gap-12 text-[16px] leading-[1.5] font-normal text-white/70">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-white/70">{l.label}</a>
            ))}
            <span>Office 701, Bay Square, Building 1, Business Bay, Dubai, UAE</span>
          </div>
        </div>
        <div className="relative mx-auto mt-16 h-[220px] w-full max-w-[1280px] overflow-hidden">
          <Wordmark className="absolute top-0 left-0 block h-auto w-full max-w-none" />
        </div>
      </footer>
      {/* Spacer so the floating CTA bar never covers content. */}
      <div aria-hidden="true" className="hidden h-32 bg-[rgb(24,15,0)] md:block" />
    </>
  );
}

export function Footer() {
  return (
    <>
      <MobileFooter />
      <DesktopFooter />
    </>
  );
}
