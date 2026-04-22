using Backend.Models;

namespace Backend.Services;

public sealed class PriceSimulationBackgroundService : BackgroundService
{
  private readonly IPortfolioStore _portfolioStore;
  private readonly ILogger<PriceSimulationBackgroundService> _logger;
  private readonly Random _random = new();

  public PriceSimulationBackgroundService(
      IPortfolioStore portfolioStore,
      ILogger<PriceSimulationBackgroundService> logger)
  {
    _portfolioStore = portfolioStore;
    _logger = logger;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    _logger.LogInformation("Price simulation background service started.");

    using var timer = new PeriodicTimer(TimeSpan.FromSeconds(2));

    try
    {
      while (await timer.WaitForNextTickAsync(stoppingToken))
      {
        var positions = _portfolioStore.GetPositions();

        foreach (var position in positions)
        {
          var updatedPrice = GetNextPrice(position);
          _portfolioStore.UpdatePrice(position.Symbol, updatedPrice);
        }
      }
    }
    catch (OperationCanceledException)
    {
      _logger.LogInformation("Price simulation background service stopping.");
    }
  }

  private decimal GetNextPrice(PortfolioPosition position)
  {
    // Simulate a +/- 1% move each tick and clamp at a small positive value.
    var deltaPercent = (decimal)(_random.NextDouble() * 0.02d - 0.01d);
    var nextPrice = position.CurrentPrice * (1 + deltaPercent);
    return Math.Max(0.01m, Math.Round(nextPrice, 2, MidpointRounding.AwayFromZero));
  }
}
