using ArchitectCoach.Web.Components;
using ArchitectCoach.Web.Components.Account;
using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Data;
using ArchitectCoach.Web.Security;
using ArchitectCoach.Web.Services;
using ArchitectCoach.Web.Services.Email;
using ArchitectCoach.Web.Services.Kits;
using ArchitectCoach.Web.Services.Privacy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpContextCurrentUser>();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

// Signed in by default: every endpoint requires an authenticated user unless it is explicitly
// marked [AllowAnonymous]. The public list is pinned by tests (EndpointInventoryTests).
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());

// Read when the first context is created (not at startup), so host-level overrides such as
// test configuration apply.
builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    var connectionString = sp.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
    options.UseSqlServer(connectionString);
});
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Stores.SchemaVersion = IdentitySchemaVersions.Version3;
        options.User.RequireUniqueEmail = true;

        // NIST SP 800-63B: length over composition rules; paste and password managers allowed.
        options.Password.RequiredLength = 12;
        options.Password.RequiredUniqueChars = 4;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

// Re-check the security stamp every minute, so deleting an account or changing its password
// signs out the user's other devices quickly.
builder.Services.Configure<SecurityStampValidatorOptions>(o => o.ValidationInterval = TimeSpan.FromMinutes(1));

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsProduction() ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
    options.SlidingExpiration = true;
});
builder.Services.AddAntiforgery(o =>
    o.Cookie.SecurePolicy = builder.Environment.IsProduction() ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest);

builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection(EmailOptions.Section));
var emailMode = builder.Configuration[$"{EmailOptions.Section}:Mode"] ?? "Smtp";
if (emailMode.Equals("Pickup", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddSingleton<IMailTransport, PickupFolderMailTransport>();
else
    builder.Services.AddSingleton<IMailTransport, SmtpMailTransport>();
builder.Services.AddSingleton<IEmailSender<ApplicationUser>, IdentityEmailSender>();

builder.Services.AddAppRateLimiting(builder.Configuration);

builder.Services.AddSingleton<ContentCatalog>();
builder.Services.AddScoped<WizardService>();
builder.Services.AddScoped<SpecKitGenerator>();
builder.Services.AddScoped<KitService>();
builder.Services.AddScoped<DataExportService>();
builder.Services.Configure<SiteOptions>(builder.Configuration.GetSection(SiteOptions.Section));
builder.Services.AddScoped<RetentionService>();
builder.Services.AddHostedService<RetentionWorker>();

var app = builder.Build();

if (app.Environment.IsProduction() && !app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<SiteOptions>>().Value.IsConfigured)
{
    app.Logger.LogCritical("Site:OperatorName, Site:PrivacyContactEmail and Site:HostingRegion must be configured: the privacy notice shows placeholders until they are.");
}

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}
app.UseSecurityHeaders();
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseRateLimiter();
app.UseAntiforgery();

// Static files (CSS, JS, images) must load on the public sign-in pages too.
app.MapStaticAssets().AllowAnonymous();
app.MapRazorComponents<App>();

app.MapAdditionalIdentityEndpoints();
app.MapKitEndpoints();

app.Run();

/// <summary>Exposed for WebApplicationFactory in the integration tests.</summary>
public partial class Program;
