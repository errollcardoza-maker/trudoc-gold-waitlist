# Google Sheet of waitlist signups

> **Currently in use: the Sheets-connector option** (see the end of this file). The Apps Script option below is an alternative that's real-time and doesn't depend on a Mac being on.

Every signup is copied into a Google Sheet a few seconds after it's submitted, so your team can see the list without access to Neon or Vercel. Neon stays the source of truth. If Google is unavailable, nothing is lost: missed rows are sent with the next signup, and the sheet never gets duplicates.

**Columns:** Signed up (Dubai time) · Name · Phone · Plan · Source · Campaign · Medium · Signup ID

## One-time setup (about 5 minutes)

1. **Create the sheet.** Go to [sheets.new](https://sheets.new) and name it something like *TruDoc Gold Waitlist*.
2. **Add the script.** In the sheet, open **Extensions → Apps Script**. Delete what's there, paste the whole of [`Code.gs`](Code.gs), and save.
3. **Run setup.** In the toolbar's function dropdown, pick **`setup`** and click **Run**. Approve the permissions; Google warns because the script is yours and unverified, so choose *Advanced → Go to project*. Then open **View → Logs** (or *Execution log*) and copy the **secret** it printed.
4. **Publish it.** Click **Deploy → New deployment**, choose the type **Web app**, and set:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone** (the website isn't signed in to Google; the secret is what protects it)

   Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
5. **Connect the website.** Add both values in Vercel → *trudoc-gold-waitlist* → Settings → Environment Variables, for Production (and Preview if you like):
   - `SHEETS_WEBHOOK_URL` = the Web app URL
   - `SHEETS_WEBHOOK_SECRET` = the secret from step 3 (mark it *Sensitive*)

   Then redeploy (Deployments → ⋯ → Redeploy) so the new values take effect.
6. **Share the sheet** with your employee (Share → their email → **Viewer**, or Editor if they need to add notes).

The next signup pushes every signup so far into the sheet, including earlier ones.

## Good to know

- **Don't rename** the `Signups` tab or reorder the columns. The script looks up the **Signup ID** in the last column to avoid duplicates. Adding extra columns to the **right** of it, for example "Called?", is fine.
- **Changing the script later?** Use *Deploy → Manage deployments → Edit → New version*. That keeps the same URL; a *New deployment* would give you a new one.
- **Rotating the secret:** delete `SECRET` under *Project Settings → Script properties*, run `setup` again, and update `SHEETS_WEBHOOK_SECRET` in Vercel.
- If the two env vars aren't set, the site works as normal and just skips the sheet.

## Option B (in use): scheduled Claude task + Google Sheets connector

- **Sheet:** [TruDoc Gold Waitlist — Signups](https://docs.google.com/spreadsheets/d/1DE7xHoGTcL3GgYNkRP9keVBbnBIJDcm0Lm8t2bxzB_Q/edit), tab `Signups`
- **Schedule:** the Claude task `trudoc-waitlist-to-sheet` runs hourly (Claude app → Scheduled). It only runs while the Mac and the Claude app are on; missed runs catch up on the next one.
- **How it works:** the task runs `npm run -s sheet-sync -- pending`, which calls the site's private `/api/sheet-sync` endpoint using `SHEET_SYNC_TOKEN` from `.env.local` (the same token is set in Vercel). It writes the rows below the last used row with the Sheets connector, then runs `npm run -s sheet-sync -- mark <ids>`. Signup IDs already in column H are skipped, so the sheet never gets duplicates.
- **Writing rows by hand?** Write below the last row, and don't use "insert row" above the header. New rows keep the column formats (the date column and plain-text phone numbers).
