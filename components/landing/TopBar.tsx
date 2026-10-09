import Image from 'next/image';
import { Icon } from '../Icon';

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-center bg-[rgb(1,1,2)] pt-[21px] pr-4 pb-[19px] pl-4 md:block md:h-auto md:px-(--side) md:py-0">
      <div className="flex items-center justify-center md:mx-auto md:h-[72px] md:w-full md:max-w-[1280px] md:justify-start">
        <div data-reveal="hero" data-reveal-delay="0" className="flex items-center gap-[9px] md:gap-2.5">
          <Image
            src="/assets/logo.png"
            alt="TruDoc"
            width={40}
            height={40}
            loading="eager"
            fetchPriority="high"
            className="block size-[36.923px] rounded-full object-cover md:size-10"
          />
          <div className="flex items-center gap-1 md:gap-1.5">
            <Icon
              src="/assets/icons/wordmark-w.svg"
              alt="TruDoc"
              w={76}
              h={16.46}
              sized={false}
              loading="eager"
              className="h-[14.746px] w-[68.066px] md:h-[16.46px] md:w-[76px]"
            />
            <div className="flex h-[27px] items-center justify-center rounded-[6px] px-1 shadow-[inset_0_0_0_1px_rgb(176,123,48)] md:h-7 md:px-[5px]">
              <span className="block translate-y-[0.5px] text-[17.85px] leading-none font-bold whitespace-nowrap text-[rgb(230,175,84)] md:text-[18px]">
                Gold
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
