# awk script to merge a machine translated file (using `tr.py`) with its PO
# file. Once you have the translated file, you call the script like this:
# awk -f merge.awk -v tl=DE.txt po/de-DE.po >de-DE.po
# Inspect the resulting file to make sure everything lined up correctly, then
# move it into the `po/` directory.

/^msgstr ""$/ {
    getline <tl
    print "msgstr \"" $0 "\""
    next
}

{ print $0 }
