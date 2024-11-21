import { writable } from "svelte/store";
import type { ValidationFunction } from "./validation";
// import { rsocket_disconnect } from "../actions/rsocket/rsocket";
// import { browser } from "$app/environment";


// export const masterKeyStore = writable<string | null>(null) //
// export const principalStore = writable<AuthPrincipal | null>(null) //
// export const errorStore = writable<ErrorWindow | null>(null) //

// export const noteListStore = writable<ListNote[] | null>(null) //
// export const archiveOpenStore = writable<boolean>(false) //
// export const settingsSectionStore = writable<SettingsSection>("note") //
// export const settingsOpenStore = writable<boolean>(false) //
// export const pendingNoteUpdate = writable<boolean>(false)
// export const noteLoadingStore = writable<boolean>(false)

// export const previousSavedNoteTextStore = writable<string | null>(null) //
// export const previousNoteTextStore = writable<string | null>(null) //
// export const noteTextStore = writable<string | null>(null) //
// export const noteVersionStore = writable<number | null>(null) //
// export const noteStore = writable<Note | null>(null) //

// export const noteEditableStore = writable<boolean>(false) //
// export const savingNoteStore = writable<boolean>(false) //

// export const appLoadingStore = writable<boolean>(true) //

// export const updateNoteContentStore = writable<string | null>(null) //

// export const principalLoadedStore = writable<boolean>(false) //
// export const appReadyStore = writable<boolean>(false)

// export const haveWritelockStore = writable<boolean | null>(null) //
// export const gettingWritelockStore = writable(false) //

// export const rsocketConnectedStore = writable<boolean>(false) //

// Mute notifications
// export const exitingAppStore = writable<boolean>(false) //

// export const caretPositionStore = writable<number>(0) //

// export const rsocketSessionIdStore = writable<number | null>(null) //

// export const appReferrerStore = writable<AppReferrer | null>(null)
// export const isMobileStore = writable<boolean | null>(null)

// export const rsocketReconnectingStore = writable<boolean>(false)

export const promptTextStore = writable<string | null | undefined>(null) //
export const promptMaxLengthStore = writable<number | null>(null) //
export const promptAnswerStore = writable<string | null | undefined>(null) // 
export const promptValidationFunctionStore = writable<ValidationFunction | null>(null) //

export function prompt_clear() {
    promptTextStore.set(null)
    promptMaxLengthStore.set(null)
    promptValidationFunctionStore.set(null)

    promptAnswerStore.set(undefined)
    promptAnswerStore.set(null)
}

// export const currentAppStore = writable<App>()