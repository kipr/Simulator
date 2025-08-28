/^msgstr ""$/ {
    getline <tl
    print "msgstr \"" $0 "\""
    next
}

{ print $0 }
