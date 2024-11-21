
export const CHUNK_SIZE = 200

export function chunkIndexOf(box: number) {
    return Math.floor(box / CHUNK_SIZE)
}