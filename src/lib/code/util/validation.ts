import { site } from "../state/site.svelte"

export type ValidationFunction = (s: string) => string | null

export function validate_email(email: string): string | null {
    if (site.validationDisabled === true) return null

    if (email == null) return "Email is null."   
    if (email == "") return "Email is empty."
    if (email.length > 512) return "Email is too long."
    if (email.length < 5) return "Email is invalid."
    if (!email.includes("@") || !email.includes(".")) return "Email is invalid."

    return null
}

export function validate_password(password: string): string | null {
    if (site.validationDisabled === true) return null

    if (password == null) return "Password is null."
    if (password == "") return "Password is empty."
    if (password.length < 8) return "Password must be at least 8 characters long."
    if (password.length > 256) return "Password is too long."
    if (!/\d/.test(password)) return "Password must contain a digit."
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter."
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter."

    return null
}

export function validate_bcryptSalt(salt: string): string | null {
    if (site.validationDisabled === true) return null

    if (salt.length !== 29) return `BCrypt salt has invalid length (${salt.length}).`
    if (!salt.startsWith('$2a$') && !salt.startsWith('$2b$') && !salt.startsWith('$2y$')) return `BCrypt salt does not have valid prefix.`
    return null
}

export function validate_totp(totp: string): string | null {
    if (site.validationDisabled === true) return null

    if (totp == null || totp == '') return "Code is invalid"
    if (totp.length !== 6) return "Code should be 6 digits"
    if (!/^\d{6}$/.test(totp)) return "Code should contain only digits";
    return null
}


export function validate_title(title: string): string | null {
    if (site.validationDisabled === true) return null

    if (title == null) return "Title is null."
    if (title === "") return "Title is empty."
    if (title.length > 100) return "Title is too long. (100)"

    const blank = isBlank(title)
    if (blank) return "Title is blank."

    const valid = isSafeStringDiacritics(title)
    if (!valid) return "Title contains invalid characters."

    return null
}

export function validate_journalEntry(text: string): string | null {
    if (site.validationDisabled === true) return null
    if (text == null) return "Text is null."
    if (text === "") return "Text is empty."
    if (text.length > 4000) return "Text is too long."

    return null
}

function isBlank(str: string): boolean {
    return str.trim().length === 0
}


function isSafeString(str: string): boolean {
    return /^[a-zA-Z0-9-_ ]*$/.test(str)
}

function isSafeStringDiacritics(str: string): boolean {
    return /^[\p{L}0-9-_ ]+$/u.test(str)
}