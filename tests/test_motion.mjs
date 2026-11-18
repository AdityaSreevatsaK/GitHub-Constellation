import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {constellationEngine} from '../engine.mjs';

const api=constellationEngine();
const original=JSON.parse(readFileSync(new URL('../fixtures/demo-activity.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(original);
const make=(dates)=>{const p=clone();p.activity=dates.map((day,i)=>({id:'streak-'+i,kind:'commit',repo_full_name:'sample-dev/aurora',occurred_at:day+'T12:00:00Z',url:'https://github.com/example',count:1}));return p;};

test('Comets never connect visually distant cells when a true run crosses Sunday',()=>{
  const svg=api.render(make(['2026-10-16','2026-10-17','2026-10-18','2026-10-19','2026-10-20']),{design:'comet',animated:true});
  const path=svg.match(/data-streak="0"[^>]* d="([^"]+)"/)?.[1];
  assert.ok(path,'true streak metadata');
  assert.ok(path.includes(' M'),'Sunday begins a new sub-path, not a false diagonal');
  assert.ok(svg.includes('data-wrap='),'week boundary has visual endpoint markers');
});

test('A weekend-only streak animates two date-correct endpoint pulses',()=>{
  const svg=api.render(make(['2026-10-17','2026-10-18']),{design:'comet',animated:true});
  assert.equal((svg.match(/data-wrap-pulse=/g)||[]).length,2);
  assert.ok(svg.includes('data-streak="0"'));
  assert.ok(!svg.includes('<animateMotion path="M'),'zero-length week-wrap paths have no motion animation');
});

test('Comet motion timing uses precise, strictly increasing keyTimes',()=>{
  const svg=api.render(make(['2026-10-12','2026-10-13','2026-10-14','2026-10-15']),{design:'comet',animated:true});
  const times=[...svg.matchAll(/<animateMotion[^>]+keyTimes="([^"]+)"/g)];
  assert.ok(times.length);
  for(const [,s] of times){const t=s.split(';').map(Number);assert.equal(t.length,4);assert.equal(t[0],0);assert.equal(t[3],1);assert.ok(t[0]<t[1]&&t[1]<t[2]&&t[2]<t[3]);}
});

test('Starforge arrivals reveal exactly the visible recorded stars; stills never hide them',()=>{
  const p=make(['2026-10-12','2026-10-13','2026-10-20']);
  const animated=api.render(p,{design:'starforge',animated:true});
  const still=api.render(p,{design:'starforge',animated:false});
  assert.equal((animated.match(/data-target=/g)||[]).length,3);
  assert.equal((animated.match(/values='\.25;\.25;1;1'/g)||[]).length,3);
  assert.equal((still.match(/class="data-star"/g)||[]).length,3);
  assert.ok(!still.includes('<animate'));
});
