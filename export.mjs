/** Generate all three GitHub-compatible static and animated SVGs, offline. Node 20+. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {constellationEngine} from './engine.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const get=(name,fallback)=>{const i=args.indexOf(name);if(i===-1)return fallback;if(!args[i+1])throw Error(`Missing ${name} value`);return args[i+1]};
if(args.includes('--help')){console.log('node export.mjs [--input JSON] [--out DIR] [--label TEXT]');process.exit(0)}
const demoFixture=resolve(join(here,'fixtures/demo-activity.json'));
const stressFixture=resolve(join(here,'fixtures/streak-demo.json'));
const input=resolve(get('--input',demoFixture));
const out=resolve(get('--out',join(here,'assets')));
const label=get('--label',input===demoFixture?'SYNTHETIC SHARED DEMO':input===stressFixture?'SYNTHETIC STREAK STRESS TEST':undefined);
const payload=JSON.parse(readFileSync(input,'utf8'));
const engine=constellationEngine();const model=engine.parse(payload);
mkdirSync(out,{recursive:true});
for(const design of ['comet','cartographer','starforge'])for(const theme of ['night','paper'])for(const animated of [false,true]){
  const name=`${design}-${theme}-${animated?'animated':'still'}.svg`;
  writeFileSync(join(out,name),engine.render(payload,{design,theme,animated,label}),'utf8');
  console.log(join(out,name));
}
console.log(`${model.active.length} recorded dates, ${model.visibleEvents.length} events, ${model.streaks.length} factual streaks; ${model.source.toUpperCase()} source`);
