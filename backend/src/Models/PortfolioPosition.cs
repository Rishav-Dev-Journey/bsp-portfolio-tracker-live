namespace Backend.Models;

public sealed class PortfolioPosition
{
  public string Symbol { get; set; } = string.Empty;

  public decimal Quantity { get; set; }

  public decimal AverageCost { get; set; }

  public decimal CurrentPrice { get; set; }

  public bool IsAlert { get; set; }

  public DateTime LastUpdatedUtc { get; set; } = DateTime.UtcNow;
}
