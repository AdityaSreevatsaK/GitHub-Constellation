/** Validate untrusted action inputs before running a collector or writing files. */
import {appendFileSync,existsSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,sep} from 'node:path';
const workspace=realpathSync(process.env.GITHUB_WORKSPACE||process.cwd());
const username=process.env.INPUT_USERNAME||process.env.GITHUB_REPOSITORY_OWNER;
const design=process.env.INPUT_DESIGN||'comet';
const theme=process.env.INPUT_THEME||'night';
const output=process.env.INPUT_OUTPUT_DIR||'constellation';
if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(username||'')||username.includes('--'))throw Error('Invalid GitHub username');
if(!['all','comet','cartographer','starforge'].includes(design))throw Error('Invalid design');
if(!['both','night','paper'].includes(theme))throw Error('Invalid theme');
if(typeof output!=='string'||output.length>180||output.includes('\0')||output.includes('\\')||isAbsolute(output))throw Error('Invalid output path');
const parts=output.split('/');
if(parts.some(p=>!p||p==='.'||p==='..'||p==='.git')||output.includes('\n'))throw Error('Unsafe output path');
const target=resolve(workspace,output),rel=relative(workspace,target);
if(!rel||rel.startsWith('..'+sep)||rel==='..'||isAbsolute(rel))throw Error('Output must be inside workspace');
let prefix=workspace;
for(const part of parts){
  prefix=resolve(prefix,part);
  if(existsSync(prefix)){
    const real=realpathSync(prefix),safe=relative(workspace,real);
    if(safe==='..'||safe.startsWith('..'+sep)||isAbsolute(safe))throw Error('Output path follows a symlink outside workspace');
  }
}
if(!process.env.GITHUB_OUTPUT)throw Error('This helper runs only in a GitHub Action');
appendFileSync(process.env.GITHUB_OUTPUT,'username='+username+'\ndesign='+design+'\ntheme='+theme+'\noutput_dir='+target+'\n');
console.log('Validated Constellation output path and render options');
