import Image from 'next/image';
import { conditionsA, conditionsB } from '@/lib/content';

const BG = '/figma/assets/b4a3952a8276d4d7.png';
const overlay = 'absolute inset-0 bg-[linear-gradient(0deg,rgba(7,4,1,0.2)_0%,rgba(10,6,1,0.8)_100%)]';

function MobileCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="relative flex min-h-[113px] w-[168px] shrink-0 flex-col gap-1.5 overflow-hidden rounded-xl bg-surface p-3">
      <div className="absolute top-[-112px] left-[-5px] h-[288px] w-[178px]">
        <Image src={BG} alt="" fill sizes="178px" className="object-cover" />
      </div>
      <div className={overlay} />
      <span className="relative text-sm leading-[1.2] font-medium text-white">{title}</span>
      <span className="relative text-xs leading-[1.4] font-normal text-pretty text-white/70">{desc}</span>
    </div>
  );
}

function DesktopCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="relative flex min-h-[168px] flex-col gap-2 overflow-hidden rounded-2xl bg-[rgb(30,22,10)] p-5">
      <div className="absolute -inset-x-2.5 -inset-y-10">
        <Image src={BG} alt="" fill sizes="(min-width: 1101px) 20vw, 50vw" className="object-cover" />
      </div>
      <div className={overlay} />
      <span className="relative text-[18px] leading-[1.25] font-medium text-white">{title}</span>
      <span className="relative text-[15px] leading-[1.45] font-normal text-pretty text-white/75">{desc}</span>
    </div>
  );
}

export function Conditions() {
  return (
    <section data-reveal="section" className="overflow-hidden bg-white px-4 py-12 md:px-(--side) md:py-28">
      <div className="flex flex-col gap-6 md:mx-auto md:max-w-[1280px] md:gap-12">
        <div className="flex flex-col gap-2 md:gap-3">
          <h2 className="m-0 text-2xl leading-[1.25] font-medium tracking-[-0.02em] text-black md:text-[40px] md:leading-[1.15] md:tracking-[-0.025em] md:text-balance md:text-ink">
            Track the signs before they become a bigger problem
          </h2>
          <p className="m-0 text-sm leading-[1.4] font-normal text-mid md:max-w-[560px] md:text-[18px] md:leading-[1.5] md:text-pretty md:text-body">
            See the health markers linked to common chronic conditions, so you can spot changes early and take action sooner
          </p>
        </div>

        {/* Mobile: two horizontally scrolling rows */}
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:hidden" data-testid="conditions-scroller">
          <div className="flex w-max flex-col gap-4">
            <div className="flex gap-2">
              {conditionsA.map((c) => <MobileCard key={c.title} {...c} />)}
            </div>
            <div className="flex gap-2">
              {conditionsB.map((c) => <MobileCard key={c.title} {...c} />)}
            </div>
          </div>
        </div>

        {/* Desktop: 10 cards as 5 × 2 from 1101px; 2 columns below. */}
        <div className="hidden gap-4 md:grid md:grid-cols-2 split:grid-cols-5" data-testid="conditions-grid">
          {[...conditionsA, ...conditionsB].map((c) => <DesktopCard key={c.title} {...c} />)}
        </div>
      </div>
    </section>
  );
}
