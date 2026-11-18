/** GitHub-first Constellation v3. Pure offline calendar model and SVG artwork. */
export function constellationEngine() {
  const WIDTH=1200, HEIGHT=390, COLS=53, ROWS=7;
  const X=156, Y=144, STEP=18.55, VSTEP=19.4, CELL=13.6, LOOP=16;
  const kinds=new Set(['commit','pr_opened','pr_merged','issue_opened','release']);
  const themes={
    night:{bg:'#080f23',bg2:'#122640',text:'#f2f6ff',muted:'#a7b9d2',line:'#49617e',tile:'#182a43',tileBorder:'#39516d',future:'#111b30',accent:'#a3e9e4',sub:'#cbd7e9',flame:'#f3bd81',levels:['#448b9c','#4eacc6','#70cfd1','#c7f7e5'],ink:'#142943',paper:false},
    paper:{bg:'#f9f6eb',bg2:'#e6eee7',text:'#20394b',muted:'#627986',line:'#a0b5b6',tile:'#e2e9e0',tileBorder:'#a9beb9',future:'#f0f0e7',accent:'#087e83',sub:'#3e666c',flame:'#b56a38',levels:['#9ac5c1','#64adaa','#278d94','#12636f'],ink:'#f9f6eb',paper:true}
  };
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validName=(v,where)=>{if(typeof v!=='string'||!v.trim()||v.length>180)throw Error('Invalid '+where);return v.trim();};
  const validURL=v=>{if(typeof v!=='string'||v.length>500)throw Error('Invalid URL');let u;try{u=new URL(v);}catch{throw Error('Invalid URL');}if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password||u.port)throw Error('Only public GitHub URLs supported');return v;};
  const utcMillis=v=>{if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|\+00:00)$/.test(v))throw Error('UTC timestamp required');const t=Date.parse(v);if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==v.slice(0,10))throw Error('Invalid timestamp');return t;};
  const iso=t=>new Date(t).toISOString().slice(0,10);
  const DAY=86400000;

  /** A separate, validated contract for the official contribution calendar. No fake events. */
  function parseOfficial(snapshot) {
    if(!snapshot||snapshot.schema_version!=='2-official-calendar'||snapshot.source!=='github_contribution_calendar'||snapshot.visibility!=='api_visible')throw Error('Official calendar source required');
    const login=validName(snapshot.user?.login,'user.login');
    if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(login)||login.includes('--'))throw Error('Invalid GitHub login');
    if(snapshot.user.url!=='https://github.com/'+login)throw Error('Official profile URL mismatch');
    const dateValue=v=>{if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v))throw Error('Invalid official date');const ms=Date.parse(v+'T00:00:00Z');if(!Number.isFinite(ms)||iso(ms)!==v)throw Error('Invalid official date');return ms;};
    const generated=dateValue(snapshot.as_of);
    if(!Number.isFinite(Date.parse(snapshot.fetched_at))||typeof snapshot.fetched_at!=='string')throw Error('Invalid official collection timestamp');
    const start=generated-(52*7+new Date(generated).getUTCDay())*DAY;
    if(snapshot.window?.from!==iso(start)||snapshot.window?.to!==snapshot.as_of)throw Error('Official calendar range mismatch');
    if(!Array.isArray(snapshot.calendar_days)||snapshot.calendar_days.length!==(generated-start)/DAY+1)throw Error('Incomplete official calendar');
    const levels={NONE:0,FIRST_QUARTILE:1,SECOND_QUARTILE:2,THIRD_QUARTILE:3,FOURTH_QUARTILE:4};
    const byDate=new Map();
    for(let i=0;i<snapshot.calendar_days.length;i++){
      const d=snapshot.calendar_days[i],date=iso(start+i*DAY);
      if(!d||d.date!==date||!Number.isSafeInteger(d.contribution_count)||d.contribution_count<0||d.contribution_count>1e6||!Object.prototype.hasOwnProperty.call(levels,d.contribution_level))throw Error('Invalid official day or incomplete ordered coverage');
      if((d.contribution_count===0)!==(d.contribution_level==='NONE'))throw Error('Official count/level mismatch');
      byDate.set(date,d);
    }
    const cells=[];
    for(let i=0;i<COLS*ROWS;i++){
      const date=iso(start+i*DAY),d=byDate.get(date),units=d?.contribution_count??0,level=d?levels[d.contribution_level]:0;
      cells.push({date,index:i,col:Math.floor(i/7),row:i%7,units,level,
        future:start+i*DAY>generated,events:[],active:units>0,
        x:X+Math.floor(i/7)*STEP,y:Y+(i%7)*VSTEP});
    }
    const active=cells.filter(d=>d.active),streaks=[];let current=[];
    for(const day of active){if(current.length&&day.index!==current.at(-1).index+1){if(current.length>1)streaks.push(current);current=[];}current.push(day);}
    if(current.length>1)streaks.push(current);
    const totalUnits=active.reduce((sum,d)=>sum+d.units,0);
    if(!Number.isSafeInteger(snapshot.displayed_contributions)||snapshot.displayed_contributions!==totalUnits)throw Error('Official displayed total mismatch');
    return {login,source:snapshot.source,metric:'official',generated:iso(generated),start:iso(start),
      end:iso(start+(COLS*ROWS-1)*DAY),cells,active,streaks,events:[],visibleEvents:[],totalUnits};
  }

  function parse(snapshot) {
    if(snapshot?.schema_version==='2-official-calendar')return parseOfficial(snapshot);
    if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)||snapshot.schema_version!=='1'||!['demo','github'].includes(snapshot.source))throw Error('Contract-v1 demo/github snapshot required');
    const generated=utcMillis(snapshot.generated_at);
    if(!snapshot.user||typeof snapshot.user!=='object')throw Error('Missing user');
    const login=validName(snapshot.user.login,'user.login');validURL(snapshot.user.url);
    if(!Array.isArray(snapshot.repositories)||snapshot.repositories.length>500||!Array.isArray(snapshot.activity)||snapshot.activity.length>10000)throw Error('Invalid snapshot arrays');
    const repos=new Map();
    for(const item of snapshot.repositories){if(!item||typeof item!=='object')throw Error('Invalid repository');const name=validName(item.full_name,'repository.full_name');if(!/^[^/]+\/[^/]+$/.test(name)||repos.has(name))throw Error('Duplicate or invalid repository');validURL(item.url);if(item.stars!==undefined&&(!Number.isInteger(item.stars)||item.stars<0||item.stars>1e8))throw Error('Invalid repository stars');repos.set(name,{name:validName(item.name??name.split('/')[1],'repository.name'),url:item.url,language:item.language??'Unspecified'});}
    const seen=new Set(),events=[];
    for(const entry of snapshot.activity){if(!entry||typeof entry!=='object')throw Error('Invalid event');const id=validName(entry.id,'event.id');if(seen.has(id))continue;const date=utcMillis(entry.occurred_at);const repo=validName(entry.repo_full_name,'event.repo_full_name');if(date>generated||!kinds.has(entry.kind)||!repos.has(repo)||!Number.isInteger(entry.count)||entry.count<1||entry.count>1e6)throw Error('Invalid event');validURL(entry.url);seen.add(id);events.push({id,when:date,date:iso(date),repo,kind:entry.kind,count:entry.count,url:entry.url});}
    events.sort((a,b)=>a.when-b.when||a.id.localeCompare(b.id));
    const generatedDay=Date.parse(iso(generated)+'T00:00:00Z');
    const sunday=generatedDay-new Date(generatedDay).getUTCDay()*DAY;
    const start=sunday-52*7*DAY;
    const grouped=new Map();
    for(const event of events){const stamp=Date.parse(event.date+'T00:00:00Z');if(stamp>=start&&stamp<=generatedDay){if(!grouped.has(event.date))grouped.set(event.date,[]);grouped.get(event.date).push(event);}}
    const cells=[];
    for(let i=0;i<COLS*ROWS;i++){
      const date=iso(start+i*DAY),dayEvents=grouped.get(date)||[];
      const units=dayEvents.reduce((sum,event)=>sum+event.count,0);
      cells.push({date,index:i,col:Math.floor(i/7),row:i%7,units,level:units===0?0:units===1?1:units<=3?2:units<=6?3:4,future:start+i*DAY>generatedDay,events:dayEvents,active:dayEvents.length>0,x:X+Math.floor(i/7)*STEP,y:Y+(i%7)*VSTEP});
    }
    const active=cells.filter(day=>day.active),streaks=[];let current=[];
    for(const day of active){if(current.length&&day.index!==current.at(-1).index+1){if(current.length>1)streaks.push(current);current=[];}current.push(day);}
    if(current.length>1)streaks.push(current);
    return {login,source:snapshot.source,generated:iso(generated),start:iso(start),end:iso(start+(COLS*ROWS-1)*DAY),cells,active,streaks,events,visibleEvents:active.flatMap(d=>d.events),totalUnits:active.reduce((sum,d)=>sum+d.units,0)};
  }
  const n=v=>Number(v).toFixed(1).replace(/\.0$/,'');
  function starPath(cx,cy,r,points=4){let path='';for(let i=0;i<points*2;i++){const a=Math.PI*i/points-Math.PI/2,rad=i%2?r*.33:r;path+=(i?' L':'M')+n(cx+Math.cos(a)*rad)+' '+n(cy+Math.sin(a)*rad);}return path+' Z';}
  const pos=d=>({x:d.x+CELL/2,y:d.y+CELL/2});
  function render(snapshot,options={}) {
    const model=parse(snapshot),design=options.design??'comet',theme=options.theme??'night',animated=options.animated!==false;
    if(!['comet','cartographer','starforge'].includes(design)||!themes[theme])throw Error('Unknown design/theme');
    const official=model.metric==='official';
    const p=themes[theme],label=options.label|| (official?'GITHUB CALENDAR · '+model.login+' · '+model.generated:model.source==='demo'?'SYNTHETIC DEMO':'PUBLIC EVENT SAMPLE');
    const title={comet:'COMET STREAKS',cartographer:'CELESTIAL CARTOGRAPHER',starforge:'STARFORGE'}[design];
    const subtitle={comet:'An uninterrupted run of active dates becomes a comet.',cartographer:'An observatory maps the recorded days of a coding year.',starforge:'Every recorded day is forged at its true calendar position.'}[design];
    const description=official?`${label}. ${model.active.length} active dates, ${model.totalUnits} API-visible GitHub contributions. Counts are supplied by GitHub GraphQL. Visibility of private activity depends on GitHub settings and API token scope. ${model.streaks.length} consecutive active-day runs.`:`${label}. ${model.active.length} active days in a 53-week by 7-day calendar, ${model.visibleEvents.length} unique recorded events, ${model.totalUnits} recorded activity units. Unlit means no event in this sample, not verified zero GitHub contributions. ${model.streaks.length} uninterrupted streaks of two or more UTC dates.`;
    const out=[];const add=s=>out.push(s);
    add(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="const-title const-desc" data-design="${design}" data-theme="${theme}" data-source="${model.source}" data-cells="371" data-active="${model.active.length}" data-streaks="${model.streaks.length}" data-events="${model.visibleEvents.length}">`);
    add(`<title id="const-title">${esc(title)} · ${esc(theme)} · ${esc(label)}</title><desc id="const-desc">${esc(description)}</desc>`);
    add(`<defs><linearGradient id="back" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${p.bg}"/><stop offset=".7" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient><linearGradient id="ribbon" x1="0" x2="1"><stop stop-color="${p.accent}" stop-opacity=".2"/><stop offset=".55" stop-color="${p.accent}"/><stop offset="1" stop-color="${p.flame}"/></linearGradient><radialGradient id="halo"><stop stop-color="${p.accent}" stop-opacity=".4"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient><filter id="soft"><feGaussianBlur stdDeviation="2.8"/></filter>`);
    add(`<style><![CDATA[text{font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.active-day:focus .focus,.active-day:hover .focus{stroke-width:2.1;stroke-opacity:1}.active-day{cursor:pointer}.ambient{opacity:.5}.beam{opacity:.66}.shoot{opacity:1}@keyframes breathe{0%,100%{opacity:.65}50%{opacity:1}}@keyframes reveal{0%{opacity:.12;transform:scale(.6)}10%,100%{opacity:1;transform:scale(1)}}@keyframes flare{0%,100%{opacity:.75}50%{opacity:1}}.twinkle{animation:breathe 4.4s ease-in-out infinite}.data-star{transform-box:fill-box;transform-origin:center}@media(prefers-reduced-motion:reduce){*{animation:none!important}.beam,.shoot{display:none!important}.data-star{opacity:1!important;transform:none!important}}]]></style></defs>`);
    add(`<rect width="1200" height="390" rx="19" fill="url(#back)"/><rect x="9" y="9" width="1182" height="372" rx="13" fill="none" stroke="${p.line}" stroke-opacity="${p.paper?'.7':'.55'}"/>`);
    if(theme==='night'){
      add(`<ellipse cx="765" cy="160" rx="385" ry="160" fill="url(#halo)" opacity=".24"/><path d="M455 20 C690 -20 970 100 1180 23" fill="none" stroke="${p.accent}" stroke-opacity=".12" stroke-width="35"/>`);
      for(let i=0;i<18;i++){const a=(i*73)%1131+33,b=(i*41)%316+31; if(b>=121&&b<=289&&a>146)continue;add(`<circle cx="${a}" cy="${b}" r="${i%4===0?'1.1':'.65'}" fill="${p.accent}" opacity=".26" class="ambient"/>`);}
    } else {
      add(`<path d="M20 104 H1180 M20 322 H1180" stroke="${p.line}" stroke-opacity=".38"/><circle cx="1134" cy="56" r="31" stroke="${p.line}" fill="none" stroke-opacity=".46"/><circle cx="1134" cy="56" r="24" stroke="${p.line}" fill="none" stroke-dasharray="1 5"/><path d="M1134 17 V95 M1095 56 H1173" stroke="${p.line}" stroke-opacity=".38"/>`);
    }
    const small=`font-size="10" font-weight="650" letter-spacing="2.1"`;
    add(`<text x="39" y="39" ${small} fill="${p.accent}">THE CONTRIBUTION SKY  /  03 STUDIES</text>`);
    add(`<text x="39" y="72" font-size="30" font-weight="750" letter-spacing="-.8" fill="${p.text}">${title}</text>`);
    add(`<text x="40" y="94" font-size="12.3" fill="${p.muted}">${esc(subtitle)}</text>`);
    add(`<text x="1163" y="92" text-anchor="end" font-size="11" fill="${p.muted}">53 WEEKS  ·  SUN → SAT  ·  UTC</text>`);
    // The numbered position of every date is preserved in a fixed Sunday-first lattice.
    add(`<rect x="147" y="132" width="1001" height="153" rx="12" fill="${p.paper?'#ffffff':'#061126'}" fill-opacity="${p.paper?'.38':'.3'}" stroke="${p.line}" stroke-opacity=".24"/>`);
    const monthLabels=[];let last='';for(let c=0;c<COLS;c++){const d=model.cells[c*7].date,month=d.slice(0,7);if(month!==last){const dd=new Date(d+'T00:00:00Z');if(c>0)monthLabels.push({c,text:dd.toLocaleString('en-GB',{month:'short',timeZone:'UTC'}).toUpperCase()});last=month;}}
    for(const item of monthLabels)add(`<text x="${n(X+item.c*STEP)}" y="125" font-size="9.6" font-weight="700" letter-spacing=".8" fill="${p.muted}">${item.text}</text>`);
    for(const [r,t] of [[1,'MON'],[3,'WED'],[5,'FRI']])add(`<text x="113" y="${n(Y+r*VSTEP+10.4)}" font-size="9.4" font-weight="700" fill="${p.muted}">${t}</text>`);
    for(const day of model.cells)add(`<rect class="calendar-cell" x="${n(day.x)}" y="${n(day.y)}" width="${CELL}" height="${CELL}" rx="3.1" data-date="${day.date}" data-units="${day.units}" data-level="${day.level}" data-future="${day.future}" fill="${day.future?p.future:day.level?p.levels[day.level-1]:p.tile}" fill-opacity="${day.future?'.32':day.active?'.82':'.9'}" stroke="${p.tileBorder}" stroke-opacity="${day.future?'.12':'.38'}" stroke-width=".65"/>`);
    // Motion paths run only through consecutive actual dates; a missing day breaks the line.
    if(design==='comet'){
      for(let k=0;k<model.streaks.length;k++){
        const run=model.streaks[k],pts=run.map(d=>pos(d));let path=`M${n(pts[0].x)} ${n(pts[0].y)}`;
        for(let j=1;j<pts.length;j++)path+=` ${run[j].col===run[j-1].col?'L':'M'}${n(pts[j].x)} ${n(pts[j].y)}`;
        // A Saturday-to-Sunday wrap must not draw across unrecorded weekdays.
        for(let j=1;j<run.length;j++)if(run[j].col!==run[j-1].col){const a=pts[j-1],b=pts[j];add(`<circle class='week-wrap' data-wrap='${run[j-1].date}/${run[j].date}' cx='${n(a.x)}' cy='${n(a.y)}' r='3.4' stroke='${p.accent}' stroke-width='1.2' fill='none'/><circle class='week-wrap' cx='${n(b.x)}' cy='${n(b.y)}' r='3.4' stroke='${p.accent}' stroke-width='1.2' fill='none'/>`);}
        add(`<path data-streak="${k}" data-length="${run.length}" data-start="${run[0].date}" data-end="${run.at(-1).date}" d="${path}" fill="none" stroke="${p.accent}" stroke-opacity=".25" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
        if(animated){const start=.7+k*11/Math.max(1,model.streaks.length),dur=Math.min(2.9,.9+run.length*.17),finish=start+dur;
          const t0=(start/LOOP).toFixed(4),tm=((start+dur*.5)/LOOP).toFixed(4),t1=(finish/LOOP).toFixed(4);
          if(run.length===2&&run[0].col!==run[1].col){
            for(let j=0;j<2;j++){const d=run[j],point=pts[j];const a=(start+j*dur/2)/LOOP,b=(start+(j+.5)*dur/2)/LOOP,c=(start+(j+1)*dur/2)/LOOP;
              add(`<circle class='shoot' data-wrap-pulse='${d.date}' cx='${n(point.x)}' cy='${n(point.y)}' r='3.7' fill='${p.flame}' opacity='0'><animate attributeName='opacity' values='0;0;1;0;0' keyTimes='0;${a.toFixed(4)};${b.toFixed(4)};${c.toFixed(4)};1' dur='16s' repeatCount='indefinite'/></circle>`);
            }
            continue;
          }
          add(`<path d="${path}" fill="none" stroke="url(#ribbon)" stroke-width="3.3" stroke-linecap="round" opacity=".8" stroke-dasharray="4 110"><animate attributeName="stroke-dashoffset" values="110;110;-110;-110" keyTimes="0;${t0};${t1};1" dur="16s" repeatCount="indefinite"/></path>`);
          add(`<circle class="shoot" r="3.8" fill="${p.flame}"><animateMotion path="${path}" dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${t0};${t1};1"/><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;${t0};${tm};${t1};1" dur="16s" repeatCount="indefinite"/></circle>`);
        }
      }
    }
    // Distinct mechanics for cartographer and starforge are authored below the lattice.
    if(design==='cartographer'){
      // Telescope stays OUTSIDE the contribution positions; the eyepiece aims to the moving scan.
      add(`<g transform="translate(34 165)" stroke="${p.sub}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 34 L43 4 L58 20 L27 50 Z" fill="${p.paper?'#d6e6dc':'#203d59'}"/><path d="M7 30 L17 40 M55 13 L65 23" stroke-width="5"/><circle cx="37" cy="31" r="7" fill="${p.flame}" stroke="${p.flame}"/><path d="M37 38 L19 72 M37 38 L55 72 M19 72 H55"/><path d="M6 76 H68" stroke-opacity=".45"/><circle cx="37" cy="31" r="2.4" fill="${p.text}"/></g>`);
      if(animated){
        add(`<g class="beam" pointer-events="none"><path d="M149 131 L172 131 L178 285 L143 285 Z" fill="${p.accent}" opacity=".11"/><path d="M159 133 V282" stroke="${p.accent}" stroke-opacity=".58" stroke-width="1.6" stroke-dasharray="3 6"/><animateTransform attributeName="transform" type="translate" values="0 0;970 0;970 0" keyTimes="0;.82;1" dur="16s" repeatCount="indefinite"/></g>`);
      }
    }
    const forgeArrivals=new Map();
    if(design==='starforge'){
      add(`<g transform="translate(35 193)" stroke="${p.sub}" stroke-width="2" stroke-linejoin="round" fill="none"><path d="M6 50 L45 50 L55 68 L2 68 Z" fill="${p.paper?'#e3d6c0':'#253c54'}"/><path d="M14 47 L21 25 L38 25 L46 47 Z" fill="${p.paper?'#dccbb3':'#193148'}"/><path d="M19 42 Q28 28 39 42" stroke="${p.flame}" stroke-width="4"/><path d="M28 13 V24 M15 18 L22 26 M41 18 L35 26" stroke="${p.flame}" stroke-width="2"/><path d="M11 70 L7 80 M45 70 L50 80"/><circle cx="28" cy="37" r="3" fill="${p.flame}" stroke="none"/></g>`);
      if(animated){
        // One visible flight per active date, never a fabricated event/extra cell.
        // Cap replay for a bounded SVG size; every recorded day still stays illuminated.
        const picked=model.active.length>95?model.active.filter((d,i)=>i%Math.ceil(model.active.length/95)===0):model.active;
        for(let j=0;j<picked.length;j++){
          const day=picked[j],target=pos(day),from={x:64,y:233},bend=72+(j%6)*8;
          const path=`M${from.x} ${from.y} Q${n((from.x+target.x)/2)} ${n(Math.min(from.y,target.y)-bend)} ${n(target.x)} ${n(target.y)}`;
          const begin=.65+j*12/Math.max(1,picked.length),finish=begin+.75;
          const t0=(begin/LOOP).toFixed(4),tm=((begin+.35)/LOOP).toFixed(4),t1=(finish/LOOP).toFixed(4);
          forgeArrivals.set(day.date,finish);
          add(`<circle class="shoot" data-target="${day.date}" r="${n(2+day.level*.3)}" fill="${p.flame}" opacity="0"><animateMotion path="${path}" dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${t0};${t1};1"/><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;${t0};${tm};${t1};1" dur="16s" repeatCount="indefinite"/></circle>`);
        }
      }
    }
    // Observed days: the only star symbols located INSIDE contribution cells.
    for(const day of model.active){const {x,y}=pos(day),colour=p.levels[day.level-1],size=day.level>=4?5.8:4.1+day.level*.35;
      const details=official?`${day.date}: ${day.units} GitHub API-visible contributions (${['none','first','second','third','fourth'][day.level]} intensity tier)`:`${day.date}: ${day.events.length} recorded events, ${day.units} recorded activity units; ${[...new Set(day.events.map(e=>e.repo))].join(', ')}`;
      const mainURL=official?'https://github.com/'+model.login:day.events[0].url;
      add(`<a class="active-day" href="${esc(mainURL)}" target="_blank" rel="noopener noreferrer" tabindex="0" aria-label="${esc(details)}" data-day="${day.date}" data-units="${day.units}" data-detail="${esc(details)}"><title>${esc(details)}</title>`);
      if(design==='comet'){
        add(`<circle class="data-star ${animated?'twinkle':''}" cx="${n(x)}" cy="${n(y)}" r="${n(size*.7)}" fill="${p.paper?p.text:'#f7fffa'}"/><path d="M${n(x)} ${n(y-size)} V${n(y+size)} M${n(x-size)} ${n(y)} H${n(x+size)}" stroke="${colour}" stroke-width="1.25"/>`);
      } else if(design==='cartographer'){
        const moment=.03+day.col/52*.79,stop=Math.min(.98,moment+.02);
        add(`<path class="data-star" d="${starPath(x,y,size,4)}" fill="${p.paper?p.text:'#eefaff'}" stroke="${colour}" stroke-width="1.3">${animated?`<animate attributeName="opacity" values=".17;.17;1;1" keyTimes="0;${moment.toFixed(4)};${stop.toFixed(4)};1" dur="16s" repeatCount="indefinite"/>`:''}</path><circle cx="${n(x)}" cy="${n(y)}" r="${n(size+1.4)}" stroke="${colour}" stroke-opacity=".6" stroke-width=".7" fill="none"/>`);
      } else {
        const arrival=forgeArrivals.get(day.date);
        const reveal=arrival===undefined?'':`<animate attributeName='opacity' values='.25;.25;1;1' keyTimes='0;${(arrival/LOOP).toFixed(4)};${Math.min(.999,(arrival+.07)/LOOP).toFixed(4)};1' dur='16s' repeatCount='indefinite'/>`;
        add(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(size+1.2)}" fill="none" stroke="${colour}" stroke-opacity=".68" stroke-width=".9"/><path class="data-star" d="${starPath(x,y,size,6)}" fill="${p.flame}" stroke="${p.paper?p.text:'#fff5cd'}" stroke-width=".7">${reveal}</path>`);
      }
      add(`<rect class="focus" x="${n(day.x-1)}" y="${n(day.y-1)}" width="${n(CELL+2)}" height="${n(CELL+2)}" rx="3" fill="none" stroke="${p.accent}" stroke-opacity="0"/><rect x="${n(day.x-2)}" y="${n(day.y-2)}" width="${n(CELL+4)}" height="${n(CELL+4)}" fill="transparent"/></a>`);
    }
    add(`<path d="M37 307 H1163" stroke="${p.line}" stroke-opacity=".5"/>`);
    if(design==='comet'){
      add(`<text x="40" y="329" ${small} fill="${p.accent}">${model.streaks.length} VERIFIED RUN${model.streaks.length===1?'':'S'}</text>`);
      add(`<text x="40" y="348" font-size="11" fill="${p.muted}">${model.streaks.length?'Comets travel only between adjacent active dates.':'No consecutive days in this sample: no comets invented.'}</text>`);
    }else if(design==='cartographer'){
      add(`<text x="40" y="329" ${small} fill="${p.accent}">THE OBSERVATORY LOG</text><text x="40" y="348" font-size="11" fill="${p.muted}">Surveyed in date order · recorded observations only</text>`);
    }else{
      add(`<text x="40" y="329" ${small} fill="${p.accent}">THE STELLAR FOUNDRY</text><text x="40" y="348" font-size="11" fill="${p.muted}">One finished star for each recorded calendar day</text>`);
    }
    add(`<text x="1157" y="319" text-anchor="end" font-size="10.2" fill="${p.muted}">${official?'GITHUB API CONTRIBUTION LEVEL':'RECORDED ACTIVITY UNITS'}</text>`);
    for(let i=0;i<5;i++){
      const x=840+i*51;add(`<rect x="${x}" y="327" width="12" height="12" rx="2.4" fill="${i===0?p.tile:p.levels[i-1]}" stroke="${p.tileBorder}" stroke-width=".6"/>`);
      add(`<text x="${x+15}" y="337" font-size="9.5" fill="${p.muted}">${(official?['·','Q1','Q2','Q3','Q4']:['·','1','2–3','4–6','7+'])[i]}</text>`);
    }
    add(`<path d="M35 359 H1165" stroke="${p.line}" stroke-opacity=".45"/>`);
    add(`<text x="40" y="375" font-size="9.5" font-weight="750" letter-spacing=".85" fill="${p.accent}">${esc(label.toUpperCase())}</text>`);
    add(`<text x="1160" y="375" text-anchor="end" font-size="9.3" fill="${p.muted}">${official?`${model.active.length} ACTIVE DATES  ·  ${model.totalUnits} API-VISIBLE GITHUB CONTRIBUTIONS  ·  PRIVATE VISIBILITY VARIES`:`${model.active.length} ACTIVE DATES  ·  ${model.visibleEvents.length} EVENTS  ·  UNLIT = NOT IN SAMPLE  ·  NOT GITHUB OFFICIAL COUNTS`}</text>`);
    add('</svg>');
    return out.join('');
  }
  return {parse,render,esc,themes,calendarSize:371,loopSeconds:LOOP};
}
