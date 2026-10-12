'use client';

import { useState } from 'react';
import { TOTAL_BIOMARKERS, areas } from '@/lib/content';
import { Icon } from '../Icon';

const ease = 'cubic-bezier(0.2,0.8,0.2,1)';

export function Biomarkers() {
  // Heart is open by default; at most one area is open at a time.
  const [openId, setOpenId] = useState<string | null>('heart');

  return (
    <section data-reveal="section" className="bg-white px-4 py-12 md:bg-surface md:px-(--side) md:py-28">
      <div className="flex flex-col gap-6 md:mx-auto md:grid md:max-w-[1280px] md:grid-cols-1 md:items-start md:gap-8 split:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] split:gap-20">
        <div className="split:sticky split:top-12">
          <h2 className="m-0 text-2xl leading-[1.25] font-medium tracking-[-0.02em] whitespace-pre-wrap text-ink md:text-[40px] md:leading-[1.15] md:tracking-[-0.025em] md:text-balance">
            {`We test ${TOTAL_BIOMARKERS} biomarkers \nacross 9 health areas`}
          </h2>
        </div>
        <div
          className="flex flex-col md:rounded-[20px] md:bg-white md:px-8 md:py-2 md:shadow-[inset_0_0_0_1px_rgb(235,235,235)]"
          data-testid="biomarkers"
        >
          {areas.map((a, i) => {
            const open = openId === a.id;
            return (
              <div key={a.id} className="flex flex-col">
                <div className="flex flex-col py-3.5 md:py-5">
                  <button
                    type="button"
                    id={`area-${a.id}`}
                    aria-expanded={open}
                    aria-controls={`area-panel-${a.id}`}
                    onClick={() => setOpenId(open ? null : a.id)}
                    className="flex min-h-11 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left md:min-h-12 md:gap-4"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,rgb(0,0,2)_0%,rgb(64,40,0)_52.43%)] md:size-12 md:rounded-xl">
                      <Icon src={`/assets/icons/${a.icon}-fill.svg`} w={26} h={26} sized={false} className="size-6 md:size-[26px]" />
                    </div>
                    <div className="flex flex-1 flex-col items-start gap-1">
                      <span className="text-lg leading-[1.2] font-medium whitespace-nowrap text-black md:text-[20px] md:whitespace-normal">{a.name}</span>
                      <span className="text-[13px] leading-4 font-normal whitespace-nowrap text-mid md:text-[14px] md:leading-[18px] md:whitespace-normal">{a.count}</span>
                    </div>
                    <div
                      className="relative size-5 shrink-0 md:flex md:size-6 md:items-center md:justify-center"
                      style={{ transition: `transform 0.32s ${ease}`, transform: `rotate(${open ? 180 : 0}deg)` }}
                    >
                      <Icon
                        src="/assets/icons/chevron-down-k.svg"
                        w={13}
                        h={7}
                        sized={false}
                        className="absolute top-[6.839px] left-[4.411px] h-[6.078px] w-[11.178px] md:static md:h-[7px] md:w-[13px]"
                      />
                    </div>
                  </button>
                  <div
                    id={`area-panel-${a.id}`}
                    role="region"
                    aria-labelledby={`area-${a.id}`}
                    aria-hidden={!open}
                    inert={!open}
                    className="grid"
                    style={{
                      gridTemplateRows: open ? '1fr' : '0fr',
                      opacity: open ? 1 : 0,
                      transition: `grid-template-rows 0.36s ${ease}, opacity 0.28s ease`,
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      {/* Full width (no indent under the name), on mobile and desktop. */}
                      <div
                        className="flex flex-col gap-2 pt-4 md:gap-2.5 md:pt-5"
                        style={{ transition: `transform 0.36s ${ease}`, transform: `translateY(${open ? 0 : -6}px)` }}
                      >
                        {a.tags.map((t) => (
                          <div key={t.name} className="flex flex-col justify-center gap-1.5 rounded-lg bg-surface p-3 md:rounded-[10px] md:px-4 md:py-3.5">
                            <span className="text-[15px] leading-5 font-semibold text-black md:text-[16px] md:leading-[22px]">{t.name}</span>
                            <span className="text-sm leading-[21px] font-normal text-pretty text-mid">{t.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {i < areas.length - 1 && <div className="h-px bg-line" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
