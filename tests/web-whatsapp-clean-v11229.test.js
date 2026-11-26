import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('public/static/js/free-mode.js','utf8');
const css=readFileSync('public/static/css/free-mode.css','utf8');
const html=readFileSync('public/html/index.html','utf8');
const sync=source.split('function syncUI(){')[1].split('\n')[0];
function exercise(dataset,view='chat',active=true,kind='pix'){
 const els={familyActions:{hidden:false},phone:{classList:{toggle:(name,value)=>{assert.equal(name,'free-family-chat');els.reserved=value;}}},form:{hidden:true}};
 const state={active,scenario:{channel:'whatsapp',kind}};
 const context={$:()=>null,els,state,visible:()=>view,isWebTraining:()=>dataset.educaPlatform==='web',document:{documentElement:{dataset}},updateUnread:()=>{}};
 vm.runInNewContext('function syncUI(){'+sync+'\nsyncUI();',context);
 return {hidden:els.familyActions.hidden,reserved:els.reserved,formHidden:els.form.hidden};
}
test('V112.29 Web: sem atalhos de resposta ou espaço vazio no WhatsApp livre',()=>{
 assert.deepEqual(exercise({educaPlatform:'web'}),{hidden:true,reserved:false,formHidden:false});
 assert.deepEqual(exercise({educaPlatform:'web'},'chat',true,'normal'),{hidden:true,reserved:false,formHidden:false});
 assert.deepEqual(exercise({educaPlatform:'web'},'home'),{hidden:true,reserved:false,formHidden:true});
 assert.match(css,/\.free-family-actions\[hidden\].*display:none!important/);
 assert.match(css,/#phoneScreen\.free-active #chatView \.chat-wallpaper\{bottom:75px/);
 assert.match(html,/cleanchat=11229/);
});
test('V112.29 preserva controles nativos e menu de denúncia existente',()=>{
 for(const dataset of [{educaPlatform:'android'},{educaPlatform:'ios'},{educaPlatform:'web',educaNativePlatform:'android'},{educaPlatform:'web',educaNativePlatform:'ios'}])
  assert.deepEqual(exercise(dataset),{hidden:false,reserved:true,formHidden:false});
 assert.match(source,/reportContact:/);
});
