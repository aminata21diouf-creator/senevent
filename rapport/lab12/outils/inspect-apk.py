"""Inspection statique d'un APK sans Android SDK.

Lit le manifeste binaire (AXML) pour le package et la version, puis cherche
dans le bundle Hermes les chaines sensibles et les variables injectees.

Usage : python inspect-apk.py <fichier.apk>
"""
import struct
import sys
import zipfile
from pathlib import Path

RES_STRING_POOL = 0x0001
RES_XML_START_ELEMENT = 0x0102


def parse_string_pool(data, offset):
    _type, header_size, _size = struct.unpack_from("<HHI", data, offset)
    count, _styles, flags, strings_start, _styles_start = struct.unpack_from(
        "<IIIII", data, offset + 8
    )
    utf8 = bool(flags & 0x100)
    offsets = struct.unpack_from(f"<{count}I", data, offset + header_size)
    strings = []
    base = offset + strings_start
    for string_offset in offsets:
        pos = base + string_offset
        if utf8:
            length = data[pos]
            pos += 2 if length & 0x80 else 1
            length = data[pos]
            if length & 0x80:
                length = ((length & 0x7F) << 8) | data[pos + 1]
                pos += 2
            else:
                pos += 1
            strings.append(data[pos : pos + length].decode("utf-8", "replace"))
        else:
            length = struct.unpack_from("<H", data, pos)[0]
            pos += 2
            if length & 0x8000:
                length = ((length & 0x7FFF) << 16) | struct.unpack_from("<H", data, pos)[0]
                pos += 2
            strings.append(data[pos : pos + length * 2].decode("utf-16-le", "replace"))
    return strings


def parse_manifest(data):
    strings = []
    elements = []
    offset = 8
    while offset < len(data):
        chunk_type, _header_size, size = struct.unpack_from("<HHI", data, offset)
        if size == 0:
            break
        if chunk_type == RES_STRING_POOL:
            strings = parse_string_pool(data, offset)
        elif chunk_type == RES_XML_START_ELEMENT:
            _ns, name = struct.unpack_from("<II", data, offset + 16)
            attr_start, attr_size, attr_count = struct.unpack_from("<HHH", data, offset + 24)
            attributes = {}
            for index in range(attr_count):
                pos = offset + 16 + attr_start + index * attr_size
                _ans, aname, raw = struct.unpack_from("<III", data, pos)
                _sz, _res0, dtype, dvalue = struct.unpack_from("<HBBI", data, pos + 12)
                key = strings[aname] if aname < len(strings) else hex(aname)
                if raw and raw < len(strings):
                    value = strings[raw]
                elif dtype == 0x03 and dvalue < len(strings):
                    value = strings[dvalue]
                elif dtype == 0x12:
                    value = bool(dvalue)
                else:
                    value = dvalue
                attributes[key] = value
            elements.append((strings[name] if name < len(strings) else "?", attributes))
        offset += size
    return elements


if len(sys.argv) != 2:
    print("Usage : python inspect-apk.py <fichier.apk>")
    raise SystemExit(2)

apk_path = Path(sys.argv[1])
apk = zipfile.ZipFile(apk_path)
raw = apk_path.read_bytes()

print(f"Fichier    : {apk_path.name}")
print(f"Taille     : {len(raw)} octets ({len(raw) / 1024 / 1024:.2f} Mo)")
print(f"Entrees ZIP: {len(apk.namelist())}")

print()
print("MANIFESTE ANDROID")
print("-" * 58)
for name, attributes in parse_manifest(apk.read("AndroidManifest.xml")):
    if name == "manifest":
        print(f"package      : {attributes.get('package')}")
        print(f"versionName  : {attributes.get('versionName')}")
        print(f"versionCode  : {attributes.get('versionCode')}")
    elif name == "activity" and attributes.get("exported"):
        print(f"activite     : {attributes.get('name')}")

print()
print("CONTENU DU BUNDLE")
print("-" * 58)
bundle = apk.read("assets/index.android.bundle")
print(f"bundle Hermes: {len(bundle)} octets")
checks = [
    ("URL Supabase", b"oymhcmowujakgyqpkpjc.supabase.co"),
    ("cle publishable", b"sb_publishable_"),
    ("AsyncStorage", b"AsyncStorage"),
    ("service_role", b"service_role"),
]
for label, needle in checks:
    print(f"{label:<14}: {'present' if needle in bundle else 'absent'}")

print()
print("SIGNATURE")
print("-" * 58)
signature = raw.rfind(b"APK Sig Block 42")
print(f"bloc de signature v2/v3 : {'present' if signature > 0 else 'absent'}")
print(f"libelle de l'application: {'SenEvent' if b'SenEvent' in apk.read('resources.arsc') else 'introuvable'}")
