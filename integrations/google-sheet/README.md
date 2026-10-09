# Google Sheet of waitlist signups

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
