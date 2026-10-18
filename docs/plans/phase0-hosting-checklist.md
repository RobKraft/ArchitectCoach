# Phase 0: SmarterASP hosting check

Part of [dotnet-blazor-rewrite.md](dotnet-blazor-rewrite.md) §2. Goal: confirm A1–A6 on the
real account before any app code depends on them. You do the control-panel steps; the probe
app (`dotnet/HostingProbe/`) reports what the server actually provides.

## 1. In the SmarterASP control panel

- [ ] Create (or pick) a site for the probe. A subdomain like `probe.<your-domain>` is fine.
- [ ] **A1:** In the site's ASP.NET settings, choose **.NET 10** / ASP.NET Core (in-process).
      Note what versions are offered: ______________________
- [ ] **A5:** Enable HTTPS with the free certificate for that hostname.
- [ ] **A2:** Create an **MS SQL** database. Note its server name, database name, and user.
      Note the SQL Server version shown: ______________________
- [ ] **A3:** Create a mailbox to send from (e.g. `noreply@<your-domain>`). Find the **SMTP
      server name, port, and whether TLS is required** in the mail settings or knowledge base.
      Note the **daily sending limit** if stated: ______________________
- [ ] **A3:** Check the domain's DNS for **SPF** and **DKIM** records for SmarterASP mail (and
      DMARC). Without them, confirmation emails tend to land in spam.
- [ ] **A4:** Note the **datacenter region** of the site and database: ______________________
- [ ] **A6:** Note the deploy options (Web Deploy, FTP) and whether **scheduled tasks** that call
      a URL are available: ______________________

## 2. Configure and upload the probe

1. Generate a probe key (run in PowerShell, keep the output private):
   ```powershell
   [Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Max 256 }))
   ```
2. In `dotnet/publish/HostingProbe/`, create `appsettings.Production.json`. It's gitignored, so
   real values never reach the repo:
   ```json
   {
     "Probe": { "Key": "<probe key>", "TestRecipient": "<your own email>" },
     "ConnectionStrings": {
       "Default": "Server=<sql server>;Database=<db>;User Id=<user>;Password=<password>;Encrypt=True;TrustServerCertificate=True"
     },
     "Smtp": { "Host": "<smtp server>", "Port": 587, "User": "<mailbox>", "Password": "<mailbox password>", "From": "<mailbox>" }
   }
   ```
   `TrustServerCertificate=True` is only for the probe, in case the shared SQL server's
   certificate doesn't match its hostname. Note whether the check also works with it removed;
   the real app should use `False` if it can.
3. Upload the **contents** of `dotnet/publish/HostingProbe/` to the site's root by FTP or Web
   Deploy.
   If you need to rebuild it first:
   ```
   dotnet publish dotnet/HostingProbe -c Release -o dotnet/publish/HostingProbe
   ```

## 3. Run the checks

Open these with your probe key (keep the URL private; it contains the key):

| Check | URL / action | Record the result |
|---|---|---|
| A1, A5, environment | `https://<site>/?key=<probe key>` | .NET runtime: ____ · process `w3wp`? ____ · HTTPS: ____ |
| A2 | "Check SQL Server" link | Version: ____ · compat level ≥130? ____ · OPENJSON OK? ____ · CREATE TABLE OK? ____ |
| A3 | "Send a test email" button | Connected/TLS/auth OK? ____ · arrived in **inbox** (not spam)? ____ |
| Without key | `https://<site>/` | Must show **404** |

If the site shows an HTTP 500.30/500.31 error, .NET 10 isn't available or not selected (A1).
Temporarily set `stdoutLogEnabled="true"` in `web.config` to see the startup error in `logs/`.

## 4. When done

- [ ] Paste the recorded results back into the Claude session. They update the plan (A1–A6),
      the privacy notice's region/processor details, and the email configuration.
- [ ] **Delete the probe from the host**, including `appsettings.Production.json`, which holds
      real passwords.
- [ ] If any credentials were shared anywhere other than the host, rotate them.
