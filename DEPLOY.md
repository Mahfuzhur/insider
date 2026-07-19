# Deployment Guide — HostingBangladesh (cPanel, no SSH)

This project deploys to shared cPanel hosting (**HostingBangladesh**) using
**Git Version Control** + **Setup Node.js App** (CloudLinux Node.js Selector).
There is **no SSH/terminal** on the server.

## Hard constraints (why the flow looks unusual)

- The host's memory cap makes Prisma CLI crash (`WebAssembly.Instance(): Out of
  memory`). So `prisma generate`, `prisma db push`, and `next build`
  **cannot run on the server**.
- Because of that, the compiled `.next` build is **committed to git** (it is
  intentionally NOT gitignored) and ships via `git pull`.
- `node_modules/` **is** gitignored, so the Prisma **client** (generated code +
  Linux query engine) does **not** travel through git. It is shipped as a
  tarball whenever the schema changes.

- **Deploy branch:** `main`
- **App root on server:** the folder containing `.next`, `package.json`,
  `server.js` (the Git checkout dir = the Node app dir).

---

## A. One-time server setup (already done)

1. **Git Version Control** → clone `https://github.com/Mahfuzhur/insider.git`,
   branch `main`, into the app directory.
2. **Setup Node.js App** → point Application Root at that directory,
   Application Startup File = `server.js`.
3. Set environment variables in the Node.js App panel:
   - `DATABASE_URL=mysql://insiderc_main1:<password>@localhost:3306/insiderc_insider`
   - `AUTH_SECRET=<a long random string>`
4. Database imported via **phpMyAdmin** into `insiderc_insider`.

---

## B. Deploy an update (the normal flow)

### 1. Update the database (only if the schema changed)
Import the updated SQL via **phpMyAdmin** into `insiderc_insider`.
*(You said this is already done for this release.)*

### 2. Pull the code + build via Git
**cPanel → Git™ Version Control → Manage** (the `insider` repo):
- **Update from Remote**  (fetches `origin/main`)
- **Deploy HEAD Commit**  (checks the new commit into the app directory)

No build or npm install needed — the production `.next` is already in the commit.

### 3. Ship the Prisma client — ONLY if the schema changed
Git cannot carry the Prisma client. If any model/field changed since the last
deploy, upload the prebuilt client:

- **cPanel → File Manager** → open the app root.
- **Upload** `insider-prisma.tar.gz` (built locally — see section C).
- Select it → **Extract**. It lands in
  `node_modules/.prisma/client` and `node_modules/@prisma/client`.

Skip this step if the schema did not change.

### 4. Restart
**cPanel → Setup Node.js App** → your app → **Restart**.

> ⚠️ Do **NOT** click **Run NPM Install** and do **NOT** run the build script on
> the server — both OOM. Everything they'd produce is already shipped.

### 5. Verify
Open the site + `/admin/login`. If the schema changed, also check the new
feature pages (e.g. `/admin/circle-gallery`).

---

## C. Building the release locally (do this before section B)

Run on the dev machine (Windows), with local MySQL up
(`root:root@localhost:3306/insider`, configured in the gitignored `.env`).

### 1. Stop the dev server first
`next dev` overwrites `.next` with development/HMR artifacts and deletes the
production manifests. Stop it before building, or the committed `.next` won't
run in production.

### 2. Production build
```
npm run build          # = prisma generate && next build
```
This regenerates `.next` (production) and the Prisma client with Linux engines.
`prisma/schema.prisma` must keep:
```
binaryTargets = ["native", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "debian-openssl-1.0.x"]
```

### 3. Commit the build + push
```
git add -A
git commit -m "Production build for deploy"
git checkout main
git merge --ff-only <feature-branch>   # if you work on a feature branch
git push origin main
```

### 4. Rebuild the Prisma tarball — only if the schema changed
From the project root (Git Bash):
```
# remove any stray windows temp engines first
rm -f node_modules/.prisma/client/query_engine-windows.dll.node.tmp*

tar -czf ~/Downloads/insider-prisma.tar.gz \
  --exclude='*query_engine-windows*' \
  node_modules/.prisma/client \
  node_modules/@prisma/client
```
Result: `insider-prisma.tar.gz` (~53 MB, Linux engines only). This is the file
uploaded in section B step 3.

---

## Quick checklist

| Step | When | Where |
|------|------|-------|
| Import SQL | schema changed | phpMyAdmin |
| Update from Remote + Deploy HEAD | every deploy | Git Version Control |
| Upload + extract `insider-prisma.tar.gz` | schema changed | File Manager |
| Restart | every deploy | Setup Node.js App |
| Never run NPM Install / build on server | — | (OOMs) |
