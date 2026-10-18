using System.IO.Compression;
using System.Text;
using ArchitectCoach.Web.Domain;

namespace ArchitectCoach.Web.Services.Kits;

/// <summary>Builds the downloadable kit: Dev Kit docs (supported types only), then the Spec Kit files.</summary>
public sealed class KitService(SpecKitGenerator specKit)
{
    public IReadOnlyDictionary<string, string> BuildFiles(Project project)
    {
        var decisions = project.Decisions.OrderBy(d => d.Number).ToList();
        var files = new Dictionary<string, string>(StringComparer.Ordinal);
        if (DevKitGenerator.SupportedTypes.Contains(project.ProjectType))
            foreach (var (path, text) in DevKitGenerator.Generate(project.ProjectType, project.Knowledge, decisions))
                files[path] = text;
        foreach (var (path, text) in specKit.Generate(project))
            files[path] = text;
        return files;
    }

    public byte[] BuildZip(Project project)
    {
        using var buffer = new MemoryStream();
        using (var zip = new ZipArchive(buffer, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var (path, text) in BuildFiles(project).OrderBy(f => f.Key, StringComparer.Ordinal))
            {
                var entry = zip.CreateEntry(path, CompressionLevel.Optimal);
                using var writer = new StreamWriter(entry.Open(), new UTF8Encoding(encoderShouldEmitUTF8Identifier: false));
                writer.Write(text);
            }
        }
        return buffer.ToArray();
    }

    public static string ZipFileName(Project project) => $"{DevKitGenerator.Slugify(project.ProjectType)}-spec-kit.zip";
}
