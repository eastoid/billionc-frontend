import {site} from "$lib/code/state/site.svelte"
import {rap} from "$lib/code/util/util.svelte"

type Breakpoint = '2xl' | '3xl' | 'xl' | '2lg' | 'lg' | 'md' | 'sm' | 'xs' | '2xs' | 'default'

type Breakpoints = {
    [key: string]: { min?: number; max?: number; order: number; type: 1|2 }
}

// Must be in correct order
const screens: Breakpoints = {
    '3xl': { min: 2561, order: 2, type: 2 },
    '2xl': { min: 2101, order: 1, type: 2 },

    '2xs': { max: 440, order: 7, type: 1 },
    'xs': { max: 575, order: 6, type: 1 },
    'sm': { max: 767, order: 5, type: 1 },
    'md': { max: 1023, order: 4, type: 1 },
    'lg': { max: 1279, order: 3, type: 1 },
    '2lg': { max: 1535, order: 2, type: 1 },
    'xl': { max: 1799, order: 1, type: 1 },
}


export function getBreakpoint(width: number): Breakpoint {
    for (const [breakpoint, { min, max }] of Object.entries(screens)) {
        if (min) {
            if (min <= width) return breakpoint as Breakpoint
        } else if (max) {
            if (max >= width) return breakpoint as Breakpoint
        }
    }

    return 'default'
}

export function isBreakpointActive(bp: Breakpoint): boolean {
    if (!site.breakpoint) return false

    const order = screens[bp]?.order
    const searchedType = screens[bp]?.type

    const current = site.breakpoint
    const currentOrder = screens[current]?.order
    const currentType = screens[current]?.type

    if (current === bp) return true
    if (searchedType !== currentType) return false

    return currentOrder >= order
}


export function handleScrolling(node: HTMLElement, p: { onScrollStart: () => any, onScrollEnd: () => any }) {
    let handled = false

    function onScroll() {
        if (handled) return
        handled = true
        p.onScrollStart()
    }

    function onStop() {
        p.onScrollEnd()
        handled = false
    }

    node.addEventListener('scroll', onScroll)
    node.addEventListener('scrollend', onStop)

    return {
        destroy() {
            node.removeEventListener('scroll', onScroll)
            node.removeEventListener('scrollend', onStop)
        }
    }
}