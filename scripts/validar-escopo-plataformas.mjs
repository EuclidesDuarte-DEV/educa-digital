/**
 * V111.60 — prevenção de atualizações cruzadas.
 * Comum: impacta Web/Android/iOS. Scoped: limita alterações às pastas exclusivas.
 * Não utiliza dados externos nem modifica arquivos.
 */
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const SCOPES = Object.freeze(['all','web','android','ios','mobile']);
export function scopeFromTitle(title='') {
  const match=String(title).match(/^\s*\[(all|web|android|ios|mobile)\](?:\s|:|$)/i);
  return match ? match[1].toLowerCase() : 'all';
}
export function classify(file) {
  const p=String(file||'').replaceAll('\\','/').replace(/^\/+/,'');
  if (p.startsWith('public/static/channels/web/')||p.startsWith('docs/plataformas/web/')||p.startsWith('tests/platform-web-')) return 'web';
  if (p.startsWith('public/static/channels/android/')||p.startsWith('android-app/')||p.startsWith('docs/plataformas/android/')||p.startsWith('tests/platform-android-')) return 'android';
  if (p.startsWith('public/static/channels/ios/')||p.startsWith('ios-app/')||p.startsWith('docs/plataformas/ios/')||p.startsWith('tests/platform-ios-')) return 'ios';
  // HTML principal, IA, conteúdo, D1, service worker e assets gerais são compartilhados.
  return 'shared';
}
export function allowedFile(file, scope) {
  if (!SCOPES.includes(scope)) return false;
  if (scope==='all') return true;
  const category=classify(file);
  if (scope==='mobile') return ['android','ios'].includes(category);
  return category===scope;
}
export function validate(files,scope) {
  if (!SCOPES.includes(scope)) return {ok:false,blocked:files,scope};
  const blocked=files.filter(file=>!allowedFile(file,scope));
  return {ok:blocked.length===0,blocked,scope};
}
function main(args) {
  let scope='all',files=null;
  for(let i=0;i<args.length;i++){
    if(args[i]==='--scope') scope=String(args[++i]||'');
    else if(args[i]==='--title') scope=scopeFromTitle(args[++i]);
    else if(args[i]==='--files'){files=args.slice(i+1);break;}
  }
  if(files===null) {
    const at=args.indexOf('--base');
    const ht=args.indexOf('--head');
    if(at<0||ht<0||!args[at+1]||!args[ht+1]){
      console.error('Uso: --scope web|android|ios|mobile|all --files arq... OU --title "[web] ..." --base SHA --head SHA');
      process.exitCode=2;return;
    }
    const diff=execFileSync('git',['diff','--name-only','--diff-filter=ACMR',args[at+1]+'...'+args[ht+1]],{encoding:'utf8'});
    files=diff.trim()?diff.trim().split(/\r?\n/):[];
  }
  const result=validate(files,scope);
  console.log(JSON.stringify({scope:result.scope,files:files.length,blocked:result.blocked,ok:result.ok},null,2));
  if(!result.ok){
    console.error('Escopo EXCLUSIVO bloqueado: alterações compartilhadas/fora da plataforma.');
    process.exitCode=1;
  }
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])main(process.argv.slice(2));
