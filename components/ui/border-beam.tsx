"use client"

import { cn } from "@/lib/utils"
import type { Transition } from "framer-motion"

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number
  /**
   * The duration of the border beam.
   */
  duration?: number
  /**
   * The delay of the border beam.
   */
  delay?: number
  /**
   * The color of the border beam from.
   */
  colorFrom?: string
  /**
   * The color of the border beam to.
   */
  colorTo?: string
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition
  /**
   * The class name of the border beam.
   */
  className?: string
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number
  /**
   * The border width of the beam.
   */
  borderWidth?: number
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  const uniqueId = `border-beam-${Math.random().toString(36).substr(2, 9)}`;
  const animationName = `rotate-${uniqueId}`;
  
  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          from {
            transform: rotate(${initialOffset}deg);
          }
          to {
            transform: rotate(${initialOffset + (reverse ? -360 : 360)}deg);
          }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
        style={
          {
            padding: `${borderWidth}px`,
          } as React.CSSProperties
        }
      >
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: `${borderWidth}px`,
            isolation: "isolate",
          }}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-[inherit]",
              className
            )}
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 60deg, ${colorFrom} 80deg, ${colorTo} 100deg, ${colorFrom} 120deg, transparent 140deg, transparent 360deg)`,
              transformOrigin: "center center",
              animation: `${animationName} ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              ...style,
            } as React.CSSProperties}
          />
        </div>
      </div>
    </>
  )
}
