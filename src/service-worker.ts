/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// This file is: /src/service-worker.ts

const sw = self as unknown as ServiceWorkerGlobalScope;


// CODE
import { build, files, version } from '$service-worker'


// Assets
const CACHE_NAME = `cache-${version}`
const ALL_ASSETS = [...build, ...files]

let CRITICAL_ASSETS: string[] = []
let NONCRITICAL_ASSETS: string[] = []
let EXTRA_ASSETS: string[] = []
if (build.length !== 0 && files.length !== 0) {
    for (const path of ALL_ASSETS) {
        if (path.startsWith("/icons")) {
            EXTRA_ASSETS.push(path)
        } else if (path.endsWith("webp") || path.endsWith("png")) {
            NONCRITICAL_ASSETS.push(path)
        } else if (path.includes("crypto") || path.includes("jzip")) {
            NONCRITICAL_ASSETS.push(path)
        } else {
            CRITICAL_ASSETS.push(path)
        }
    }
    NONCRITICAL_ASSETS.push("/icons/icon-plain.svg")

    // const htmlPaths = [
    //     `/index`,
    //     `/home`,
    //     `/faq`,
    //     `/journals`,
    //     `/login`,
    //     `/privacy`,
    //     `/register`,
    //     `/sitemap`,
    //     `/technical`,
    //     `/terms`,
    //     `/login/reset/mfa`,
    //     `/login/reset/password`,
    //     `/404`,
    // ]
    // NONCRITICAL_ASSETS.push(...htmlPaths)
}


///////////////////
function printCritical() {
    log(`Critical assets:`, CRITICAL_ASSETS)
}
function printNonCritical() {
    log(`Noncritical assets:`, NONCRITICAL_ASSETS)
}

function log(...msg: any[] | any) {
    console.log(`[SW]`, ...msg)
}

// Caching
async function cacheAssets(pathList: string[]): Promise<void> {
    try {
        const cache = await caches.open(CACHE_NAME)
        const cachingPromises = pathList.map((asset) => {
            return cache.add(asset).catch((error) => {
                // Catching the error ensures that one failed asset doesn't stop the whole process
                console.error(`Failed to cache asset: ${asset}`, error)
            })
        })
        await Promise.all(cachingPromises)
        log('Caching completed for all accessible assets.')
    } catch (error) {
        console.error('Failed to open cache during caching process:', error)
    }
}


// Events
sw.addEventListener('install', (event: any) => {
    sw.skipWaiting()
    log(`Service worker onInstall - caching critical assets`)
    printCritical()
    printNonCritical()

    event.waitUntil(cacheAssets(CRITICAL_ASSETS).then(() => {
        log(`Critical assets cached.`)
    }))
})


sw.addEventListener('activate', (event: any) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        }).then(() => {
            return sw.clients.claim()  // Take control immediately
        }).then(() => {
            log(`Caching noncritical assets.`)
            cacheAssets(NONCRITICAL_ASSETS).then(() => {
                log(`Noncritical assets cached.`)
            })
        })
    )
})


sw.addEventListener('fetch', (event: FetchEvent) => {
    if (event.request.url.includes('/api') || sw.location.hostname === "localhost") {
        // Do not cache API requests
        event.respondWith(fetch(event.request)
            .catch((r) => {
                return r
            })
    )
    } else {
        if (event.request.mode === "navigate") {
            event.respondWith(
                fetch(event.request).then(async (response) => {
                    const cache = await caches.open(CACHE_NAME)
                    cache.put(event.request, response.clone())
                    return response;
                }).catch(async (fetchError: any) => {
                    const cached = await caches.match(event.request);
                    if (cached == null) {
                        throw fetchError;
                    }
                    return cached;
                })
            )
            return
        }

        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request)
            }).catch((error) => {
                console.error('Fetch failed:', error)
                throw error
            })
        )
    }
})