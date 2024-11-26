import { browser, dev } from "$app/environment";
import { get, type Unsubscriber } from "svelte/store";
import { promptAnswerStore, promptMaxLengthStore, promptTextStore, promptValidationFunctionStore } from "./store";
import { page } from "$app/stores";
import { type ValidationFunction } from "./validation"; 
import { site } from "../state/site.svelte";
 
 
export async function prompt(text: string, maxLength: number | null, validationFunction: ValidationFunction | null): Promise<string | null> { 
    const existingPrompt = get(promptTextStore) 
    if (existingPrompt != null) return null 
 
    promptValidationFunctionStore.set(validationFunction) 
    promptMaxLengthStore.set(maxLength) 
    promptTextStore.set(text) 
    promptAnswerStore.set(null) 
 
    return new Promise((resolve) => { 
        let answerCount = 0 
        let unsubAnswer: Unsubscriber
        unsubAnswer = promptAnswerStore.subscribe((answerInput) => { 
            answerCount++ 
            if (answerInput == null) { 
                if (answerInput === undefined || answerCount === 2) {
                    resolve(null) 
                    unsubAnswer() 
                } 
                return 
            } 
            unsubAnswer() 
            resolve(answerInput) 
        }) 
    }) 
} 
 
 
export function getQueryParam(key: string): string | null { 
    if (!browser) return null 
 
    const param = get(page).url.searchParams.get(key) 
    if (param == null) return null
    return param
}

export function runcatching(kalbak: () => void) {
    try {
        kalbak()
    } catch (e) {

    }
}

export function parseBool(str: string): boolean | undefined {
    if (str === "true") return true
    if (str === "false") return false
    return undefined
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function splitByFirstOccurrence(str: string, separator: string): string[] | null {
    const index = str.indexOf(separator);
    if (index === -1) {
        return null
    }
    const firstPart = str.substring(0, index);
    const secondPart = str.substring(index + 1);
    return [firstPart, secondPart];
}

export function download(filename: string, text: string) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

export function downloadBlob(filename: string, blob: Blob) {
    const element = document.createElement('a')
    element.href = URL.createObjectURL(blob)
    element.download = filename

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)

    // Revoke the object URL after download to free memory
    URL.revokeObjectURL(element.href)
}


function isUserAgentMobile(userAgentString: string): boolean {
    // Regular expression to detect a mobile device
    const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;

    // Regular expression to detect a mobile device based on the first few characters of the user agent string
    const shortMobileRegex = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;

    return (mobileRegex.test(userAgentString) || shortMobileRegex.test(userAgentString.slice(0, 4)))
}

let userAgentMatches: boolean | undefined
let detecting = false
let lastTest = 0

export async function detectIsMobile(): Promise<boolean | null> {
    if (!browser) return null

    const now = Date.now()
    if (now - lastTest < 800) {
        return null
    }
    lastTest = now

    if (detecting) return null
    detecting = true

    try {
        let score = 0

        const isTouch = (navigator.maxTouchPoints > 0) ||
                        //@ts-ignore
                        (navigator.msMaxTouchPoints > 0) ||
                        ('ontouchstart' in window) ||
                        (window.matchMedia("(pointer: coarse)").matches)

        if (isTouch === true) { score++ }

        //@ts-ignore
        const ua = navigator.userAgent || navigator.vendor || window.opera
        const isUaMobile = (userAgentMatches != null) ? userAgentMatches : isUserAgentMobile(ua)
        userAgentMatches = isUaMobile
        if (isUaMobile === true) { score++ }

        const isSmallScreen = window.innerWidth <= 450
        if (isSmallScreen === true) { score++ }

        const result = (score >= 2)
        site.isMobile = result
        console.log(`Is mobile score: ${score}`)

        return result
    } finally {
        detecting = false
    }
}


export function printLogo() {
    console.log("============================\n======  Debounce 2.0  ======\n============================")
}


export function debounceFunction(action: any, delay: any, continuousCallDuration: any) {
    let timeoutId: any;
    let continuousCallTimeoutId: any;
    let lastCallTime: number | null = null;

    return function() {
        //@ts-ignore
        const context: any = this;
        const args = arguments;

        const currentTime = new Date().getTime();

        // If it's the first call or more than continuousCallDuration has passed since the last call
        if (!lastCallTime || currentTime - lastCallTime > continuousCallDuration) {
            clearTimeout(continuousCallTimeoutId);
            lastCallTime = currentTime;

            continuousCallTimeoutId = setTimeout(() => {
                action.apply(context, args);
                lastCallTime = null;  // Reset after action has been called
            }, continuousCallDuration);
        }

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            action.apply(context, args);
            clearTimeout(continuousCallTimeoutId);
            lastCallTime = null;
        }, delay);
    }
}

export function parseJsonOrNull(json: string): any | null {
    try {
        return JSON.parse(json)
    } catch (e) {
        return null
    }
}

export function messageOrNull(json: any): string | null {
    try {
        const message = json.message
        if (!message) return null
        return message
    } catch (e) {
        return null
    }
}

export function formatUnixToReadable(unix: number): string {
    const date = new Date(unix * 1000)
    return date.toISOString()
}

export function getCurrentDateReadable(): string {
    return new Date().toISOString()
}

export function sendMessageToServiceWorker(msg: any) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        console.log(`Message to service worker: ${msg}`)
        navigator.serviceWorker.controller.postMessage(msg)
    }
}


let workerRegistered = false
export async function regsiterServiceWorker() {
    if (workerRegistered) return
    workerRegistered = true

    if ('serviceWorker' in navigator) {
        console.log(`Registering service worker.`)
        
        navigator.serviceWorker.register('/service-worker.js', { 
            type: dev ? "module" : "classic"
        }).then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope)
        }).catch((error) => {
            console.error('Service Worker registration failed:', error)
        })
    }
}



export type CancelablePromise<T = any> = {
    promise: Promise<T>,
    cancel: () => void
}

export function onConditionMet<T>(
    condition: () => boolean,
    callback: () => Promise<T> | T
): CancelablePromise<T> {
    let cancelled = false
    let uneffect: Function | null = null

    // Await the condition as well as the async callback
    const promise = new Promise<T>((resolve, reject) => {
        uneffect = $effect.root(() => {
            $effect(() => {
                if (cancelled) {
                    return
                }

                const val = condition()
                if (val === true) {
                    cancelled = true
                    if (uneffect) {
                        uneffect()
                    }

                    const result = callback()
                    if (result instanceof Promise) {
                        result.then(result => {
                            resolve(result)
                        }).catch(e => {
                            reject(e)
                        })
                    } else {
                        resolve(result)
                    }
                }
            })

            // This runs on uneffect()
            return () => {
                cancelled = true
            }
        })
    })

    const cancel = () => {
        if (uneffect) {
            uneffect()
        }
        cancelled = true
    }

    return {
        promise,
        cancel
    }
}



export function censorString(input: string) {
    return input.replace(/./g, '*')
}

export function createLoop(callback: (count: number) => any, interval: number, repetitions: number) {
    let count = 0

    const intervalId = setInterval(() => {
        callback(count)
        count++

        if (count >= repetitions) {
            clearInterval(intervalId)
        }
    }, interval)

    // Return a function to stop the loop manually
    return () => {
        clearInterval(intervalId)
    }
}



export async function fetchWrap<T>(h: {
    body: FormData,
    path: string,
    on200: (text: string) => Promise<T> | T,
    onNon200: (text: string, status: number) => Promise<T> | T,
    onException: (e: any) => Promise<T> | T,
    on502?: (text: string) => Promise<T> | T,
    on429?: (text: string) => Promise<T> | T,
    onFinally?: () => Promise<void> | void,
}) {
    try {
        const response = await fetch(`${h.path}`, {
            body: h.body, credentials: "same-origin", method: "POST"
        })
        const status = response.status
        const text = await response.text()

        if (status === 200) {
            return await h.on200(text)
        } else if (status === 502 && h.on502) {
            return await h.on502(text)
        } else if (status === 429 && h.on429) {
            return await h.on429(text)
        } else {
            return await h.onNon200(text, status)
        }
    } catch (e) {
        return await h.onException(e)
    } finally {
        if (h.onFinally) await h.onFinally()
    }
}


export function validateJsonList(jsonList: any[], schema: { [key: string]: string }): { valid: boolean, errors?: string[] } {
    const errors: string[] = []
  
    for (let i = 0; i < jsonList.length; i++) {
        const item = jsonList[i]
  
      // Check each key in the schema
        for (const key in schema) {
            if (item.hasOwnProperty(key)) {
                if (typeof item[key] !== schema[key]) {
                    errors.push(`Item ${i}: Field "${key}" should be of type "${schema[key]}"`)
                }
            } else {
                errors.push(`Item ${i}: Missing field "${key}"`)
            }
        }
    }
  
    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined }
}
  

export function createIntersectionObserver(element: HTMLElement, onIntersection: Function): () => void {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                onIntersection()
            }
        })
    })
    if (element) {
        observer.observe(element)
    }
    
    return () => {
        try {
            observer.disconnect()
        } catch (e) {}
    }
}


export function deepClone(obj: any): any {
    // If the value is not an object or is null, return it directly (primitive values)
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Handle arrays: create a new array and recursively deep clone its elements
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }

    // Handle objects: create a new object and recursively deep clone its properties
    const clonedObj: Record<string, any> = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    
    return clonedObj;
}

export function run<T>(c: () => T) {
    return c()
}

export async function runAsync<T>(c: () => Promise<T>) {
    return await c()
}


export function rap<T>(value: T, print: string) {
    console.log(print)
    return value
}

export function pr(...prints: string[]) {
    console.log(...prints)
}

export function valuesOf<T>(obj: {[key: string | number]: T}): T[] { return Object.values(obj) }

export function filterFirstOrNull<T>(obj: {[key: string | number]: T}, predicate: (item: T) => boolean): T | null {
    for (let item of valuesOf(obj)) {
        if (predicate(item)) {
            return item
        }
    }
    return null
}


export function splitList<T>(list: T[], chunkSize: number = 30): T[][] {
    const result: T[][] = []
    for (let i = 0; i < list.length; i += chunkSize) {
        result.push(list.slice(i, i + chunkSize))
    }
    return result
}

export const isBlank = (str: string): boolean => !str.trim()


export function onElementVisible(element: HTMLElement | any, callback: () => any) {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                callback()
                observer.unobserve(element)
                return
            }
        }
    })

    observer.observe(element)

    return {
        destroy() {
            try {
                observer.unobserve(element)
            } catch (e) {}
        }
    }
}

export function usePrint(_: HTMLElement, m: [any, any]) { console.log(m[0]); return { destroy() { if (m[1]) {console.log(m[1])}} }}

export function getOrDefault<T, O>(value: T | null, def: O): T | O {
    return value ? value : def
}

export function printFunc(...prints: any[]) {
    return () => { console.log(...prints) }
}