#!/usr/bin/env python3
"""
generate_docs_tr_ts.py

Reads a Doxygen-generated JSON documentation file and emits a TypeScript file
containing literal tr("...") calls so the existing i18n extractor can add the
strings to PO files.

Usage:
  python3 generate_docs_tr_ts.py \
    --input /path/to/json.json \
    --output /path/to/ivygate/src/i18n/docs.generated.ts \
    --tr-import "." \
    --localizedstring-import "../util/LocalizedString" \
    --export-name DOC_TR
"""

from __future__ import annotations

import argparse
import json
import os
from typing import Any, Dict, List, Optional, Set, Tuple


PREFER_EXISTING_KEYS = True


def ts_string_literal(s: str) -> str:
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("\r", "\\r").replace("\n", "\\n")
    return f'"{s}"'


def norm_text(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    t = s.strip()
    return t if t else None


def add_entry(
    entries: List[Tuple[str, str]],
    seen: Set[Tuple[str, str]],
    context: str,
    msgid: Optional[str],
) -> None:
    msgid_n = norm_text(msgid)
    if not msgid_n:
        return
    key = (context, msgid_n)
    if key in seen:
        return
    seen.add(key)
    entries.append(key)


def get_field(obj: Dict[str, Any], text_field: str, key_field: str) -> Tuple[Optional[str], Optional[str]]:
    text = norm_text(obj.get(text_field))
    if not text:
        return None, None
    if PREFER_EXISTING_KEYS:
        key = norm_text(obj.get(key_field))
        if key:
            return text, key
    return text, None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to json.json")
    parser.add_argument("--output", required=True, help="Path to write docs.generated.ts")
    parser.add_argument("--tr-import", default=".", help='TS import path for tr')
    parser.add_argument(
        "--localizedstring-import",
        default="../util/LocalizedString",
        help='TS import path for LocalizedString',
    )
    parser.add_argument("--export-name", default="DOC_TR", help="Exported const name")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        doc = json.load(f)

    entries: List[Tuple[str, str]] = []
    seen: Set[Tuple[str, str]] = set()

    # Functions
    functions: Dict[str, Any] = doc.get("functions", {}) or {}
    for fn_id, fn in functions.items():
        fn_name = fn.get("name") or fn_id

        brief, brief_key = get_field(fn, "brief_description", "brief_description_key")
        detailed, detailed_key = get_field(fn, "detailed_description", "detailed_description_key")
        ret_desc, ret_key = get_field(fn, "return_description", "return_description_key")

        if brief:
            add_entry(entries, seen, brief_key or f"func:{fn_name}:brief", brief)
        if detailed:
            add_entry(entries, seen, detailed_key or f"func:{fn_name}:detailed", detailed)
        if ret_desc:
            add_entry(entries, seen, ret_key or f"func:{fn_name}:return", ret_desc)

        for p in fn.get("parameters", []) or []:
            p_name = p.get("name") or "param"
            p_desc, p_key = get_field(p, "description", "description_key")
            if p_desc:
                add_entry(
                    entries,
                    seen,
                    p_key or f"func:{fn_name}:param:{p_name}:description",
                    p_desc,
                )

    # Structures
    structures: Dict[str, Any] = doc.get("structures", {}) or {}
    for struct_name, struct in structures.items():
        s_brief, s_brief_key = get_field(struct, "brief_description", "brief_description_key")
        s_detailed, s_detailed_key = get_field(struct, "detailed_description", "detailed_description_key")

        if s_brief:
            add_entry(entries, seen, s_brief_key or f"struct:{struct_name}:brief", s_brief)
        if s_detailed:
            add_entry(entries, seen, s_detailed_key or f"struct:{struct_name}:detailed", s_detailed)

        for m in struct.get("members", []) or []:
            m_name = m.get("name") or "member"
            m_brief, m_brief_key = get_field(m, "brief_description", "brief_description_key")
            m_detailed, m_detailed_key = get_field(m, "detailed_description", "detailed_description_key")

            if m_brief:
                add_entry(entries, seen, m_brief_key or f"struct:{struct_name}:member:{m_name}:brief", m_brief)
            if m_detailed:
                add_entry(entries, seen, m_detailed_key or f"struct:{struct_name}:member:{m_name}:detailed", m_detailed)

    # Enumerations
    enumerations: Dict[str, Any] = doc.get("enumerations", {}) or {}
    for enum_name, enum in enumerations.items():
        e_brief, e_brief_key = get_field(enum, "brief_description", "brief_description_key")
        e_detailed, e_detailed_key = get_field(enum, "detailed_description", "detailed_description_key")

        if e_brief:
            add_entry(entries, seen, e_brief_key or f"enum:{enum_name}:brief", e_brief)
        if e_detailed:
            add_entry(entries, seen, e_detailed_key or f"enum:{enum_name}:detailed", e_detailed)

        for v in enum.get("values", []) or []:
            v_name = v.get("name") or "value"
            v_brief, v_brief_key = get_field(v, "brief_description", "brief_description_key")
            v_detailed, v_detailed_key = get_field(v, "detailed_description", "detailed_description_key")

            if v_brief:
                add_entry(entries, seen, v_brief_key or f"enum:{enum_name}:value:{v_name}:brief", v_brief)
            if v_detailed:
                add_entry(entries, seen, v_detailed_key or f"enum:{enum_name}:value:{v_name}:detailed", v_detailed)

    entries.sort(key=lambda x: (x[0], x[1]))

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    lines: List[str] = []
    lines.append("/* eslint-disable */")
    lines.append("/**")
    lines.append(" * AUTO-GENERATED FILE. DO NOT EDIT.")
    lines.append(" *")
    lines.append(" * Generated by generate_docs_tr_ts.py from Doxygen JSON output.")
    lines.append(" */")
    lines.append("")
    lines.append(f"import LocalizedString from {ts_string_literal(args.localizedstring_import)};")
    lines.append(f"import tr from {ts_string_literal(args.tr_import)};")
    lines.append("")
    lines.append(f"export const {args.export_name}: Record<string, LocalizedString> = {{")
    for context, msgid in entries:
        lines.append(
            f"  [{ts_string_literal(context)}]: "
            f"tr({ts_string_literal(msgid)}, {ts_string_literal(context)}),"
        )
    lines.append("};")
    lines.append("")

    with open(args.output, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Wrote {len(entries)} doc strings to {args.output}")


if __name__ == "__main__":
    main()