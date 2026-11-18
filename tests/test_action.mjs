import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,mkdirSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

function run(input){
  const root=mkdtempSync(join(tmpdir(),'constellation-action-'));
  const out=join(root,'output.txt');
  try{
    mkdirSync(join(root,'assets'));
    const env={...process.env,GITHUB_WORKSPACE:root,GITHUB_OUTPUT:out,
      GITHUB_REPOSITORY_OWNER:'Account123',INPUT_USERNAME:'Account123',
      INPUT_DESIGN:'comet',INPUT_THEME:'night',INPUT_OUTPUT_DIR:'assets/constellation',...input};
    const result=spawnSync(process.execPath,[new URL('../validate-action.mjs',import.meta.url).pathname],{env,encoding:'utf8'});
    return {status:result.status,stderr:result.stderr,
      output:result.status===0?readFileSync(out,'utf8'):''};
  }finally{rmSync(root,{recursive:true,force:true});}
}

test('valid action config emits only safe validated output values',()=>{
  const r=run({});
  assert.equal(r.status,0,r.stderr);
  assert.match(r.output,/username=Account123/);
  assert.match(r.output,/design=comet/);
  assert.match(r.output,/theme=night/);
});
test('unsafe destinations and source options fail before any files are generated',()=>{
  for(const options of [
    {INPUT_USERNAME:'evil/owner'},
    {INPUT_USERNAME:'ab--cd'},
    {INPUT_DESIGN:'random'},
    {INPUT_THEME:'green'},
    {INPUT_OUTPUT_DIR:'../secret'},
    {INPUT_OUTPUT_DIR:'/etc/passwd'},
    {INPUT_OUTPUT_DIR:'assets/../../foo'},
    {INPUT_OUTPUT_DIR:'.git/config'},
    {INPUT_OUTPUT_DIR:'assets\\bad'},
    {INPUT_OUTPUT_DIR:'out\nbad'},
  ]){const r=run(options);assert.notEqual(r.status,0,JSON.stringify(options));}
});
