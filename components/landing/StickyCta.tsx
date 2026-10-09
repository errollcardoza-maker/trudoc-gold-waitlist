import type { MouseEvent } from 'react';

/** < 768px: full-width sticky CTA from the mobile prototype. */
export function StickyCta({ onJoin }: { onJoin: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-30 flex justify-center md:hidden">
      <div className="pointer-events-auto w-full max-w-[480px] px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="relative flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[linear-gradient(90deg,#151516_0%,#292217_100%)] px-2 pt-3 pb-2 shadow-[0_16px_32px_-12px_rgba(14,18,27,0.1)]">
          <div aria-hidden="true" className="grad-ring bg-[linear-gradient(180deg,#53360C_0%,rgba(83,54,12,0)_100%)]" />
          <div className="relative flex items-baseline justify-center gap-1.5 self-stretch px-2 text-center leading-[1.2] whitespace-nowrap">
            <span className="text-[14px] font-semibold text-white">From AED 1/day</span>
            <span className="text-[12px] font-medium text-white/70">Limited-time launch price</span>
          </div>
          <button
            type="button"
            onClick={onJoin}
            data-testid="join-cta"
            className="relative m-0 flex h-[52px] cursor-pointer flex-row items-center justify-center gap-2 self-stretch overflow-hidden rounded-xl border-0 bg-gold px-5 py-3.5 shadow-[0_0_0_1px_#E2A631] active:opacity-90"
          >
            <span aria-hidden="true" className="pointer-events-none absolute top-[-1.6875px] left-[39.293px] h-[95.0185px] w-[6.95942px] origin-top-left rotate-[15.5935deg] bg-white/20" />
            <span aria-hidden="true" className="pointer-events-none absolute top-[-3.5352px] left-[51.0742px] h-[95.0185px] w-[14.9803px] origin-top-left rotate-[15.5935deg] bg-white/20" />
            <span aria-hidden="true" className="grad-ring bg-[linear-gradient(180deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)]" />
            <span className="relative text-sm leading-6 font-bold whitespace-nowrap text-[#15130F]">Join waitlist for free</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** ≥ 768px: floating bar from the web prototype. */
export function FloatingCta({ onJoin }: { onJoin: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-6 left-0 z-30 hidden justify-center px-6 md:flex">
      <div className="pointer-events-auto relative flex w-full max-w-[640px] items-center gap-5 overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#151516_0%,#292217_100%)] py-2.5 pr-2.5 pl-6 shadow-[0_20px_40px_-12px_rgba(14,18,27,0.35)]">
        <div aria-hidden="true" className="grad-ring bg-[linear-gradient(180deg,#53360C_0%,rgba(83,54,12,0)_100%)]" style={{ borderRadius: 16 }} />
        <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[16px] leading-[1.3] font-semibold whitespace-nowrap text-white">From AED 1/day</span>
          <span className="text-[13px] leading-[1.3] font-medium whitespace-nowrap text-white/70">Limited-time launch price</span>
        </div>
        <button
          type="button"
          onClick={onJoin}
          data-testid="join-cta-desktop"
          className="relative m-0 flex h-[52px] w-[280px] min-w-[220px] shrink cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 bg-gold shadow-[0_0_0_1px_#E2A631] hover:bg-[rgb(236,178,64)] active:scale-[0.98]"
        >
          <span aria-hidden="true" className="pointer-events-none absolute top-[-2px] left-[39px] h-[95px] w-[7px] origin-top-left rotate-[15.6deg] bg-white/20" />
          <span aria-hidden="true" className="pointer-events-none absolute top-[-2px] left-[52px] h-[95px] w-[7px] origin-top-left rotate-[15.6deg] bg-white/20" />
          <span className="relative text-[16px] leading-6 font-bold whitespace-nowrap text-[rgb(21,19,15)]">Join waitlist for free</span>
        </button>
      </div>
    </div>
  );
}
