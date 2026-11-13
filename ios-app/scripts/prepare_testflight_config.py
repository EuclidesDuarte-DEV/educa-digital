#!/usr/bin/env python3
"""Prepara somente a copia temporaria do projeto para assinatura App Store Connect.

Nao requer dependencias de Python alem da biblioteca padrao.
Nao le chaves privadas. Recebe apenas plists extraidos dos provisioning profiles.
"""
from __future__ import annotations

import argparse
import json
import plistlib
import re
from pathlib import Path

APP_ID = "com.educamaisdigital.educa"
EXT_ID = "com.educamaisdigital.educa.callerid"
APP_GROUP = "group.com.educamaisdigital.educa"


def read_profile(filename: Path, *, team: str, bundle_id: str) -> dict:
    with filename.open("rb") as handle:
        profile = plistlib.load(handle)
    entitlements = profile.get("Entitlements", {})
    teams = profile.get("TeamIdentifier", [])
    expected_identifier = team + "." + bundle_id
    if team not in teams:
        raise ValueError(f"O provisionamento de {bundle_id} nao pertence ao Team ID informado")
    if entitlements.get("application-identifier") != expected_identifier:
        raise ValueError(f"O perfil de {bundle_id} nao e um App ID explicito valido")
    if APP_GROUP not in entitlements.get("com.apple.security.application-groups", []):
        raise ValueError(f"O perfil de {bundle_id} nao inclui o App Group necessario ao CallKit")
    if entitlements.get("get-task-allow", True):
        raise ValueError(f"O perfil de {bundle_id} nao e de distribuicao App Store")
    name, uuid = profile.get("Name"), profile.get("UUID")
    if not name or not uuid:
        raise ValueError(f"Nome ou UUID do perfil de {bundle_id} ausente")
    return {"Name": name, "UUID": uuid}


def prepare(project_path: Path, app_profile: Path, extension_profile: Path,
            team: str, run_number: int, run_attempt: int,
            export_options: Path) -> tuple[int, str, str]:
    if not re.fullmatch(r"[A-Z0-9]{10}", team):
        raise ValueError("APPLE_TEAM_ID deve conter 10 caracteres A-Z ou 0-9")
    if not (1 <= run_attempt <= 99 and run_number >= 1):
        raise ValueError("Numero da execucao invalido")
    app = read_profile(app_profile, team=team, bundle_id=APP_ID)
    ext = read_profile(extension_profile, team=team, bundle_id=EXT_ID)
    project = project_path.read_text(encoding="utf-8")

    # Monotono entre execucoes deste workflow; nao reutiliza a versao assinada.
    build_number = run_number * 100 + run_attempt
    matches = re.findall(r'^\s*CFBundleVersion: "[0-9]+"\s*$', project, re.M)
    if len(matches) != 2:
        raise ValueError("O projeto deve conter exatamente dois CFBundleVersion")
    project = re.sub(r'(?m)^(\s*CFBundleVersion: )"[0-9]+"$',
                     lambda m: m.group(1) + '"' + str(build_number) + '"', project)

    for product_name, data in (("EducaDigital", app), ("EducaCallerID", ext)):
        line = "        PRODUCT_NAME: " + product_name
        if project.count(line) != 1:
            raise ValueError(f"Target {product_name} nao encontrado uma unica vez")
        additional = (
            "\n        DEVELOPMENT_TEAM: " + json.dumps(team) +
            "\n        CODE_SIGN_STYLE: Manual" +
            "\n        PROVISIONING_PROFILE_SPECIFIER: " + json.dumps(data["Name"], ensure_ascii=False)
        )
        project = project.replace(line, line + additional, 1)

    project_path.write_text(project, encoding="utf-8")
    options = {
        "method": "app-store-connect",
        "destination": "export",
        "teamID": team,
        "signingStyle": "manual",
        "signingCertificate": "Apple Distribution",
        "manageAppVersionAndBuildNumber": False,
        "provisioningProfiles": {
            APP_ID: app["Name"],
            EXT_ID: ext["Name"]
        }
    }
    with export_options.open("wb") as handle:
        plistlib.dump(options, handle)
    return build_number, app["UUID"], ext["UUID"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--app-profile", type=Path, required=True)
    parser.add_argument("--extension-profile", type=Path, required=True)
    parser.add_argument("--team", required=True)
    parser.add_argument("--run-number", type=int, required=True)
    parser.add_argument("--run-attempt", type=int, required=True)
    parser.add_argument("--export-options", type=Path, required=True)
    args = parser.parse_args()
    number, app_uuid, ext_uuid = prepare(
        args.project, args.app_profile, args.extension_profile,
        args.team, args.run_number, args.run_attempt, args.export_options
    )
    print(f"Projeto preparado para TestFlight: build {number}, dois perfis de distribuicao validados")
    print(f"App profile UUID: {app_uuid} | CallKit profile UUID: {ext_uuid}")


if __name__ == "__main__":
    main()
