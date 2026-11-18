/** Generate all three GitHub-compatible static and animated SVGs, offline. Node 20+. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {constellationEngine} from './engine.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const get=(name,fallback)=>{const i=args.indexOf(name);if(i===-1)return fallback;if(!args[i+1])throw Error(`Missing ${name} value`);return args[i+1]};
if(args.includes('--help')){console.log('node export.mjs [--input JSON] [--out DIR] [--label TEXT] [--design comet|cartographer|starforge|all] [--theme night|paper|both]');process.exit(0)}
const demoFixture=resolve(join(here,'fixtures/demo-activity.json'));
const stressFixture=resolve(join(here,'fixtures/streak-demo.json'));
const input=resolve(get('--input',demoFixture));
const out=resolve(get('--out',join(here,'assets')));
const label=get('--label',input===demoFixture?'SYNTHETIC SHARED DEMO':input===stressFixture?'SYNTHETIC STREAK STRESS TEST':undefined);
const requestedDesign=get('--design','all'),requestedTheme=get('--theme','both');
if(!['all','comet','cartographer','starforge'].includes(requestedDesign)||!['both','night','paper'].includes(requestedTheme))throw Error('Invalid design or theme');
const payload=JSON.parse(readFileSync(input,'utf8'));
const engine=constellationEngine();const model=engine.parse(payload);
mkdirSync(out,{recursive:true});
for(const design of requestedDesign==='all'?['comet','cartographer','starforge']:[requestedDesign])for(const theme of requestedTheme==='both'?['night','paper']:[requestedTheme])for(const animated of [false,true]){
  const name=`${design}-${theme}-${animated?'animated':'still'}.svg`;
  writeFileSync(join(out,name),engine.render(payload,{design,theme,animated,label}),'utf8');
  console.log(join(out,name));
}
console.log(model.metric==='official'?`${model.active.length} active dates, ${model.totalUnits} GitHub API-visible contributions for @${model.login}; ${model.streaks.length} factual streaks`:`${model.active.length} recorded dates, ${model.visibleEvents.length} events, ${model.streaks.length} factual streaks; ${model.source.toUpperCase()} source`);
