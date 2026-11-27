import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const html=read('public/html/index.html');
const routing=read('public/static/js/platform-channel-v11160.js');
const manifest=JSON.parse(read('public/static/manifest.webmanifest'));
const ios=read('ios-app/EducaDigital/CloudflareTrainingWebView.swift');
const swift=read('ios-app/EducaDigital/EducaDigitalApp.swift');
const yaml=read('ios-app/project.yml');
const java=read('android-app/app/src/main/java/com/educamaisdigital/educa/MainActivity.java');
const gradle=read('android-app/app/build.gradle');
const iosChannel=read('public/static/channels/ios/overrides.js');
const iosCss=read('public/static/channels/ios/overrides.css');
const releases=JSON.parse(read('public/static/release-channels.json'));
const audit=read('scripts/validar-mobile-parity-v11222.mjs');

test('V112.22: somente nova entrada Android/iOS PWA ignora regra legacy de celular imersivo',()=>{
 const i=html.indexOf("const parity=query.get('experience')==='web'");
 const old=html.indexOf("document.documentElement.classList.add('educa-mobile-app')");
 assert.ok(i>=0&&i<old);
 assert.match(html,/!parity && \(installed\|\|nativeAndroid\|\|query.get\('app'\)==='1'\)/);
 assert.match(manifest.start_url,/\/html\/\?experience=web/);
 assert.equal(manifest.id,'/?app=1','ID da instalação não mudou; preservar identidade do PWA');
});

test('V112.22: UI Web completa sem perda dos dois canais físicos',()=>{
 assert.doesNotThrow(()=>new vm.Script(routing));
 assert.match(routing,/const renderPlatform = mobileParity \? 'web' : platform/);
 assert.match(routing,/dataset.educaNativePlatform = platform/);
 assert.match(routing,/EducaReleaseChannel = Object.freeze/);
 assert.match(routing,/renderPlatform,/);
 assert.match(routing,/11222/);
 assert.match(routing,/\/static\/channels\/web\/overrides\.css\?v=11190&fix=11208/);
 assert.match(routing,/\/static\/channels\/web\/overrides\.js\?v=11190&fix=11212/);
 for(const marker of ['web-quick-result-v11210.css','web-level-badge-v11211.css',
   'web-family-photo-v11212.css','web-contact-profile-v11214.css',
   'web-chat-photo-scroll-v11215.css','web-apps-light-notices-v11218.css',
   'web-light-youtube-maps-agenda-v11219.css','web-call-touch-light-v11220.css',
   'web-compact-toolbars-v11221.css','web-touch-recovery-v11220.js',
   'web-apps-v11216.js','web-more-apps-v11219.js']){
   assert.ok(html.includes(marker),marker+' não carregado na UI compartilhada');
 }
 for(const part of ['android','ios']){
  assert.equal(releases.channels[part].native,'112.31');
  assert.equal(releases.channels[part].interface,'112.84');
 }
});

test('V112.22: rotas nativas abrem a mesma Home e não a tela Android escura',()=>{
 for(const source of [ios,java]){
  assert.match(source,/\/html\/\?app=1&platform=(ios|android)&experience=web/);
  assert.match(source,/educa-digital\.educamaisdigital\.workers\.dev/);
 }
 assert.doesNotMatch(swift,/showingCallProtection|CallProtectionView\(\)|shield\.lefthalf\.filled|statusBarHidden\(\)/);
 assert.match(swift,/Color\.white\.ignoresSafeArea\(\)/);
 assert.match(swift,/\.preferredColorScheme\(\.light\)/);
 assert.match(ios,/webView\.backgroundColor = UIColor\.white/);
 assert.match(java,/getWindow\(\)\.clearFlags\(WindowManager\.LayoutParams\.FLAG_FULLSCREEN\)/);
 assert.match(java,/getWindow\(\)\.setStatusBarColor\(Color\.rgb\(247, 250, 255\)\)/);
 assert.equal((yaml.match(/CFBundleShortVersionString: "112\.31"/g)||[]).length,2);
 assert.match(gradle,/versionCode 11231/);
 assert.match(gradle,/versionName '112\.31'/);
});

test('V112.22: iOS sem launcher flutuante PWA ou nativo, mantendo apenas CallKit voluntário',()=>{
 assert.doesNotThrow(()=>new vm.Script(iosChannel));
 assert.match(iosChannel,/floatingCallProtection:false/);
 assert.doesNotMatch(iosChannel,/createElement\(|showModal|addEventListener\('click'/);
 assert.doesNotMatch(iosCss,/educa-ios-safety-launcher|educa-ios-safety-dialog/);
 assert.match(read('ios-app/CallerIDExtension/CallDirectoryProvider.swift'),/addIdentificationEntry\(/);
 assert.doesNotMatch(swift,/RealCallEventBridge|\.sheet\(isPresented:/);
});

test('V112.22: Android mantém controles de domínio e permissões, com fotos realmente selecionáveis',()=>{
 assert.match(java,/onShowFileChooser\(WebView view,/);
 assert.match(java,/ValueCallback<Uri\[\]> callback/);
 assert.match(java,/picker\.setType\("image\/\*"\)/);
 assert.match(java,/startActivityForResult\(picker, PHOTO_PICKER_CODE\)/);
 assert.match(java,/FileChooserParams\.parseResult\(resultCode, data\)/);
 assert.match(java,/pendingPhotoSelection\.onReceiveValue\(null\)/);
 assert.match(java,/getWindow\(\)\.setNavigationBarColor/);
 assert.match(java,/if \(!trusted\(request\.getOrigin\(\)\)\)/);
 assert.match(java,/settings\.setAllowFileAccess\(false\)/);
 assert.match(java,/settings\.setMixedContentMode\(WebSettings\.MIXED_CONTENT_NEVER_ALLOW\)/);
 assert.match(java,/if \(request\.isForMainFrame\(\) && !trusted\(request\.getUrl\(\)\)\)/);
});
test('V112.22: browser automatizado cobre iOS/Android, viewport, modo dark e toques',()=>{
 assert.match(audit,/chromium,webkit/);
 assert.match(audit,/colorScheme:'dark'/);
 assert.match(audit,/\.tap\(/);
 assert.match(audit,/MOBILE_PARITY_V11222_OK/);
 assert.match(audit,/headless:true/);
});

test('V112.84: Android e iOS recebem o espaçamento de nível pela paridade Web',()=>{
 const css=read('public/static/css/web-level-badge-v11211.css');
 assert.match(css,/html\[data-educa-platform="web"\] #phoneScreen #learningView \.learning-surface\s*\{\s*padding-top: 38px !important/);
 assert.ok(html.includes('web-level-badge-v11211.css?v=11211&spacing=11284'));
 assert.equal(releases.channels.web.interface,'112.84');
 const badgeAudit=read('scripts/validar-level-badge-v11211.mjs');
 assert.ok(badgeAudit.includes('experience=web'));
 assert.ok(badgeAudit.includes("platform:'android'"));
 assert.ok(badgeAudit.includes("platform:'ios'"));
});
