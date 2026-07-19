# Deploying a New Version — insider.com.bd (HostingBangladesh cPanel)

Proven flow as of 2026-07-19 (v1.0 live). Follow top to bottom.

**Key facts**
- Deploy branch: **`main-second`**
- Server app root: `/home/insiderc/repositories/insider` (Git repo = Node.js app folder)
- Real node_modules: `/home/insiderc/nodevenv/repositories/insider/20/lib/node_modules`
  (the `node_modules` in the app root is a symlink — File Manager cannot open it)
- The compiled `.next` is **committed to git** on purpose — the server cannot build.
- **NEVER** run "Run NPM Install" or any build on the server (out-of-memory).
  Exception: only if the venv was wiped (app recreated) — then run it once.

---

## Decide what kind of release this is

| What changed | Do parts |
|---|---|
| Only code/pages/styles | A + B |
| `prisma/schema.prisma` changed | A + B + C + D |
| Only DB content changed | D only |

---

## PART A — Build and push (on your PC, every release)

1. **Stop the dev server** if running (Ctrl+C in its terminal, or kill the
   `node` process on port 3000). A dev server corrupts `.next` with
   hot-update files — a dev build will NOT run on the server.

2. Make sure local MySQL is running (root/root, database `insider`).

3. Build:
   ```powershell
   cd C:\projects\insider
   npm run build
   ```
   Must end with the route table and no errors.

4. Commit and push (if you worked on a feature branch, merge it first):
   ```powershell
   git add -A
   git commit -m "v2.0"
   git checkout main-second
   git merge --ff-only <your-feature-branch>   # skip if you worked on main-second
   git push origin main-second
   ```

5. Note the new build id for verification later:
   ```powershell
   type .next\BUILD_ID
   ```

---

## PART B — Deploy on the server (every release)

1. cPanel → **Git™ Version Control** → Manage the `insider` repo →
   **Update from Remote**. Confirm the HEAD commit shown is your new commit.

2. cPanel → **Setup Node.js App** → **STOP APP** → wait 5 seconds → **START APP**.
   (Use Stop/Start, not the Restart button — Restart has failed to take effect before.)

3. Open the site in a fresh Incognito window and hard-refresh (**Ctrl+F5**).

4. **CHECKPOINT** — if the site looks broken/unstyled or unchanged:
   - File Manager → `repositories/insider/.next/BUILD_ID` → must equal the id
     from Part A step 5. If it doesn't → the git pull didn't apply; check the
     Git page for errors.
   - If BUILD_ID is correct on disk but the browser still shows the old
     version → **stuck node process**. See Troubleshooting.

---

## PART C — Prisma client (ONLY if schema.prisma changed)

The Prisma client lives in node_modules (not in git) and cannot be generated
on the server. Ship it by tarball.

1. On your PC (Git Bash), after the Part A build:
   ```bash
   cd /c/projects/insider
   rm -f node_modules/.prisma/client/query_engine-windows.dll.node.tmp*
   tar -czf ~/Downloads/insider-prisma.tar.gz \
     --exclude='*query_engine-windows*' \
     node_modules/.prisma/client node_modules/@prisma/client
   ```
   Result ≈ 53 MB.

2. File Manager → go to
   `/home/insiderc/nodevenv/repositories/insider/20/lib`
   → open `node_modules` → **DELETE** the folders `.prisma` and `@prisma`
   (extract does NOT overwrite existing files — deleting first is mandatory).

3. Go back to `lib` → **Upload** `insider-prisma.tar.gz` there
   → confirm it shows **~53 MB** after upload (a failed upload shows bytes/KB)
   → right-click → **Extract** into `lib`.

4. Verify `lib/node_modules/.prisma/client/schema.prisma` exists and contains
   your newest model names.

5. Stop → Start the app again.

---

## PART D — Database (ONLY if schema or data changed)

⚠️ Windows MySQL stores table names lowercase; the Linux server is
case-sensitive. **Never import a raw local mysqldump** — it creates
`sitesetting` instead of `SiteSetting` and the app breaks.

1. On your PC (Git Bash) generate a corrected file:
   ```bash
   cd /c/projects/insider
   npx prisma migrate diff --from-empty \
     --to-schema-datamodel prisma/schema.prisma --script > /tmp/ddl.sql

   "/c/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe" \
     -uroot -proot -h127.0.0.1 --compact --no-create-info \
     --skip-triggers --complete-insert insider > /tmp/data.sql

   sed -i 's/INSERT INTO `projecttype`/INSERT INTO `ProjectType`/g;
           s/INSERT INTO `projectimage`/INSERT INTO `ProjectImage`/g;
           s/INSERT INTO `project`/INSERT INTO `Project`/g;
           s/INSERT INTO `sitesetting`/INSERT INTO `SiteSetting`/g;
           s/INSERT INTO `service`/INSERT INTO `Service`/g;
           s/INSERT INTO `contactmessage`/INSERT INTO `ContactMessage`/g;
           s/INSERT INTO `galleryimage`/INSERT INTO `GalleryImage`/g;
           s/INSERT INTO `review`/INSERT INTO `Review`/g;
           s/INSERT INTO `circleimage`/INSERT INTO `CircleImage`/g;
           s/INSERT INTO `adminuser`/INSERT INTO `AdminUser`/g' /tmp/data.sql

   { echo "SET FOREIGN_KEY_CHECKS=0;"; echo "SET NAMES utf8mb4;";
     for t in adminuser circleimage contactmessage galleryimage projectimage \
              projecttype project review service sitesetting AdminUser \
              CircleImage ContactMessage GalleryImage ProjectImage ProjectType \
              Project Review Service SiteSetting; do
       echo "DROP TABLE IF EXISTS \`$t\`;"; done;
     cat /tmp/ddl.sql; cat /tmp/data.sql;
     echo "SET FOREIGN_KEY_CHECKS=1;"; } \
     > ~/Downloads/insider-database-fixed.sql
   ```
   (Add any NEW model names to both the sed list and the drop list.)

   ⚠️ This wipes and replaces the app's 10 tables with your local data —
   including admin password and contact messages. Live-only changes are lost.

2. phpMyAdmin → database **`insiderc_insider`** → **Import** →
   choose the file → **UNCHECK "Enable foreign key checks"** → Go.
   Must finish with no red error box.

3. ⚠️ This shared database also contains another app's tables
   (`blog_posts`, `users`, `migrations`, …). Never touch them.

4. No app restart needed for data-only changes.

---

## PART E — Uploaded media (ONLY if you added/changed images or hero video locally)

`public/uploads/` is **gitignored** — hero frames, gallery images, logos and
project photos do NOT travel via git. If you uploaded media through the LOCAL
admin panel, ship it:

1. On your PC (Git Bash) — find what the DB actually references, then pack it:
   ```bash
   cd /c/projects/insider
   tar -czf ~/Downloads/insider-uploads.tar.gz public/uploads
   ```
   (Or pack only the referenced folders to keep it small — check
   `SiteSetting.heroFrameDir`, `SiteSetting.logoUrl`, and the url columns of
   ProjectImage/GalleryImage/CircleImage. Skip `public/uploads/review` if the
   reviews use Facebook/YouTube links.)

2. File Manager → app root → Upload the tarball → verify its size → Extract.

3. No restart needed — `public/` files are served immediately.

Media uploaded through the **live** admin panel goes straight to the server's
disk and needs nothing — but it is NOT in git, so keep occasional backups
(File Manager → Compress `public/uploads` → Download).

---

## TROUBLESHOOTING

**Site serves the old version no matter what (restart does nothing)**
A stuck node process survives Stop/Start/Restart and even app re-creation.
Fix (pick one):
- Support ticket: *"Please kill all node processes for my account and restart
  Passenger for insider.com.bd"* — they do it in minutes. Proven fix.
- Or: Cron Jobs → add `pkill -9 node` @ once per minute → wait 2 minutes →
  **delete the cron job** (mandatory — it will keep killing the new app) →
  Start the app.

**500 errors on pages that use the database**
File Manager → app root → download `stderr.log` → read the last lines:
- `@prisma/client did not initialize` → Part C was skipped or extracted to the
  wrong place; redo Part C exactly.
- `Table 'X' does not exist` → lowercase-table problem; redo Part D.
- `Environment variable not found: DATABASE_URL` → Setup Node.js App →
  re-add the env vars, restart.

**Run diagnostics on the server without SSH**
Create `diag.js` in the app root, add `"diag": "node diag.js"` to
package.json scripts, then Setup Node.js App → **Run JS script** → `diag` →
read `diag-output.txt`. Script that tests every table:
```js
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const c = new PrismaClient(); const out = [];
(async () => {
  for (const m of ['siteSetting','projectType','project','projectImage',
    'service','contactMessage','galleryImage','review','circleImage','adminUser']) {
    try { out.push(m + ': OK (' + await c[m].count() + ' rows)'); }
    catch (e) { out.push(m + ': ERROR - ' + e.message.trim().split('\n').pop()); }
  }
  fs.writeFileSync('diag-output.txt', out.join('\n')); process.exit(0);
})();
```

**App recreated / venv wiped (`nodevenv/.../lib` missing)**
Run NPM Install once from the panel (ignore the error popup at the end —
packages still install), then do Part C to restore the Prisma client.

**Server env vars** (Setup Node.js App → Environment variables):
- `DATABASE_URL` = `mysql://insiderc_main1:<password>@localhost:3306/insiderc_insider`
- `AUTH_SECRET` = any long random string
