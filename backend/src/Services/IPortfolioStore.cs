using Backend.Models;

namespace Backend.Services;

public interface IPortfolioStore
{
  IReadOnlyList<PortfolioPosition> GetPositions();

  bool UpdatePrice(string symbol, decimal newPrice);

  bool AddPosition(PortfolioPosition position);
}
