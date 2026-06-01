# ⚽ Panini WM 2026 – Sticker-Tracker

Web-App zum Verwalten deiner Panini-Sammlung zur **FIFA WM 2026**.
Zwei Reiter – **Fehlen** und **Doppelt** – mit Login und Cloud-Speicherung,
sodass deine Sammlung auf PC und Handy synchron ist.

- **Frontend:** statisch (HTML/CSS/JS) → läuft auf **GitHub Pages**
- **Backend:** **Supabase** (Login + Postgres-Datenbank)
- **Umfang:** FWC-Spezialsticker + Gruppe A–L · 48 Teams × 20 Sticker + 20 Spezial = **980**
- Pro Team/Block: Anzahl fehlender Sticker, Gesamt-Fortschritt, Doppelt-Zähler & automatische **Tauschliste**
- Startzustand ist mit deinem Excel-Stand **vorbefüllt** (262 fehlend).

---

## 1) Supabase einrichten (einmalig, kostenlos)

1. Konto erstellen auf **https://supabase.com** → **New project** (Region Europe, DB-Passwort merken).
2. Im Projekt: **SQL Editor → New query** → kompletten Inhalt von **`schema.sql`** einfügen → **Run**.
   (Legt die Tabelle `collections` mit Row-Level-Security an – jede:r sieht nur die eigene Sammlung.)
3. **Project Settings → Data API** (bzw. **API**): kopiere
   - **Project URL**
   - **anon / public key**
4. *(Optional, bequemer beim Testen)* **Authentication → Sign In / Providers → Email**:
   „**Confirm email**“ ausschalten, dann kannst du dich sofort ohne Bestätigungsmail anmelden.

## 2) Zugangsdaten eintragen

Öffne **`config.js`** und ersetze die beiden Platzhalter:

```js
window.PANINI_CONFIG = {
  SUPABASE_URL: "https://deinprojekt.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGci...dein-anon-key..."
};
```

> Der `anon`-Key ist ein öffentlicher Client-Schlüssel und darf im Code stehen –
> der Schutz läuft über die RLS-Regeln aus `schema.sql`.

## 3) Lokal testen

Einfach **`index.html`** im Browser öffnen (Doppelklick). Registrieren → anmelden → loslegen.

## 4) Auf GitHub Pages veröffentlichen

```bash
git init
git add .
git commit -m "Panini WM 2026 Tracker"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/panini-wm2026.git
git push -u origin main
```

Dann auf GitHub: **Settings → Pages → Source: „Deploy from a branch“ → Branch `main` / `/root`**.
Nach ein paar Minuten ist die App unter `https://DEIN-NAME.github.io/panini-wm2026/` erreichbar –
auch auf dem Handy.

---

## Bedienung

| Bereich | Funktion |
|---------|----------|
| **Reiter „Fehlen“** | Sticker antippen = vorhanden (grün) / fehlt (gestrichelt). Badge zeigt „x/20 fehlen“. |
| **Reiter „Doppelt“** | Pro vorhandenem Sticker mit **+/−** die Anzahl Doppelter zählen. Oben entsteht automatisch die **Tauschliste** (kopieren/drucken). |
| **Suche** | Team filtern (Code oder Name). |
| **⚙ Zurücksetzen** | „Auf Excel-Stand setzen“, „Alles auf fehlt“ oder „Alles als gesammelt“. |

Speichern passiert **automatisch** (kurz nach jeder Änderung) in Supabase.

## Hinweise zum Datenbestand

- Reihenfolge entspricht der **Endauslosung vom 05.12.2025** (Gruppe A–L).
- **KSA (Saudi-Arabien):** Im Excel-Bild waren nur 8 der 9 fehlenden Nummern lesbar
  (`1,4,7,8,12,15,16,20`). Bitte die fehlende 9. Nummer in der App ergänzen.
- **FWC:** als 20 Spezialsticker angenommen (9 Intro + 11 FIFA-Museum); die „999“ aus
  dem Excel war ein Platzhalter und wird ignoriert.
- **Flaggen** werden als kleine Bilder von `flagcdn.com` geladen (kostenlos, kein Key,
  funktionieren auch unter Windows). Dafür ist eine Internetverbindung nötig – offline
  blenden sich die Flaggen einfach aus.

## Dateien

| Datei | Zweck |
|-------|------|
| `index.html` | Aufbau der Seite |
| `styles.css` | Design |
| `app.js` | Logik, Teams/Gruppen, Vorbefüllung, Supabase-Anbindung |
| `config.js` | **Deine** Supabase-Zugangsdaten |
| `schema.sql` | Datenbank-Tabelle + Sicherheitsregeln (einmalig ausführen) |
