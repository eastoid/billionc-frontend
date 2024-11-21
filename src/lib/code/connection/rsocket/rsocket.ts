import {WebsocketClientTransport} from "@rsocket/websocket-client"
import {type Cancellable, type OnExtensionSubscriber, type OnNextSubscriber, type OnTerminalSubscriber, type Payload, type RSocket, RSocketConnector} from "@rsocket/core"
import {notification} from "../../util/notification";
import {site} from "$lib/code/state/site.svelte"
import {boxes} from "$lib/code/state/boxes.svelte"
import {delay, fetchWrap} from "$lib/code/util/util.svelte"
import {rsocket_handleMessage} from "$lib/code/connection/rsocket/rsocket_router"

export interface OnErrorSubscriber {
    onError(error: any): any
}

let rsocket: RSocket | null = null


/**
 * ## Connect to RSocket
 */
let connecting = false
export async function rsocket_connect() {
    if (connecting) return
    connecting = true

    const hostname = window.location.hostname
    const port = window.location.port

    try {
        console.log(`Connecting RSocket`)
        if (!site.isOnline) return
        if (site.location !== "boxes") return

        const ipToken = await loadIpToken()
        if (!ipToken) {
            throw "Failed to load IP token. Cannot connect rsocket."
        }

        const connector = new RSocketConnector({
            transport: new WebsocketClientTransport({
                url: `wss://${hostname}:${port}/api/v1/rsocket`,
                wsCreator: (url) => new WebSocket(url) as any,
            }),
            setup: {
                dataMimeType: 'text/plain',
                metadataMimeType: 'message/x.rsocket.routing.v0',
                keepAlive: 20000,
                lifetime: 27000,
                payload: {
                    data: Buffer.from(ipToken),
                },
            },
            fragmentation: {
                maxOutboundFragmentSize: 16 * 1024,
            },
            responder: {
                requestResponse(payload: Payload, responderStream: OnTerminalSubscriber & OnNextSubscriber & OnExtensionSubscriber): Cancellable & OnExtensionSubscriber {
                    const route = payload.metadata?.toString()?.substring(2)
                    const data = payload.data?.toString()

                    // Handle incoming message
                    if (route && data != null) {
                        rsocket_handleMessage(data, route).then((done) => {
                            if (done) {
                                const response = {
                                    data: Buffer.from("ok")
                                };
                                responderStream.onNext(response, true);
                                responderStream.onComplete();
                            }
                        })
                    }

                    return {
                        cancel: () => {},
                        onExtension: () => {}
                    };
                }
            }
        })

        rsocket = await connector.connect()
        console.log(`Rsocket connected.`)
        boxes.rsocket.isConnected = true

        rsocket.onClose((e) => {
            boxes.rsocket.isConnected = false
            boxes.rsocket.sessionId = null
            console.log(`Rsocket disconnected: `, e)
            if (e) {
                if (site.location === "boxes") {
                    notification(`Disconnected.`)
                }
                rsocket_reconnect()
            } else {
            }
        })
    } catch (e) {
        console.log(`Failed to connect rsocket:`, e)
        notification(`Failed to connect.`)
    } finally {
        connecting = false
    }
}


/**
 * ## Disconnect RSocket
 */
export async function rsocket_disconnect() {
    if (!rsocket) return
    rsocket.close()
    rsocket = null
}


/**
 * ## Send RSocket: Request response
 */
export function rsocket_send_requestResponse(
    content: string,
    route: string,
    responderStream: OnErrorSubscriber & { onNext: (response: string, isComplete: boolean) => any }
): Promise<any> {
    if (!rsocket) return Promise.reject(new Error("No rsocket connection"));

    return new Promise((resolve, reject) => {
        const payload: Payload = {
            data: Buffer.from(content),
            metadata: Buffer.from(String.fromCharCode(route.length) + route),
        };

        // Send request
        let responded = false;
        const request = rsocket!.requestResponse(payload, {
            onError: (error: Error) => {
                if (responded) return;
                responded = true;
                try {
                    const result = responderStream.onError(error);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            },
            onNext: (payload: Payload, isComplete: boolean) => {
                if (responded) return;
                responded = true;
                const response = payload.data?.toString();
                if (response == null) {
                    const err = new Error("Response payload in response was null.");
                    try {
                        const result = responderStream.onError(err);
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                    return;
                }
                try {
                    const result = responderStream.onNext(response, isComplete);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            },
            onComplete: () => {
                responded = true;
                console.log(
                    `unexpected: onComplete called in request-response message to route [${route}]`
                );
            },
            onExtension: () => {
                responded = true;
                console.log(
                    `unexpected: onExtension called in request-response message to route [${route}]`
                );
            },
        });

        // Set a request timeout
        setTimeout(() => {
            if (!responded) {
                responded = true;
                try {
                    request.cancel();
                } catch (e) {}
                console.log(
                    `RSocket request to route [${route}] timed out after 3000 ms`
                );
                const error = new Error("timeout");
                try {
                    const result = responderStream.onError(error);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            }
        }, 3000);
    });
}


/**
 * ### Fetch IP authentication token
 */
async function loadIpToken(): Promise<string | null> {
    console.log(`Loading IP token...`)

    const on200 = (text: string) => {
        console.log(`Loaded IP token`)
        return text
    }

    function onNon200(text: string, status: number) {
        console.log(`(${status}) Failed to load ip token:`, text)
        return null
    }

    const onException = (e: any) => {
        console.log(`Failed to load IP token:`, e)
        return null
    }

    const body = new FormData()
    return await fetchWrap({
        path: "/api/v1/rsocket/idtoken",
        body: body,
        on200: on200,
        onNon200: onNon200,
        onException: onException,
    })
}


/**
 * ### Reconnect RSocket
 */
let reconnecting = false
export async function rsocket_reconnect(retries: number = 60, delayMs: number = 2000) {
    if (connecting || reconnecting) return
    reconnecting = true
    console.log('Attempting to reconnect RSocket...')

    try {
        for (let attempt = 1; attempt <= retries; attempt++) {
            // Disconnect if there's an existing connection
            await rsocket_disconnect()

            // Attempt to connect again
            try {
                await rsocket_connect()
                if (boxes.rsocket.isConnected) {
                    console.log('RSocket reconnected successfully')
                    notification('Reconnected successfully.')
                    return
                } else {
                    console.log(`RSocket reconnection attempt ${attempt} failed`)
                    // notification(`Reconnection attempt ${attempt} failed.`)
                }
            } catch (e) {
                console.log(`RSocket reconnection attempt ${attempt} error:`, e)
                notification(`Reconnection attempt ${attempt} error.`)
            }

            // Wait before retrying, unless it's the last attempt
            if (attempt < retries) {
                await delay(delayMs)
            }
        }

        console.log('RSocket reconnection failed after maximum retries')
        notification('Reconnection failed after maximum retries.')
    } finally {
        reconnecting = false
    }
}
