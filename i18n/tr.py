import deepl
import sys

# python script which pulls everything from `base.txt` and translates them
# using the deepl API. Call it like this:
# python tr.py DE 'your-deepl-api-key-here'

out_lang = sys.argv[1]
auth_key = sys.argv[2]

# You probably need to change these
in_path = "/home/tom/dox/work/simulator/Simulator/i18n/base.txt"
out_path = f"/home/tom/dox/work/simulator/Simulator/i18n/{out_lang}.txt"

deepl_client = deepl.DeepLClient(auth_key)

with open(in_path, 'r') as f:
    lines = [line.strip() for line in f.readlines()]
    result = deepl_client.translate_text(
        lines,
        target_lang=out_lang,
        source_lang="EN",
        preserve_formatting=True,
        formality="less"
    )
    with open(out_path, 'w') as dest:
        for r in result:
            dest.write(f"{r.text}\n")
