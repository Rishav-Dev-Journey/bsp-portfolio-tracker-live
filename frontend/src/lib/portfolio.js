export const normalizeHolding = (holding) => {
  const ticker = String(holding?.ticker ?? holding?.symbol ?? '').toUpperCase()
  const quantity = Number(holding?.quantity ?? holding?.Quantity ?? 0)
  const averageCost = Number(
    holding?.averageCost ??
      holding?.AverageCost ??
      holding?.costBasis ??
      holding?.CostBasis ??
      holding?.currentCost ??
      holding?.CurrentCost ??
      holding?.currentPrice ??
      holding?.CurrentPrice ??
      0,
  )
  const currentPrice = Number(holding?.currentPrice ?? holding?.CurrentPrice ?? averageCost)
  const isAlert = Boolean(holding?.isAlert ?? holding?.IsAlert)
  const lastUpdatedUtc = holding?.lastUpdatedUtc ?? holding?.LastUpdatedUtc ?? null

  return {
    ticker,
    quantity,
    averageCost,
    currentPrice,
    isAlert,
    lastUpdatedUtc,
  }
}

export const normalizePortfolio = (portfolio) =>
  Array.isArray(portfolio) ? portfolio.map(normalizeHolding).filter((item) => item.ticker) : []

export const calculatePositionGainLoss = (holding) => {
  const quantity = Number(holding?.quantity ?? 0)
  const averageCost = Number(holding?.averageCost ?? 0)
  const currentPrice = Number(holding?.currentPrice ?? 0)

  return (currentPrice - averageCost) * quantity
}

export const calculatePortfolioMetrics = (portfolio) => {
  const positions = normalizePortfolio(portfolio)
  const totalValue = positions.reduce((sum, position) => sum + position.quantity * position.currentPrice, 0)
  const dailyPnL = positions.reduce((sum, position) => sum + calculatePositionGainLoss(position), 0)
  const totalExposure = positions.reduce((sum, position) => sum + position.quantity, 0)
  const winRate = positions.length
    ? positions.filter((position) => calculatePositionGainLoss(position) >= 0).length / positions.length
    : 0
  const topMover = positions
    .map((position) => ({
      ...position,
      change: position.currentPrice - position.averageCost,
    }))
    .sort((left, right) => Math.abs(right.change) - Math.abs(left.change))[0]

  return {
    totalValue,
    dailyPnL,
    totalExposure,
    winRate,
    positions,
    topMover,
  }
}
