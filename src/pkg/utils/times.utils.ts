export function secs(secs: number) {
    return secs * 1000;
}

export function mins(min: number) {
    return min * 60 * secs(1);
}

export function hours(hrs: number) {
    return hrs * 60 * mins(1);
}

export function days(days: number) {
    return days * 24 * hours(1);
}

export function weeks(weeks: number) {
    return weeks * 7 * days(1);
}

export function months(months: number) {
    return months * 30 * days(1);
}

export function years(years: number) {
    return years * 365 * days(1);
}