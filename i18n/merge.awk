/^msgstr ""$/ {
    getline <"zh-CN_post.txt"
    print "msgstr \"" $0 "\""
    next
}

{ print $0 }
