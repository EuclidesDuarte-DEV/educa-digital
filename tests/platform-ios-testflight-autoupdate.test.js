import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = path => readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ios-testflight.yml');
const script = read('ios-app/scripts/publicar-testflight.sh');
const prep = read('ios-app/scripts/prepare_testflight_config.py');
const guide = read('ios-app/TESTFLIGHT_AUTOUPDATE.md');

test('[ios] TestFlight inicia somente apos merge ou execucao manual, usando Xcode 26+', () => {
  assert.match(workflow, /push:\s*\n\s*branches: \[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /'ios-app\/\*\*'/);
  assert.match(workflow, /'public\/static\/channels\/ios\/\*\*'/);
  assert.doesNotMatch(workflow, /pull_request:/);
  assert.match(workflow, /runs-on: macos-26/);
  assert.match(workflow, /needs\.verificar-apple\.outputs\.ready == 'true'/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test('[ios] assinaturas de app e CallKit, segredo isolado e upload autenticado', () => {
  assert.match(prep, /com\.educamaisdigital\.educa\.callerid/);
  assert.match(prep, /group\.com\.educamaisdigital\.educa/);
  assert.match(prep, /get-task-allow/);
  assert.match(prep, /app-store-connect/);
  assert.match(prep, /PROVISIONING_PROFILE_SPECIFIER/);
  assert.match(prep, /run_number \* 100 \+ run_attempt/);
  assert.match(script, /security create-keychain/);
  assert.match(script, /trap cleanup EXIT/);
  assert.match(script, /security cms -D/);
  assert.match(script, /xcodebuild -exportArchive/);
  assert.match(script, /xcrun altool --validate-app/);
  assert.match(script, /xcrun altool --upload-app/);
  assert.doesNotMatch(script, /set -x|actions\/upload-artifact/);
  assert.match(guide, /IOS_CALLERID_PROFILE_BASE64/);
  assert.match(guide, /Automatic Updates/);
});

test('[ios] shell e Python de distribuicao possuem sintaxe valida', () => {
  const shell = spawnSync('bash', ['-n', 'ios-app/scripts/publicar-testflight.sh'], { encoding: 'utf8' });
  assert.equal(shell.status, 0, shell.stderr);
  const py = spawnSync('python3', ['-c', 'import ast, pathlib; ast.parse(pathlib.Path("ios-app/scripts/prepare_testflight_config.py").read_text())'], { encoding: 'utf8' });
  assert.equal(py.status, 0, py.stderr);
});

test('[ios] configurador valida o perfil, gera exportOptions e recusa App Group ausente', () => {
  const pythonCode = String.raw`
import importlib.util
import pathlib
import plistlib
import shutil
import tempfile
p = pathlib.Path('ios-app/scripts/prepare_testflight_config.py')
spec = importlib.util.spec_from_file_location('educa_testflight_config', p)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
team = 'ABCDE12345'
with tempfile.TemporaryDirectory() as tmp:
    d = pathlib.Path(tmp)
    project = d / 'project.yml'
    shutil.copyfile('ios-app/project.yml', project)
    def profile(bundle, name, suffix, group=True):
        x = {
          'UUID': '11111111-2222-3333-4444-' + suffix,
          'Name': name,
          'TeamIdentifier': [team],
          'Entitlements': {
            'application-identifier': team + '.' + bundle,
            'com.apple.security.application-groups': ['group.com.educamaisdigital.educa'] if group else [],
            'get-task-allow': False
          }
        }
        f = d / (name.replace(' ', '_')+'.plist')
        with f.open('wb') as h: plistlib.dump(x,h)
        return f
    app = profile(m.APP_ID, 'Educa App Store', '555555555551')
    ext = profile(m.EXT_ID, 'Educa CallerID App Store', '555555555552')
    exp = d / 'ExportOptions.plist'
    build, appuuid, extuuid = m.prepare(project, app, ext, team, 16, 1, exp)
    assert build == 1601
    assert appuuid != extuuid
    assert 'PROVISIONING_PROFILE_SPECIFIER: "Educa App Store"' in project.read_text()
    assert 'PROVISIONING_PROFILE_SPECIFIER: "Educa CallerID App Store"' in project.read_text()
    assert project.read_text().count('CFBundleVersion: "1601"') == 2
    with exp.open('rb') as h: opts = plistlib.load(h)
    assert opts['method'] == 'app-store-connect'
    assert opts['provisioningProfiles'][m.APP_ID] == 'Educa App Store'
    assert opts['provisioningProfiles'][m.EXT_ID] == 'Educa CallerID App Store'
    bad = profile(m.EXT_ID, 'Invalid CallerID', '555555555553', group=False)
    try:
        m.prepare(project, app, bad, team, 17, 1, exp)
    except ValueError as e:
        assert 'App Group' in str(e)
    else:
        raise AssertionError('Aceitou perfil CallerID sem App Group')
`;
  const result = spawnSync('python3', ['-c', pythonCode], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
