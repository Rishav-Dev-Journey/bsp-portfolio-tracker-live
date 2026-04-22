export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

export const percentageFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
})

export const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))
export const formatNumber = (value) => numberFormatter.format(Number(value || 0))
export const formatPercentage = (value) => percentageFormatter.format(Number(value || 0))
