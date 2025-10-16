export type BackoffOptions = {
    readonly initialMs?: number;
    readonly maxMs?: number;
    readonly factor?: number;
    readonly jitterRatio?: number; // 0..1
};

export async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export function nextBackoff(currentMs: number, options?: BackoffOptions): number {
    const initial = options?.initialMs ?? 1000;
    const max = options?.maxMs ?? 8000;
    const factor = options?.factor ?? 2;
    const jitterRatio = options?.jitterRatio ?? 0.2;

    const base = Math.max(currentMs || initial, initial) * factor;
    const withCap = Math.min(base, max);
    const jitter = withCap * jitterRatio * (Math.random() * 2 - 1); // ±ratio
    return Math.max(250, Math.round(withCap + jitter));
}
