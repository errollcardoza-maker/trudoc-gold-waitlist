import Image from 'next/image';
import { steps } from '@/lib/content';

export function HowItWorks() {
  return (
    // Mobile: curved sheet that overlaps the hero by 32px, with a gold hairline and glow above its edge.
    <div className="relative z-[1] -mt-8 rounded-t-[28px] bg-white shadow-[0_-1px_0_0_rgba(226,166,49,0.45),0_-20px_48px_-10px_rgba(226,166,49,0.35)] md:static md:z-auto md:mt-0 md:rounded-none md:shadow-none">
      <section data-reveal="section" className="rounded-t-[28px] bg-white px-4 py-12 md:rounded-none md:px-(--side) md:py-28">
        <div className="flex flex-col gap-6 md:mx-auto md:max-w-[1280px] md:gap-12">
          <h2 className="m-0 text-2xl leading-[1.25] font-medium tracking-[-0.02em] whitespace-pre-wrap text-ink md:text-[40px] md:leading-[1.15] md:tracking-[-0.025em]">
            <span className="text-muted">How it works?</span>
            {'\nComplete health picture'}
          </h2>
          <div className="flex flex-col gap-8 md:grid md:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] md:gap-x-8 md:gap-y-12">
            {steps.map((s) => (
              <div key={s.title} className="flex flex-col gap-4 md:gap-5">
                <div className="relative aspect-[343/200] w-full">
                  {/* PNGs carry their own shadow/margin, hence the oversize box. */}
                  <div className="absolute top-[-1.5%] left-[-2.04%] h-[107%] w-[104.08%]">
                    <Image
                      src={s.img}
                      alt={s.title}
                      fill
                      sizes="(max-width: 480px) calc(104vw - 33px), (max-width: 767px) 466px, 420px"
                      className="object-fill"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:gap-1.5">
                  <span className="text-lg leading-[1.4] font-medium text-ink md:text-[20px] md:leading-[1.35]">{s.title}</span>
                  <span className="text-sm leading-[1.4] font-normal text-body md:text-[16px] md:leading-[1.5] md:text-pretty">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
