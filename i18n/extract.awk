# awk script that extracts all the translation targets from a PO file.
# Run it like this:
# awk -f extract.awk po/de-DE.po >base.txt

BEGIN {
    FS = "\""
}

/msgctxt/ {
    next
}

/msgid/ {
    printf "%s", $2
    next
}

/msgstr/ {
    printf "\n"
    next
}

{
    printf "%s", $2
}
