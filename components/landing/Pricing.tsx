import { plans } from '@/lib/content';
import { Icon } from '../Icon';

export function Pricing() {
  return (
    <section data-reveal="section" className="bg-surface px-4 py-12 md:px-(--side) md:py-28">
      <div className="flex flex-col gap-6 md:mx-auto md:max-w-[1280px] md:items-center md:gap-12">
        <div className="flex flex-col gap-2 md:items-center md:gap-3 md:text-center">
          <h2 className="m-0 text-2xl leading-[1.25] font-semibold tracking-[-0.02em] whitespace-pre-wrap text-black md:text-[40px] md:leading-[1.15] md:tracking-[-0.025em] md:whitespace-normal md:text-balance md:text-ink">
            {'Join now before the \nprices double'}
          </h2>
          <p className="m-0 text-sm leading-5 font-normal text-body md:max-w-[560px] md:text-[18px] md:leading-[1.5] md:text-balance">
            Only waitlist members get access to launch pricing when TruDoc Gold becomes available.
          </p>
        </div>
        {/* Mobile: one column of cards. Desktop: a plans grid (items stretch, so cards stay equal height). */}
        <div className="flex flex-col gap-4 md:contents">
          <div className="contents md:grid md:w-full md:max-w-[880px] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] md:gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className="relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgb(235,235,235),0_1px_2px_0_rgba(10,13,20,0.03)] md:gap-7 md:rounded-[20px] md:p-7"
              >
                <div className="relative flex flex-col gap-6 md:gap-7">
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <span className="text-base leading-[1.2] font-medium text-black md:text-[20px]">{p.name}</span>
                    <span className="text-xs leading-[1.2] font-normal tracking-[-0.02em] text-mid md:text-[14px] md:leading-[1.3] md:tracking-normal">{p.sub}</span>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:gap-2.5">
                    <div className="flex h-[34px] items-baseline leading-[1.2] font-semibold whitespace-nowrap text-black md:h-auto md:leading-[1.1]">
                      <span className="text-[28px] md:text-[40px] md:tracking-[-0.02em]">{p.amount}</span>
                      <span className="text-[16px] font-medium md:text-[18px]">/day</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <Icon src={p.badgeIcon} w={18} h={18} sized={false} className="size-4 shrink-0 md:size-[18px]" />
                      <span className="text-sm leading-[1.2] font-medium tracking-[-0.02em] whitespace-nowrap text-[rgb(134,102,29)] md:text-[15px] md:tracking-normal md:whitespace-normal">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-xs leading-[1.2] font-normal tracking-[-0.02em] text-mid md:text-[14px] md:leading-[1.3] md:tracking-normal">{p.billed}</span>
                  </div>
                </div>
                <div className="relative h-px bg-line" />
                <div className="relative flex flex-col gap-2 md:gap-3">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 md:gap-2.5">
                      <div className="flex h-[21px] w-5 shrink-0 items-center p-0.5 md:h-auto md:w-auto md:p-0">
                        <Icon src="/assets/icons/check-g.svg" w={16} h={11.55} />
                      </div>
                      <span className="text-sm leading-[1.5] font-normal text-black md:text-[16px]">{f}</span>
                    </div>
                  ))}
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-[196px] overflow-hidden" style={{ width: p.starBoxW }}>
                  <Icon src={p.star} w={514} h={514} className="absolute top-[-337px] left-[19.672px] max-w-none blur-[10px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
