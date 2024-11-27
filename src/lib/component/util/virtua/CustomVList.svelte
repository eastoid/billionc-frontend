<script lang="ts" generics="T">
    // import { styleToString } from "virtua/svelte";
    import {Virtualizer} from "virtua/svelte";
    import type { VListProps, VListHandle } from "virtua/svelte";
    import {remToPx} from "$lib/code/checkboxes"
    import {site} from "$lib/code/state/site.svelte"
    import {getOrDefault, onElementVisible} from "$lib/code/util/util.svelte"
    import {boxes} from "$lib/code/state/boxes.svelte"
    import {notification} from "$lib/code/util/notification"
    import {handleScrolling, isBreakpointActive} from "$lib/code/util/ui"
    import {dev} from "$app/environment"

    interface Props extends VListProps<T> {
        classes: string;
        onHeaderVisible: () => any;
        activelyScrolling: boolean;
    }

    let {
        data,
        getKey,
        overscan,
        itemSize,
        shift,
        horizontal,
        children,
        onscroll,
        onscrollend,
        classes,
        onHeaderVisible,
        activelyScrolling = $bindable(false),
        ...rest
    }: Props = $props();
    
    
    let ref: Virtualizer<T> = $state()!;

    export const styleToString = (obj: any) => {
        return Object.keys(obj).reduce((acc, k) => {
            const value = obj[k];
            if (value == null) {
                return acc;
            }
            return acc + `${k}:${value};`;
        }, "");
    };

    export const getScrollOffset = (() =>
        ref.getScrollOffset()) satisfies VListHandle["getScrollOffset"] as VListHandle["getScrollOffset"];
    export const getScrollSize = (() =>
        ref.getScrollSize()) satisfies VListHandle["getScrollSize"] as VListHandle["getScrollSize"];
    export const getViewportSize = (() =>
        ref.getViewportSize()) satisfies VListHandle["getViewportSize"] as VListHandle["getViewportSize"];
    export const findStartIndex = (() =>
        ref.findStartIndex()) satisfies VListHandle["findStartIndex"] as VListHandle["findStartIndex"];
    export const findEndIndex = (() =>
        ref.findEndIndex()) satisfies VListHandle["findEndIndex"] as VListHandle["findEndIndex"];
    export const getItemOffset = ((...args) =>
        ref.getItemOffset(
            ...args
        )) satisfies VListHandle["getItemOffset"] as VListHandle["getItemOffset"];
    export const getItemSize = ((...args) =>
        ref.getItemSize(
            ...args
        )) satisfies VListHandle["getItemSize"] as VListHandle["getItemSize"];
    export const scrollToIndex = ((...args) =>
        ref.scrollToIndex(
            ...args
        )) satisfies VListHandle["scrollToIndex"] as VListHandle["scrollToIndex"];
    export const scrollTo = ((...args) =>
        ref.scrollTo(
            ...args
        )) satisfies VListHandle["scrollTo"] as VListHandle["scrollTo"];
    export const scrollBy = ((...args) =>
        ref.scrollBy(
            ...args
        )) satisfies VListHandle["scrollBy"] as VListHandle["scrollBy"];
    

    const viewportStyle = styleToString({
        display: horizontal ? "inline-block" : "block",
        [horizontal ? "overflow-x" : "overflow-y"]: "auto",
        contain: "strict",
        width: "100%",
        height: "100%",
    });
    
    const headerHeight = $derived(isBreakpointActive("sm") ? remToPx(4) : remToPx(2))


    let scrolling = $state(false)
    
    let modifierTimeout: NodeJS.Timeout | null = null;
    let scrollModifier: 1 | 2 | null = $state(null) // 1 = instant, 2 = slow scrolling
    function setScrollModifier(type: typeof scrollModifier) {
        // console.log(`Set scroll modifier`)
        if (modifierTimeout) clearTimeout(modifierTimeout)
        
        scrollModifier = type
        
        if (type === 1) {
            modifierTimeout = setTimeout(() => {
                if (scrolling) return
                scrollModifier = null
            }, 50)
        }
    }
    
    function handle_scrollStart() {
        scrolling = true
        if (scrollModifier) {
            // console.log(`Scrolling with modifier!`)
            activelyScrolling = true
        } else {
            // console.log(`Scrolling WITHOUT modifier.`)
        }
    }
    
    function handle_scrollEnd() {
        scrolling = false
        activelyScrolling = false
        if (scrollModifier === 1) scrollModifier = null
    }
    
    function onScrollStart() {
        // console.log(`on scroll start`)
        // handle_scrollStart()
    }
    
    function onScrollEnd() {
        // console.log(`on scroll end`)
        // handle_scrollEnd()
    }
    
    function onWheel() {
        // console.log(`on wheel`)
        setScrollModifier(1)
    }
    
    function onMouseDown(e: MouseEvent) {
        // console.log(`on mouse down`)
        if (e.button === 1) {
            setScrollModifier(2)
        }
    }
    
    function onMouseUp(e: MouseEvent) {
        // console.log(`on mouse up`)
        if (e.button === 1) {
            scrollModifier = null
        }
    }
    
    function onPointerDown(e: PointerEvent) {
        setScrollModifier(2)
    }

    function onPointerUp(e: PointerEvent) {
        scrollModifier = null
    }
    
    function virtua_onScrollStart(offset: number) {
        // console.log(`virtua on scroll start`)
        handle_scrollStart()
        if (onscroll) onscroll(offset)
    }

    function virtua_onScrollEnd() {
        // console.log(`virtua on scroll end`)
        handle_scrollEnd()
        if (onscrollend) onscrollend()
    }
</script>

<!--
  @component
  Virtualized list component. See {@link VListProps} and {@link VListHandle}.
-->
<div {...rest} style={`${viewportStyle} ${rest.style || ""}`} class="containeroid {classes}" on:pointerdown={onPointerDown} on:pointerup={onPointerUp} on:mouseup={onMouseUp} on:mousedown={onMouseDown} on:wheel={onWheel} on:scroll={onScrollStart} on:scrollend={onScrollEnd}>
    <!-- hero -->
    <header use:onElementVisible={onHeaderVisible} class="px-2 py-1 flex justify-between items-center gap-2 h-[2rem]">
        <div class="">
            <h1>One billion checkboxes</h1>
        </div>
        <div class="flex justify-end">
            <a title="Website author" target="_blank" href="https://koza.dev" class="text-neutral-500 hover:underline hover:text-blue-500">By koza.dev</a>
        </div>
    </header>
    
    <!-- content -->
    <Virtualizer
        startMargin={headerHeight}
        bind:this={ref}
        {data}
        {children}
        {getKey}
        {overscan}
        {itemSize}
        {shift}
        {horizontal}
        onscroll={virtua_onScrollStart}
        onscrollend={virtua_onScrollEnd}
    />
    
    <footer class="flex px-2 py-1 justify-center">
        <div>You have reached reached the end of one billion checkboxes</div>
    </footer>
</div>


<style>
    .containeroid {
        overflow-anchor: none;
        overflow-y: auto;
    }
</style>