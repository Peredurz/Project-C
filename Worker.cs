using Models;
using Queries;
using System;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;


    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Calculate the time until midnight
        DateTime now = DateTime.Now;
        DateTime midnight = now.Date.AddDays(1);
        TimeSpan timeUntilMidnight = midnight - now;

        // Wait until midnight
        await Task.Delay(timeUntilMidnight, stoppingToken);

        // The loop will only run once a day at midnight
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            using (var scope = _serviceProvider.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ModelContext>();
                var rooms = await db.Rooms.Include(r => r.Employee).ToListAsync();
                foreach (var room in rooms)
                {
                    if (room.Employee != null)
                    {
                        room.Employee = null;
                    }
                }
                await db.SaveChangesAsync();
            }

            // Wait for the next midnight
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }

}
