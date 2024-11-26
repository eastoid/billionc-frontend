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
    
    // virtuaScrolling - Boolean value (if virtua is actively scrolling)
    let holdingWheel = $state(false)
    let scrolling = $state(false)
    let manualScrolling = $state(false)
    let virtuaScrolling = $state(false)
    
    function setScrolling(v: boolean) { activelyScrolling = v }
    $effect(() => {
        // console.log(`${scrolling} || ${virtuaScrolling}\n${manualScrolling} || ${holdingWheel}`)
        if (!scrolling && !virtuaScrolling) {
            setScrolling(false)
            // return false
        }

        if (manualScrolling || holdingWheel) {
            setScrolling(true)
            // return true
        }

        setScrolling(false)
        // return false
    })
    
    function onScrollStart() {
        console.log(`on scroll start`)
        // activelyScrolling = true
        scrolling = true
    }
    
    function onScrollEnd() {
        console.log(`on scroll end`)
        // activelyScrolling = false
        scrolling = false
        manualScrolling = false
        // wheelClicked
    }
    
    function onWheel() {
        console.log(`on wheel`)
        // activelyScrolling = true
        manualScrolling = true
    }
    
    function onMouseDown(e: MouseEvent) {
        console.log(`on mouse down`)
        if (e.button === 1) {
            holdingWheel = true
        }
    }
    
    function onMouseUp(e: MouseEvent) {
        console.log(`on mouse up`)
        holdingWheel = false
    }
    
    function virtua_onScrollStart(offset: number) {
        console.log(`virtua on scroll start`)
        virtuaScrolling = true
        if (onscroll) onscroll(offset)
    }

    function virtua_onScrollEnd() {
        console.log(`virtua on scroll end`)
        virtuaScrolling = false
        if (onscrollend) onscrollend()
    }
</script>

<!--
  @component
  Virtualized list component. See {@link VListProps} and {@link VListHandle}.
-->
<div {...rest} style={`${viewportStyle} ${rest.style || ""}`} class="containeroid {classes}" on:mouseup={onMouseUp} on:mousedown={onMouseDown} on:wheel={onWheel} on:scroll={onScrollStart} on:scrollend={onScrollEnd}>
    <!-- hero -->
    <header use:onElementVisible={onHeaderVisible} class="px-2 py-1 grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-2 sm:grid-cols-[1fr_auto] justify-center align-middle gap-2 h-[2rem] sm:h-[4rem]">
        <div class="sm:col-span-1">
            <h1>One billion checkboxes</h1>
        </div>
        <div class="sm:order-3 flex justify-center sm:justify-start gap-6 xcol-span-2">
            <p title="Global click count: {getOrDefault(boxes.clickCount, 'Unknown')}" class="size-fit">{boxes.clickCount} <span class="hidden sm:inline">☛</span><span class="sm:hidden">clicks</span></p>
            <p title="Global boxes checked: {getOrDefault(boxes.checkedCount, 'Unknown')}" class="size-fit">{boxes.checkedCount} <span class="hidden sm:inline">✓</span><span class="sm:hidden">checked</span></p>
            <p title="Online users: {getOrDefault(boxes.userCount, 'Unknown')}" class="size-fit">{boxes.userCount} <span class="hidden sm:inline">웃</span><span class="sm:hidden">{boxes.userCount === 1 ? 'person' : 'people'}</span></p>
        </div>
        <div class="sm:order-4 flex sm:justify-end w-fit">
            <button title="Enable {site.lightMode ? 'dark' : 'light'} mode" on:click={() => { site.lightMode = !site.lightMode }} class="px-2 rounded bg-neutral-800 text-neutral-100"><span class="sm:hidden">Toggle</span> {site.lightMode ? 'dark' : 'light'} theme</button>
        </div>
        <div class="flex justify-end sm:order-2 sm:col-span-1">
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