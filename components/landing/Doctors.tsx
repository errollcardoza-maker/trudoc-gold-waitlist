import Image from 'next/image';
import { doctors } from '@/lib/content';
import { Icon } from '../Icon';

const avatars = ['/assets/avatar-1.png', '/assets/avatar-2.png', '/assets/avatar-3.png', '/assets/avatar-4.png'];

function Laurel({ flip, h }: { flip?: boolean; h: number }) {
  return (
    <Icon
      src="/assets/icons/laurel-t.svg"
      w={40}
      h={66}
      sized={false}
      // Mobile height varies by a hair between the two badges in the prototype, hence the variable.
      className="h-(--mh) w-[22.113px] md:h-[66px] md:w-10 md:flex-none"
      style={{ ...(flip ? { transform: 'scaleX(-1)' } : {}), ['--mh' as string]: `${h}px` }}
    />
  );
}

export function Doctors() {
  return (
    <section data-reveal="section" className="overflow-hidden px-4 py-12 md:border-t md:border-[rgb(240,240,240)] md:bg-white md:px-(--side) md:py-28">
      <div className="flex flex-col gap-6 md:mx-auto md:max-w-[1280px] md:gap-12">
        {/* Heading, subtitle and trust badges stack on both layouts (desktop: one-line title). */}
        <div className="contents md:flex md:flex-col md:items-start md:gap-7">
          <div className="flex flex-col gap-2 md:min-w-0 md:gap-3">
            <h2 className="m-0 text-2xl leading-[1.25] font-medium tracking-[-0.02em] whitespace-pre-wrap text-black md:text-[40px] md:leading-[1.15] md:tracking-[-0.025em] md:whitespace-nowrap md:text-ink">
              {'Guided by doctors. \nProven by people.'}
            </h2>
            <p className="m-0 text-sm leading-5 font-normal whitespace-pre-wrap text-body md:text-[18px] md:leading-[1.5] md:whitespace-normal md:text-pretty">
              {'Real experiences from people guided by \nDHA & DoH licensed TruDoc doctors'}
            </p>
          </div>

          <div className="flex h-[43px] items-center justify-start gap-6 md:h-auto md:flex-none md:flex-wrap md:gap-x-10 md:gap-y-6">
            <div className="flex shrink-0 items-center md:gap-1">
              <Laurel h={40.005} />
              <div className="flex w-[98.789px] flex-col items-center gap-0.5 md:w-[132px] md:justify-center md:gap-1.5">
                <span
                  className="text-base leading-6 font-medium text-body md:text-[24px] md:leading-9"
                  style={{ fontFamily: "'Google Sans Flex', 'Google Sans', var(--font-figtree), sans-serif" }}
                >
                  Google
                </span>
                <span className="text-center text-sm leading-[1.2] font-normal text-body md:text-[18px]">4.5 Rating</span>
              </div>
              <Laurel h={40.005} flip />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Laurel h={40.004} />
              <div className="flex w-[98.789px] flex-col items-center gap-0.5 md:w-[132px] md:justify-center md:gap-1.5">
                <div className="flex h-6 items-center md:h-9">
                  {avatars.map((src, i) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={36}
                      height={36}
                      className={`block size-6 flex-none rounded-full object-cover shadow-[0_0_0_0.75px_rgb(235,235,235)] md:size-9 md:shadow-[0_0_0_1px_rgb(235,235,235)] ${i ? '-ml-1.5 md:-ml-[9px]' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-center text-sm leading-[1.2] font-normal text-body md:text-[18px]">12k+ patients</span>
              </div>
              <Laurel h={40.004} flip />
            </div>
          </div>
        </div>

        <div
          role="region"
          aria-label="Our doctors"
          tabIndex={0}
          className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-[calc(-1*var(--side))] md:snap-x md:snap-mandatory md:scroll-px-(--side) md:px-(--side) md:pb-2"
          data-testid="doctors-scroller"
        >
          <div className="flex w-max gap-4 md:gap-5">
            {doctors.map((d) => (
              <div
                key={d.name}
                className="flex h-[305px] w-[240px] shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-surface px-4 pt-4 md:h-[380px] md:w-[280px] md:snap-start md:rounded-2xl md:px-5 md:pt-5"
              >
                <div className="flex flex-col gap-1 md:gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm leading-5 font-semibold text-ink md:text-[16px] md:leading-[22px]">{d.name}</span>
                    <span className="text-xs leading-4 font-normal whitespace-nowrap text-[rgb(65,57,92)] md:text-[14px] md:leading-5 md:whitespace-normal">
                      {d.role}
                    </span>
                  </div>
                </div>
                <div className="-mx-4 flex h-[199px] items-end justify-center md:-mx-5 md:h-[250px]">
                  <Image
                    src={d.img}
                    alt={d.name}
                    width={d.w}
                    height={d.h}
                    sizes="(min-width: 768px) 262px, 210px"
                    className="block h-[199px] w-auto max-w-none mix-blend-multiply md:h-[250px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
