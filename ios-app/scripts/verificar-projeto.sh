#!/usr/bin/env bash
set -euo pipefail
# Validações estruturais simples para execução local e no CI.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
grep -Fq 'https://educa-digital.educamaisdigital.workers.dev/?app=1' ios-app/EducaDigital/CloudflareTrainingWebView.swift
grep -Fq 'requestMediaCapturePermissionFor' ios-app/EducaDigital/CloudflareTrainingWebView.swift
grep -Fq 'decisionHandler(trusted ? .prompt : .deny)' ios-app/EducaDigital/CloudflareTrainingWebView.swift
grep -Fq 'CloudflareTrainingWebView' ios-app/EducaDigital/EducaDigitalApp.swift
grep -Fq 'CODE_SIGNING_ALLOWED=NO' .github/workflows/ios-native-v11159.yml
test -s public/static/icons_pwa/icon-512.png
echo "Fontes iOS, permissões, URL e compilação sem segredos: OK"
