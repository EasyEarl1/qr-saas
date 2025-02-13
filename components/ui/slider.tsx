"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center py-4",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track 
      className="relative h-[2px] w-full grow overflow-hidden bg-[#E5E5E5]"
    >
      <SliderPrimitive.Range 
        className="absolute h-full bg-[#007BFF]" 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="relative block h-[16px] w-[16px] overflow-hidden rounded-[50%] bg-[#007BFF] focus:outline-none focus-visible:ring-0 cursor-pointer transition-colors" 
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider } 