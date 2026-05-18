# Installing the Dinner App on Your Phone

The Dinner App lives on the web at **https://zavods.com/meals** — but you can install it to your home screen so it looks and behaves like a real app. No App Store, no account, no download.

## On an iPhone or iPad (Safari)

1. Open **Safari** (not Chrome — iOS only installs from Safari).
2. Go to **https://zavods.com/meals**.
3. Tap the **Share button** at the bottom of the screen (the square with the arrow pointing up).
4. Scroll down and tap **"Add to Home Screen"**.
5. The icon name will say *Dinner App* — leave it as-is or rename if you want.
6. Tap **"Add"** in the top-right.

You'll find the **chef-hat Z** icon on your home screen. Tap it to open the app — it runs full-screen with no Safari address bar, just like an App Store app.

**Tip:** When you first open the app, you'll be asked for the family PIN, then pick your name from the avatar grid. The app remembers you on that phone after that.

## On an Android phone (Chrome)

1. Open **Chrome**.
2. Go to **https://zavods.com/meals**.
3. Tap the **⋮ menu** in the top-right.
4. Tap **"Install app"** (or "Add to Home screen" on older Android versions).
5. Confirm.

Same chef-hat icon, same behavior.

## On a computer

You don't need to install anything — just bookmark **https://zavods.com/meals**. The app works the same in any modern browser (Chrome, Safari, Firefox, Edge).

If you want a desktop icon anyway: in Chrome, go to the menu (⋮) → **"Cast, save, and share"** → **"Install Dinner App…"**. It'll appear in your Applications folder / Start menu like a regular app.

## Troubleshooting

**"It still looks like a website with the address bar."** You probably bookmarked it instead of using "Add to Home Screen". Delete the bookmark and re-do the install steps above — make sure to use the Share button, not just save the URL.

**"I see a different icon (purple lightning bolt or default browser icon)."** Force-refresh the page (long-press the reload button in Safari → "Reload Without Cache") then re-install. Sometimes iOS caches the old icon.

**"I'm asked for a PIN and don't have one."** Ask whoever set up the family. The PIN is shared by all family members; once entered on your phone, you won't be asked again unless you log out.

**"The app is slow / showing stale data."** Pull down on the meal planner to force a refresh, or close and reopen the app. It caches data for offline use, but online changes from other family members propagate within a couple of seconds normally.

## Two phones, two accounts?

You don't need a separate login per phone. Each family member picks their name from the avatar grid on first install — that's tied to that device, so your phone knows it's you, your spouse's phone knows it's them, etc. To switch to a different family member on the same phone, go to **Settings** → **Switch User / Logout**.

## Where's my data?

Everything lives in the family's shared Firestore database. Adding a meal, planning a week, checking off a grocery item — all syncs across every installed phone and computer within seconds. There's no "my version vs. your version" of the app.
