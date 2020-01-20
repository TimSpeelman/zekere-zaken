
export function eur(x: number) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(x)
}
