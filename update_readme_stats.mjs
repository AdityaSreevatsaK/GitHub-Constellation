/**
 * Keep the README's real-calendar summary consistent with regenerated images.
 * No raw snapshot, token or private-repository metadata is committed.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {constellationEngine} from './engine.mjs';

const START='<!-- CONSTELLATION_SUMMARY_START -->';
const END='<!-- CONSTELLATION_SUMMARY_END -->';

export function updateReadmeSummary(readme, snapshot) {
  if(typeof readme!=='string')throw Error('README must be text');
  const engine=constellationEngine();
  const model=engine.parse(snapshot);
  if(model.metric!=='official'||model.source!=='github_contribution_calendar')throw Error('Verified official calendar required');
  const start=readme.indexOf(START),end=readme.indexOf(END);
  if(start<0||end<start||readme.indexOf(START,start+START.length)!==-1||readme.indexOf(END,end+END.length)!==-1)throw Error('README requires exactly one ordered summary marker pair');
  const fetched=new Date(snapshot.fetched_at);
  if(!Number.isFinite(fetched.getTime()))throw Error('Invalid official collection timestamp');
  const stamp=fetched.toISOString().slice(0,16).replace('T',' ')+' UTC';
  const summary='**Snapshot verified:** '+stamp+
    '. **'+model.totalUnits.toLocaleString('en-GB')+
    ' API-visible GitHub contributions** across **'+model.active.length+
    ' active dates** and **'+model.streaks.length+' consecutive active-day runs**.';
  return readme.slice(0,start)+START+'\n'+summary+'\n'+readme.slice(end);
}

const script=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(script){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=='--input'||args[2]!=='--readme')throw Error('Usage: node update_readme_stats.mjs --input JSON --readme README.md');
  const source=resolve(args[1]),destination=resolve(args[3]);
  const payload=JSON.parse(readFileSync(source,'utf8'));
  const previous=readFileSync(destination,'utf8'),updated=updateReadmeSummary(previous,payload);
  if(updated!==previous)writeFileSync(destination,updated,'utf8');
  console.log('Updated verified, API-visible README contribution summary without committing raw calendar data');
}
