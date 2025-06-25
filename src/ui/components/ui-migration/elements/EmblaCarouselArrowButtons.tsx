import React, {
    type ComponentPropsWithRef,
    useCallback,
    useEffect,
    useState
} from 'react'
import { type EmblaCarouselType } from 'embla-carousel'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type UsePrevNextButtonsType = {
    prevBtnDisabled: boolean
    nextBtnDisabled: boolean
    onPrevButtonClick: () => void
    onNextButtonClick: () => void
}

export const usePrevNextButtons = (
    emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollPrev()
    }, [emblaApi])

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollNext()
    }, [emblaApi])

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev())
        setNextBtnDisabled(!emblaApi.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        onSelect(emblaApi)
        emblaApi.on('reInit', onSelect).on('select', onSelect)
    }, [emblaApi, onSelect])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    }
}

type PropType = ComponentPropsWithRef<'button'>

const buttonClass = `
  p-2 rounded-md border border-gray-300 
  flex items-center justify-center 
  text-white bg-[#273245] 
  hover:bg-[#1e2733] 
  disabled:bg-white disabled:text-gray-700 
  disabled:opacity-40 disabled:cursor-not-allowed 
  transition-colors duration-200 
  focus:outline-none focus:ring-2 focus:ring-gray-400
`



export const PrevButton: React.FC<PropType> = (props) => {
    const { children, className = '', ...restProps } = props

    return (
        <button
            type="button"
            className={`${buttonClass} ${className}`}
            {...restProps}
        >
            <ChevronLeft />
            {children}
        </button>
    )
}

export const NextButton: React.FC<PropType> = (props) => {
    const { children, className = '', ...restProps } = props

    return (
        <button
            type="button"
            className={`${buttonClass} ${className}`}
            {...restProps}
        >
            <ChevronRight />
            {children}
        </button>
    )
}
