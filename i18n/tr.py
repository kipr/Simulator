import deepl
import sys

# python script which pulls everything from `base.txt` and translates them
# using the deepl API. Call it like this:
# python tr.py DE 'your-deepl-api-key-here'

out_lang = sys.argv[1]
auth_key = sys.argv[2]

in_path = "/home/erin/Desktop/Wombat_Libraries/Simulator/i18n/base.txt"
out_path = f"/home/erin/Desktop/Wombat_Libraries/Simulator/i18n/{out_lang}.txt"

deepl_client = deepl.DeepLClient(auth_key)

def po_escape(s: str) -> str:
    return s.replace("\r", "").replace("\\", "\\\\").replace('"', '\\"')

with open(in_path, "r", encoding="utf-8") as f:
    lines = [line.rstrip("\n") for line in f.readlines()]

kwargs = dict(
    target_lang=out_lang,
    source_lang="EN",
    preserve_formatting=True,
)

SUPPORTED_FORMALITY = {"DE", "FR", "ES", "IT", "NL", "PL", "PT-PT", "PT-BR"}

if out_lang.upper() in SUPPORTED_FORMALITY:
    kwargs["formality"] = "less"

result = deepl_client.translate_text(lines, **kwargs)

with open(out_path, "w", encoding="utf-8") as dest:
    for r in result:
        dest.write(po_escape(r.text) + "\n")