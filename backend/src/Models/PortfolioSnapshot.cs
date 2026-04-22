namespace Backend.Models;

public sealed class PortfolioSnapshot
{
  public List<PortfolioPosition> Positions { get; set; } = [];
}
