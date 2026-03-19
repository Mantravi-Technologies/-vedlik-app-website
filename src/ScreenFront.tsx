import type { RefObject } from 'react'

interface ScreenFrontProps {
  article1Ref: RefObject<HTMLDivElement>
  article2Ref: RefObject<HTMLDivElement>
}

export default function ScreenFront({ article1Ref, article2Ref }: ScreenFrontProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#000] rounded-[2.25rem]">
      {/* Slide 1: Your front_1 screenshot */}
      <div
        ref={article1Ref}
        className="absolute inset-0 flex flex-col"
      >
        <img
          src="/images/front_1.png"
          alt="Vedlik app — article feed"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Slide 2: Your front_2 screenshot (starts hidden for swipe animation) */}
      <div
        ref={article2Ref}
        className="absolute inset-0 flex flex-col opacity-0 pointer-events-none"
        style={{ transform: 'translateY(100%)' }}
      >
        <img
          src="/images/front_2.png"
          alt="Vedlik app — second article"
          className="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  )
}
