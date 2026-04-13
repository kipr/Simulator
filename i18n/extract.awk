# awk script that extracts all the translation targets from a PO file.
# Run it like this:
# awk -f extract.awk po/de-DE.po >base.txt

BEGIN {
    FS = "\""
}

/msgctxt/ {
    in_msgstr = 0
    next
}

/msgid/ {
    printf "%s", $2
    in_msgstr = 0
    next
}

/msgstr/ {
    printf "\n"
    in_msgstr = 1
    next
}

!in_msgstr {
    printf "%s", $2
}