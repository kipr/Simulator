# awk script to merge a machine translated file (using `tr.py`) with its PO
# file. Once you have the translated file, you call the script like this:
# awk -f merge.awk -v tl=DE.txt po/de-DE.po >de-DE.po
# Inspect the resulting file to make sure everything lined up correctly, then
# move it into the `po/` directory.

function escape_po(line) {
    gsub(/\r/, "", line)
    gsub(/\\/, "\\\\", line)
    gsub(/"/, "\\\"", line)
    return line
}

# Skip old continuation lines after replacing a msgstr
skip_msgstr_continuation && /^[[:space:]]*"/ {
    next
}

# Once a non-continuation line appears, stop skipping
skip_msgstr_continuation {
    skip_msgstr_continuation = 0
}

/^[[:space:]]*msgstr[[:space:]]*"/ {
    if ((getline line < tl) <= 0) {
        print
        next
    }
    printf "msgstr \"%s\"\n", escape_po(line)
    skip_msgstr_continuation = 1
    next
}

{ print }