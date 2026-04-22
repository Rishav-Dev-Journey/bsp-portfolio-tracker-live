using System.Text.Json;
using Backend.Models;

namespace Backend.Services;

public sealed class PortfolioStore : IPortfolioStore
{
  private readonly ReaderWriterLockSlim _lock = new();
  private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
  {
    WriteIndented = true
  };
  private readonly string _filePath;
  private readonly List<PortfolioPosition> _positions;

  public PortfolioStore(IHostEnvironment hostEnvironment)
  {
    _filePath = Path.Combine(hostEnvironment.ContentRootPath, "portfolio.json");
    _positions = LoadFromFile();
  }

  public IReadOnlyList<PortfolioPosition> GetPositions()
  {
    _lock.EnterReadLock();
    try
    {
      return _positions
          .Select(position => new PortfolioPosition
          {
            Symbol = position.Symbol,
            Quantity = position.Quantity,
            CurrentPrice = position.CurrentPrice,
            LastUpdatedUtc = position.LastUpdatedUtc
          })
          .ToList();
    }
    finally
    {
      _lock.ExitReadLock();
    }
  }

  // Intended for high-frequency in-memory updates, such as a BackgroundService feed.
  public bool UpdatePrice(string symbol, decimal newPrice)
  {
    if (string.IsNullOrWhiteSpace(symbol))
    {
      return false;
    }

    _lock.EnterWriteLock();
    try
    {
      var position = _positions.FirstOrDefault(
          current => string.Equals(current.Symbol, symbol, StringComparison.OrdinalIgnoreCase));

      if (position is null)
      {
        return false;
      }

      position.CurrentPrice = newPrice;
      position.LastUpdatedUtc = DateTime.UtcNow;
      return true;
    }
    finally
    {
      _lock.ExitWriteLock();
    }
  }

  public bool AddPosition(PortfolioPosition position)
  {
    if (position is null || string.IsNullOrWhiteSpace(position.Symbol))
    {
      return false;
    }

    _lock.EnterWriteLock();
    try
    {
      var alreadyExists = _positions.Any(
          current => string.Equals(current.Symbol, position.Symbol, StringComparison.OrdinalIgnoreCase));

      if (alreadyExists)
      {
        return false;
      }

      position.LastUpdatedUtc = DateTime.UtcNow;
      _positions.Add(position);
      SaveToFile();
      return true;
    }
    finally
    {
      _lock.ExitWriteLock();
    }
  }

  private List<PortfolioPosition> LoadFromFile()
  {
    if (!File.Exists(_filePath))
    {
      var emptySnapshot = new PortfolioSnapshot();
      File.WriteAllText(_filePath, JsonSerializer.Serialize(emptySnapshot, _jsonOptions));
      return [];
    }

    var json = File.ReadAllText(_filePath);
    var snapshot = JsonSerializer.Deserialize<PortfolioSnapshot>(json, _jsonOptions);
    return snapshot?.Positions ?? [];
  }

  private void SaveToFile()
  {
    var snapshot = new PortfolioSnapshot
    {
      Positions = _positions
    };

    var json = JsonSerializer.Serialize(snapshot, _jsonOptions);
    var tempPath = _filePath + ".tmp";

    File.WriteAllText(tempPath, json);
    File.Move(tempPath, _filePath, overwrite: true);
  }
}
