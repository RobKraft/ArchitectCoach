using System.Text.Json;
using ArchitectCoach.Web.Content;
using ArchitectCoach.Web.Domain;
using ArchitectCoach.Web.Services;
using ArchitectCoach.Web.Services.Kits;

namespace ArchitectCoach.Tests;

/// <summary>
/// Parity with the Next.js kit generators: for each case in Golden/cases.json (written by
/// scripts/export-golden-kits.ts from the TypeScript code), the .NET kit must contain exactly
/// the same files with byte-identical content.
/// </summary>
public class KitGoldenTests
{
    private static readonly ContentCatalog Content = new();
    private static readonly string GoldenRoot = Path.Combine(AppContext.BaseDirectory, "Golden");
    private static readonly DateTime FixedDate = new(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc);

    private sealed record GoldenCase(string Type, string Purpose, int Pick, int? AnswerSteps);

    private static Dictionary<string, GoldenCase> Cases() =>
        JsonSerializer.Deserialize<Dictionary<string, GoldenCase>>(
            File.ReadAllText(Path.Combine(GoldenRoot, "cases.json")), new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

    public static IEnumerable<object[]> CaseNames() => Cases().Keys.Select(k => new object[] { k });

    /// <summary>Applies answers exactly as the app does (WizardService helpers), with a fixed decision date.</summary>
    private static Project BuildProject(GoldenCase c)
    {
        var project = new Project { ProjectType = c.Type, Purpose = c.Purpose };
        project.Knowledge.Requirements.Purpose = c.Purpose;
        foreach (var step in Content.StepsFor(c.Type).Take(c.AnswerSteps ?? int.MaxValue))
        {
            var option = step.Options[Math.Min(c.Pick, step.Options.Count - 1)];
            WizardService.ApplyToKnowledge(project.Knowledge, step, option.Label);
            if (step.RecordDecision is { } spec)
            {
                var record = WizardService.BuildDecision(step, spec, option, project.Decisions.Count + 1);
                record.CreatedAt = FixedDate;
                project.Decisions.Add(record);
            }
        }
        return project;
    }

    [Theory]
    [MemberData(nameof(CaseNames))]
    public void Kit_matches_the_nextjs_output(string caseName)
    {
        var kits = new KitService(new SpecKitGenerator(Content, new WizardService(db: null!, Content)));
        var actual = kits.BuildFiles(BuildProject(Cases()[caseName]));

        var dir = Path.Combine(GoldenRoot, caseName);
        var expected = Directory.GetFiles(dir, "*", SearchOption.AllDirectories)
            .ToDictionary(f => Path.GetRelativePath(dir, f).Replace('\\', '/'), File.ReadAllText);

        Assert.Equal(expected.Keys.OrderBy(k => k, StringComparer.Ordinal), actual.Keys.OrderBy(k => k, StringComparer.Ordinal));
        foreach (var (path, want) in expected)
        {
            var got = actual[path];
            if (got == want) continue;
            var w = want.Split('\n');
            var g = got.Split('\n');
            var line = Enumerable.Range(0, Math.Max(w.Length, g.Length)).First(i => i >= w.Length || i >= g.Length || w[i] != g[i]);
            Assert.Fail($"{caseName}/{path} differs at line {line + 1}:\n  expected: {(line < w.Length ? w[line] : "<end>")}\n  actual:   {(line < g.Length ? g[line] : "<end>")}");
        }
    }

    [Fact]
    public void Zip_contains_every_file()
    {
        var kits = new KitService(new SpecKitGenerator(Content, new WizardService(db: null!, Content)));
        var project = BuildProject(new GoldenCase("Phone app", "Zip check", 0, null));
        using var zip = new System.IO.Compression.ZipArchive(new MemoryStream(kits.BuildZip(project)));
        Assert.Equal(kits.BuildFiles(project).Keys.Order(StringComparer.Ordinal), zip.Entries.Select(e => e.FullName).Order(StringComparer.Ordinal));
        Assert.Equal("phone-app-spec-kit.zip", KitService.ZipFileName(project));
    }
}
