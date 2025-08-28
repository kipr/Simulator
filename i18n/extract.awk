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
