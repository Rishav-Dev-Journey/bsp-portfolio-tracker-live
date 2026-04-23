using Backend.Models;
using Backend.Hubs;
using Backend.Services;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddSignalR();
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

app.UseCors("FrontendDev");

app.MapHub<PortfolioHub>("/portfolioHub");

app.MapGet("/portfolio", (IPortfolioStore store) => Results.Ok(store.GetPositions()))
    .WithName("GetPortfolio")
    .WithOpenApi();

app.MapPut("/portfolio/prices/{symbol}", async (
        string symbol,
        UpdatePriceRequest request,
        IPortfolioStore store,
        IHubContext<PortfolioHub> hubContext) =>
{
    var updated = store.UpdatePrice(symbol, request.Price);

    if (updated)
    {
        await hubContext.Clients.All.SendAsync("PortfolioUpdated", new PortfolioHubMessage
        {
            Positions = store.GetPositions().ToList()
        });
    }

    return updated ? Results.NoContent() : Results.NotFound();
})
    .WithName("UpdatePrice")
    .WithOpenApi();

app.MapPost("/portfolio/positions", async (
        PortfolioPosition position,
        IPortfolioStore store,
        IHubContext<PortfolioHub> hubContext) =>
{
    var added = store.AddPosition(position);

    if (added)
    {
        await hubContext.Clients.All.SendAsync("PortfolioUpdated", new PortfolioHubMessage
        {
            Positions = store.GetPositions().ToList()
        });
    }

    return added
        ? Results.Created($"/portfolio/positions/{position.Symbol}", position)
        : Results.BadRequest("Position already exists or payload is invalid.");
})
    .WithName("AddPosition")
    .WithOpenApi();

app.MapPut("/portfolio/positions/{symbol}", async (
        string symbol,
        PortfolioPosition updatedPosition,
        IPortfolioStore store,
        IHubContext<PortfolioHub> hubContext) =>
{
    var updated = store.UpdatePosition(symbol, updatedPosition);

    if (updated)
    {
        await hubContext.Clients.All.SendAsync("PortfolioUpdated", new PortfolioHubMessage
        {
            Positions = store.GetPositions().ToList()
        });
    }

    return updated ? Results.NoContent() : Results.NotFound("Position not found.");
})
    .WithName("UpdatePosition")
    .WithOpenApi();

app.MapDelete("/portfolio/positions/{symbol}", async (
        string symbol,
        IPortfolioStore store,
        IHubContext<PortfolioHub> hubContext) =>
{
    var deleted = store.DeletePosition(symbol);

    if (deleted)
    {
        await hubContext.Clients.All.SendAsync("PortfolioUpdated", new PortfolioHubMessage
        {
            Positions = store.GetPositions().ToList()
        });
    }

    return deleted ? Results.NoContent() : Results.NotFound("Position not found.");
})
    .WithName("DeletePosition")
    .WithOpenApi();

app.Run();

public sealed record UpdatePriceRequest(decimal Price);
