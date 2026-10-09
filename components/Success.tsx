type Props = { firstName: string; phoneDisplay: string; variant?: 'screen' | 'modal' };

export function Success({ firstName, phoneDisplay, variant = 'screen' }: Props) {
  const modal = variant === 'modal';
  const Root = modal ? 'div' : 'main';
  return (
    <Root
      data-screen-label="03 You're on the waitlist"
      className={modal ? 'flex flex-col items-center px-6 pt-10 pb-14' : 'min-h-screen-d relative flex flex-col items-center bg-white'}
    >
      <div className={`flex w-full flex-col items-center ${modal ? '' : 'pt-[253px]'}`}>
        <div className="relative size-[83.006px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[rgb(196,240,205)] opacity-0"
            style={{ animation: 'tdRing 0.9s ease-out 0.45s both' }}
          />
          <div
            className="absolute inset-0 rounded-full bg-[rgb(196,240,205)] shadow-[0_0_0_10.845px_rgb(255,255,255)]"
            style={{ animation: 'tdPop 0.6s cubic-bezier(0.32,0.72,0,1) 0.1s both' }}
          >
            <svg
              viewBox="-4.15 -4.15 48.521 36.854"
              width="48.521"
              height="36.854"
              aria-hidden="true"
              className="absolute top-[23.075px] left-[17.243px] block overflow-visible"
            >
              <path
                d="M0 16.887 L11.667 28.5 L40.221 0"
                fill="none"
                stroke="rgb(47,160,98)"
                strokeWidth="8.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60"
                style={{ strokeDashoffset: 60, animation: 'tdDraw 0.45s cubic-bezier(0.65,0,0.35,1) 0.45s both' }}
              />
            </svg>
          </div>
        </div>
        <div
          className="mt-[46px] flex w-full max-w-[375px] flex-col items-stretch gap-2 px-4"
          style={{ animation: 'tdRise 0.5s cubic-bezier(0.32,0.72,0,1) 0.7s both' }}
        >
          <h1 className="m-0 text-center text-2xl leading-10 font-semibold break-words text-ink">
            You&apos;re on the waitlist {firstName}
          </h1>
          <span className="text-center text-sm leading-6 font-medium text-mid">
            We&apos;ll contact you on {phoneDisplay} as soon as TruDoc Gold launches
          </span>
        </div>
      </div>
      {!modal && (
        <>
          <div className="min-h-10 flex-1" />
          <span className="mb-9 w-[250px] text-center text-sm leading-6 font-medium text-muted">
            There&apos;s nothing else you need to do. You can close this window.
          </span>
        </>
      )}
    </Root>
  );
}
