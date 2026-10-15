'use client';

import { useState } from 'react';
import { FAQ_DEFAULT_OPEN, faqs } from '@/lib/content';
import { Icon } from '../Icon';

const ease = 'cubic-bezier(0.2,0.8,0.2,1)';

/** Renders **bold** spans in an answer. */
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function Faq() {
  // "What happens after I get my results?" is open by default; at most one item is open at a time.
  const [openIdx, setOpenIdx] = useState<number | null>(FAQ_DEFAULT_OPEN);

  return (
    // Mobile: curved sheet that overlaps the footer by 32px, with a gold hairline and glow below its edge.
    <div className="relative z-[1] -mb-8 rounded-b-[28px] bg-surface shadow-[0_1px_0_0_rgba(226,166,49,0.45),0_20px_48px_-10px_rgba(226,166,49,0.35)] md:static md:z-auto md:mb-0 md:rounded-none md:bg-transparent md:shadow-none">
      <section data-reveal="section" className="rounded-b-[28px] bg-surface px-4 py-12 md:rounded-none md:bg-white md:px-(--side) md:py-28">
        <div className="flex flex-col gap-6 md:mx-auto md:grid md:max-w-[1280px] md:grid-cols-1 md:items-start md:gap-8 split:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] split:gap-20">
          <h2 className="m-0 text-2xl leading-[1.25] font-semibold tracking-[-0.02em] text-black md:text-[40px] md:leading-[1.15] md:tracking-[-0.025em] md:text-balance md:text-ink">FAQs</h2>
          <div className="flex flex-col gap-4 md:gap-0" data-testid="faq">
            {faqs.map(([q, a], i) => {
              const open = openIdx === i;
              return (
                <div key={q} className="flex flex-col gap-4 md:gap-0">
                  {/* The whole row (question, answer, icon) is tappable, as in the prototype; the
                      question is the keyboard/AT control and its clicks bubble up to this handler. */}
                  <div onClick={() => setOpenIdx(open ? null : i)} className="flex cursor-pointer items-start gap-3 text-left md:gap-4 md:py-6">
                    <div className="flex flex-1 flex-col">
                      <button
                        type="button"
                        id={`faq-${i}`}
                        aria-expanded={open}
                        aria-controls={`faq-panel-${i}`}
                        className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm leading-[1.5] font-medium text-[rgb(65,57,92)] md:text-[18px] md:leading-[1.45] md:text-ink"
                      >
                        {q}
                      </button>
                      <div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-${i}`}
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
                          <span
                            className="block pt-1 text-[13px] leading-[1.5] font-normal text-body md:max-w-[640px] md:pt-2.5 md:text-[16px] md:leading-[1.6] md:text-pretty"
                            style={{ transition: `transform 0.36s ${ease}`, transform: `translateY(${open ? 0 : -6}px)` }}
                          >
                            {withBold(a)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div aria-hidden="true" className="mt-[0.5px] flex size-5 shrink-0 items-center justify-center p-0.5 md:mt-0.5 md:size-6 md:p-0">
                      <Icon
                        src="/assets/icons/plus-n.svg"
                        w={18}
                        h={18}
                        sized={false}
                        className="size-4 md:size-[18px]"
                        style={{ transition: `transform 0.32s ${ease}`, transform: `rotate(${open ? 45 : 0}deg)` }}
                      />
                    </div>
                  </div>
                  {i < faqs.length - 1 && <div className="h-px bg-line" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
