import {DiffMatchPatch} from "diff-match-patch-ts"

const dmp = new DiffMatchPatch()

export function note_getDiffDelta(text1: string, text2: string): string {
    const diff = dmp.diff_main(text1, text2)
    return dmp.diff_toDelta(diff)
}

export function dmp_applyDelta(text1: string, delta: string): string {
    const diff = dmp.diff_fromDelta(text1, delta)
    const patch = dmp.patch_make(diff)

    return dmp.patch_apply(patch, text1)[0]
}