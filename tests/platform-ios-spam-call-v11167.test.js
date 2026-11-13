import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = file => readFileSync(file,'utf8');
const yaml=read('ios-app/project.yml');
const app=read('ios-app/EducaDigital/EducaDigitalApp.swift');
const view=read('ios-app/EducaDigital/CallProtectionView.swift');
const ext=read('ios-app/CallerIDExtension/CallDirectoryProvider.swift');
const store=read('ios-app/Shared/SpamNumberStore.swift');
const web=read('ios-app/EducaDigital/CloudflareTrainingWebView.swift');
const local=read('public/static/channels/ios/overrides.js');

test('[ios] extensão real Call Directory está embutida no aplicativo nativo',()=>{
 assert.match(yaml,/CallerIDExtension:\s*\n\s*type: app-extension/);
 assert.match(yaml,/target: CallerIDExtension\s*\n\s*embed: true/);
 assert.match(yaml,/com\.apple\.callkit\.call-directory/);
 assert.match(yaml,/NSExtensionPrincipalClass: "\$\(PRODUCT_MODULE_NAME\)\.CallDirectoryProvider"/);
 assert.match(yaml,/PRODUCT_BUNDLE_IDENTIFIER: com\.educamaisdigital\.educa\.callerid/);
 assert.match(yaml,/CFBundleShortVersionString: "111\.71"/);
 assert.match(yaml,/com\.apple\.security\.application-groups:[\s\S]*?group\.com\.educamaisdigital\.educa/);
});

test('[ios] identifica somente números escolhidos, sem marcação global ou bloqueio',()=>{
 assert.match(ext,/class CallDirectoryProvider: CXCallDirectoryProvider/);
 assert.match(ext,/SpamNumberStore\.read\(\)/);
 assert.match(ext,/addIdentificationEntry\(/);
 assert.match(ext,/label: "Educa\+: possível spam \(marcado por você\)"/);
 assert.match(ext,/context\.isIncremental/);
 assert.match(ext,/removeIdentificationEntry\(/);
 assert.match(ext,/SpamNumberStore\.applied\(\)/);
 assert.doesNotMatch(ext,/addBlockingEntry\(|removeAllBlockingEntries\(/);
 assert.doesNotMatch(ext,/URLSession|https?:\/\/|Contacts|CNContactStore|CoreTelephony/);
 assert.match(ext,/completeRequest\(completionHandler:/);
 assert.match(ext,/if !expired/);
});

test('[ios] lista é local privada e exige número validado pelo usuário',()=>{
 assert.match(store,/UserDefaults\(suiteName: appGroup\)/);
 assert.match(store,/maximumEntries = 1_000/);
 assert.match(store,/Int64\(result\)/);
 assert.match(store,/result\.first != "0"/);
 assert.match(store,/result = "55" \+ numbers/);
 assert.match(store,/numbers\.count == 10 \|\| numbers\.count == 11/);
 assert.match(store,/read\(\) -> \[String\]/);
 assert.match(store,/static func write\(/);
 assert.doesNotMatch(store,/Cloudflare|URLSession|CNContact|fetch\(/);
});

test('[ios] app usa botão nativo para ativar, editar e remover suspeitos',()=>{
 assert.match(app,/@State private var showingCallProtection/);
 assert.match(app,/Image\(systemName: "shield\.lefthalf\.filled"\)/);
 assert.match(app,/CallProtectionView\(\)/);
 assert.match(view,/CXCallDirectoryManager\.sharedInstance\.getEnabledStatusForExtension/);
 assert.match(view,/CXCallDirectoryManager\.sharedInstance\.openSettings/);
 assert.match(view,/CXCallDirectoryManager\.sharedInstance\.reloadExtension/);
 assert.match(view,/SpamNumberStore\.normalize\(newPhone\)/);
 assert.match(view,/SpamNumberStore\.write\(/);
 assert.match(view,/func remove\(/);
 assert.match(view,/Desconhecido não significa golpista/);
 assert.match(view,/não bloqueia chamadas/);
});

test('[ios] aviso fictício não é mais injetado no protótipo; CallKit segue nativo',()=>{
 assert.doesNotMatch(web,/simulatedCallerWarning|educa-ios-training-caller-warning/);
 assert.match(web,/platform=ios/);
 assert.match(ext,/addIdentificationEntry\(/);
 assert.doesNotMatch(local,/V111\.71/);
});
