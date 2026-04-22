using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IPortfolioStore, PortfolioStore>();
builder.Services.AddHostedService<PriceSimulationBackgroundService>();

var app = builder.Build();

// Resolve once so the singleton eagerly loads portfolio.json at startup.
app.Services.GetRequiredService<IPortfolioStore>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/portfolio", (IPortfolioStore store) => Results.Ok(store.GetPositions()))
    .WithName("GetPortfolio")
    .WithOpenApi();

app.MapPut("/portfolio/prices/{symbol}", (string symbol, UpdatePriceRequest request, IPortfolioStore store) =>
{
    var updated = store.UpdatePrice(symbol, request.Price);
    return updated ? Results.NoContent() : Results.NotFound();
})
    .WithName("UpdatePrice")
    .WithOpenApi();

app.MapPost("/portfolio/positions", (PortfolioPosition position, IPortfolioStore store) =>
{
    var added = store.AddPosition(position);
    return added
        ? Results.Created($"/portfolio/positions/{position.Symbol}", position)
        : Results.BadRequest("Position already exists or payload is invalid.");
})
    .WithName("AddPosition")
    .WithOpenApi();

app.Run();

public sealed record UpdatePriceRequest(decimal Price);
