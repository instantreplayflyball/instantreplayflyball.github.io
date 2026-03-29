Team roster template (for Excel / Google Sheets)
=================================================

FILE TO COPY AND FILL OUT
-------------------------
  team-roster-template.csv

Delete the two EXAMPLE rows (PATSY and RIVET) before you import, or your site will
show fake dogs.

Open in Excel, Numbers, or Google Sheets → “Save as” CSV (UTF-8 if your app offers it).
Rename the filled file (e.g. team-roster-2026.csv) and keep a backup.

COLUMNS
-------
  order      Optional. Display order on the Athletes page (1, 2, 3…). Leave blank to
             use row order when importing.

  handler    Person or people who run the dog (e.g. "Alex Kim" or "Jamie & Sam Lee").

  dog        Call name as you want it on the site (e.g. MARLEY, Boston (Boss) ).

  breed      Optional. e.g. Border Collie, Whippet. Leave blank if unknown.

  bio        A few sentences. In Excel use Alt+Enter (Windows) or Option+Enter (Mac)
             inside the cell for a second paragraph. If the bio contains commas, the
             cell must stay quoted when saved as CSV (Excel usually does this).

  photo      Path to the image file from the site root, OR leave blank if adding later.
             Recommended: images/dogs/dog-marley.jpg (match the dog’s call name in the
             filename — use lowercase and hyphens, no spaces).

             If you only write the filename (e.g. dog-marley.jpg), the import script
             will assume it lives in images/dogs/

  photoAlt   Optional. Short description for screen readers (e.g. "Golden retriever
             MARLEY at the start line"). If blank, the importer uses "DOG — handler".

PHOTOS (SEPARATE FROM THE SPREADSHEET)
--------------------------------------
  • One file per dog, good lighting, roughly square or 4:3 is fine.
  • Put files in:  images/dogs/
  • Name them to match the "photo" column (e.g. dog-marley.jpg).

IMPORT INTO THE SITE
--------------------
  From the project folder:

    node scripts/import-team-csv.mjs path/to/your-filled-roster.csv

  This overwrites src/_data/team.json (backup the old file first if you want).

  rosterSort in team.json (alphabetical / breed / order) is kept from the previous
  file unless you edit src/_data/team.json after import.

GIVING DATA TO SOMEONE ELSE (e.g. AI / developer)
-------------------------------------------------
  Send:
    1) The filled CSV (or a shared Google Sheet exported as CSV)
    2) A folder of dog photos named to match the "photo" column
    3) Any notes (e.g. "MINX shares a photo with PANTHER — use same file twice")
