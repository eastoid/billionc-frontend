

export function remToPx(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}
export const pxToRem = (px: number): number => px / parseFloat(getComputedStyle(document.documentElement).fontSize)
export const boxesThatFit = (boxWidth: number, padding: number, gap: number, viewportWidthPx: number): number => {
    const viewportWidthRem = pxToRem(viewportWidthPx)
    const totalWidth = viewportWidthRem - padding * 2

    // Check if only one box can fit, in which case we ignore the gap
    if (totalWidth < boxWidth) {
        return 0 // No box fits if viewport is smaller than a single box
    } else if (totalWidth < boxWidth + gap) {
        return 1 // Only one box fits without a gap
    }

    const boxWithGap = boxWidth + gap // Width of each box plus the gap
    return Math.floor(totalWidth / boxWithGap)
}