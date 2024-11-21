export function formatUnixPretty(unixTime: number | null | undefined): string {
    if (unixTime == null) return "Invalid date";

    const date = new Date(unixTime * 1000)

    const pad = (num: number): string => num < 10 ? '0' + num : num.toString()

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())

    return `${year}-${month}-${day} ${hours}:${minutes}`
}


export function relativeTimeAgo(unixTime: number): string {
    if (!unixTime) return "Unknown time ago"

    const now = Date.now();
    const diffInSeconds = Math.floor((now - unixTime * 1000) / 1000);

    const seconds = diffInSeconds % 60;
    const minutes = Math.floor(diffInSeconds / 60) % 60;
    const hours = Math.floor(diffInSeconds / 3600) % 24;
    const days = Math.floor(diffInSeconds / 86400);
    
    if (days > 0) {
        return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (minutes > 0) {
        return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else {
        return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
    }
}


export function relativeTimeAgoCompact(unixTime: number): string {
    if (!unixTime) return "Unknown time ago"

    const now = Date.now();
    const diffInSeconds = Math.floor((now - unixTime * 1000) / 1000);

    const seconds = diffInSeconds % 60;
    const minutes = Math.floor(diffInSeconds / 60) % 60;
    const hours = Math.floor(diffInSeconds / 3600) % 24;
    const days = Math.floor(diffInSeconds / 86400);
    
    if (days > 0) {
        return days === 1 ? "1 day" : `${days} days`;
    } else if (hours > 0) {
        return hours === 1 ? "1 hour" : `${hours} hours`;
    } else if (minutes > 0) {
        return minutes === 1 ? "1 min." : `${minutes} min.`;
    } else {
        return seconds === 1 ? "1 sec." : `${seconds} sec.`;
    }
}


export function unixNow(): number {
    return Math.floor(Date.now() / 1000)
}