export function getApproxNumRepresentation(n: number) {
  if (typeof n !== 'number') {
    return 'n/a'
  }

  if (n <= 1e4) {
    return `${n}`
  }

  if (n <= 1e6) {
    return `${(n / 1e3).toFixed(1)}K`
  }

  if (n <= 1e9) {
    return `${(n / 1e6).toFixed(1)}M`
  }

  if (n <= 1e12) {
    return `${(n / 1e9).toFixed(1)}B`
  }

  return `${n}`
}
