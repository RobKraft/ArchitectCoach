// Copy-to-clipboard for any button with data-copy-target="<textarea id>".
// Event delegation on document, so it keeps working after Blazor's enhanced navigation swaps
// page content. Without JavaScript the text is still selectable by hand.
document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-target]");
    if (!button) return;
    const source = document.getElementById(button.getAttribute("data-copy-target"));
    const status = button.parentElement?.querySelector("[data-copy-status]");
    if (!source) return;
    try {
        await navigator.clipboard.writeText(source.value ?? source.textContent);
        if (status) status.textContent = "Copied to clipboard.";
    } catch {
        source.select?.();
        if (status) status.textContent = "Couldn't copy automatically. The text is selected; press Ctrl+C.";
    }
});
