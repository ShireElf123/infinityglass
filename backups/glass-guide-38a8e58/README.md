# Glass guide rollback point

Before the targeted guide polish, local HEAD and origin were both:
`38a8e584aef88e6298476dd41ebbab533582c65c`.

`guide.html.txt` is the exact original vehicle-glass-showcase section, including photograph URL, SVG arrow geometry, label text, category links and guidance. This is a source backup, not a published page. It is not copied into `dist`.

The photograph, SVG geometry and existing guide stylesheet are not changed by this polish. A focused new stylesheet moves only the quarter-glass label slightly upward below 600px to prevent overlap. Changes otherwise cover labels, shorter guidance and targeted regression tests. Existing internal glass-choice values remain stable to avoid breaking the finder.

## Revert safely

Use `git log --oneline` to find **Polish glass guide labels with reversible backup and selection tests**. Run `git revert <that-commit-sha>` on the existing session branch. This preserves history and reverses only that commit, rather than resetting the website or overwriting later unrelated work. Rebuild, rerun tests and redeploy the existing Vercel project.

For a manual section-only restoration, replace the `<section class="vehicle-glass-showcase" ...>...</section>` in `index.html` with `guide.html.txt`. Do not replace the entire current page with an old backup.

## Verification boundary

The existing external photograph could not be downloaded from this environment (TLS restriction). No replacement image was used, and arrow anchors were deliberately left unchanged instead of guessing their positions. Label bounds, selection handoff, keyboard operation and reduced motion can be tested locally; exact arrow-to-pane placement still needs a visual check with the external photo loaded.
