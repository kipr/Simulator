/^msgstr ""$/ {
    getline <"zh-CN"
    print "msgstr \"" $0 "\""
    next
}

{ print $0 }
