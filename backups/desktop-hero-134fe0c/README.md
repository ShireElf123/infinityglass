# Desktop hero and logo baseline

Baseline commit: `134fe0c5511ca8c47e9727ee188019ff6d57257f`.

The original photograph and original/full logo remain unchanged in assets. The adjacent text files preserve the pre-change presentation styles. Full original markup and tests are available at the baseline commit.

To undo only this update, use `git revert <desktop-fix-commit>` on the existing Arena branch, run validation/build/browser tests, push the same branch and redeploy. Do not reset the branch or replace newer content with an old full-page snapshot.

Reason: the previous desktop text card obscured the left technician. The fix separates text and image and displays the entire original photograph. A desktop-only logo crop removes the small baked-in tagline so readable HTML lettering can replace it; mobile and footer retain the original full logo.
