/**
 * Generate a simple browser fingerprint for spam prevention
 * This is a basic implementation - for production, consider using libraries like fingerprintjs
 */
export function generateFingerprint(): string {
    if (typeof window === "undefined") {
        return "server-side";
    }

    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        navigator.hardwareConcurrency || "unknown",
    ];

    const fingerprint = components.join("|");

    // Simple hash function (for production, use a proper crypto hash)
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
}

/**
 * Check if fingerprint exists in localStorage for this restaurant
 * This provides an additional layer of duplicate detection
 */
export function hasReviewedBefore(restaurantId: string): boolean {
    if (typeof window === "undefined") return false;

    const key = `maqla_reviewed_${restaurantId}`;
    return localStorage.getItem(key) === "true";
}

/**
 * Mark restaurant as reviewed in localStorage
 */
export function markAsReviewed(restaurantId: string): void {
    if (typeof window === "undefined") return;

    const key = `maqla_reviewed_${restaurantId}`;
    localStorage.setItem(key, "true");
}
