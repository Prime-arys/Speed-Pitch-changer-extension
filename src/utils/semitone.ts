export const SEMITONE_MULTIPLIER = 1.05946309436;

export function semitoneToRate(value: number): number {
    const fromSemitone = Math.pow(2, value / 12);
    return parseFloat(fromSemitone.toFixed(16));
}

export function rateToSemitone(rate: number): number {
    const toSemitone = Math.log2(rate) * 12;
    return parseFloat(toSemitone.toFixed(16));
}

