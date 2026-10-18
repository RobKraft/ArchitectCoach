using System.Collections.Concurrent;
using ArchitectCoach.Web.Data;
using ArchitectCoach.Web.Security;
using ArchitectCoach.Web.Services.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MimeKit;

namespace ArchitectCoach.IntegrationTests.Infrastructure;

/// <summary>
/// Runs the real app in memory against its own throwaway LocalDB database (migrated on start,
/// dropped on dispose). Email is captured instead of sent. Rate limits are high unless a
/// subclass lowers them.
/// </summary>
public class AppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _database = $"ArchitectCoach_Test_{Guid.NewGuid():N}";

    public CapturingMailTransport Mail { get; } = new();

    protected virtual int AccountPostsPerMinute => 1000;

    public string ConnectionString =>
        $"Server=(localdb)\\MSSQLLocalDB;Database={_database};Trusted_Connection=True;MultipleActiveResultSets=true";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] = ConnectionString,
            ["Email:Mode"] = "Pickup",
            ["RateLimiting:AccountPostsPerMinute"] = AccountPostsPerMinute.ToString(),
            ["RateLimiting:OtherPostsPerMinute"] = "1000",
        }));
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IMailTransport>();
            services.AddSingleton<IMailTransport>(Mail);
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.MigrateAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await using (var db = NewDbContext(userId: null))
            await db.Database.EnsureDeletedAsync();
        await base.DisposeAsync();
    }

    /// <summary>A context acting as the given user (or signed out), outside any HTTP request.</summary>
    public ApplicationDbContext NewDbContext(string? userId) =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlServer(ConnectionString).Options,
            new FixedCurrentUser(userId));

    /// <summary>Creates a confirmed user directly (skipping the email flow) and returns its id.</summary>
    public async Task<string> CreateConfirmedUserAsync(string email, string password)
    {
        using var scope = Services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
        var result = await users.CreateAsync(user, password);
        if (!result.Succeeded) throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        return user.Id;
    }

    public HttpClient NewClient() => CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false, HandleCookies = true });
}

public sealed class FixedCurrentUser(string? userId) : ICurrentUser
{
    public string? UserId { get; } = userId;
}

public sealed class CapturingMailTransport : IMailTransport
{
    public ConcurrentQueue<MimeMessage> Sent { get; } = new();

    public Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default)
    {
        Sent.Enqueue(message);
        return Task.CompletedTask;
    }

    public MimeMessage[] To(string email) =>
        Sent.Where(m => m.To.Mailboxes.Any(a => a.Address.Equals(email, StringComparison.OrdinalIgnoreCase))).ToArray();
}
