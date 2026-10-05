const T=THREE,$=id=>document.getElementById(id),rnd=Math.random;
const CH={sprocket:{n:'Sprocket',col:0x9aa3ad,spd:7,jmp:11,atk:'water'},flame:{n:'Flame',col:0xe8281e,spd:7.5,jmp:10.5,atk:'fire'},bull:{n:'Bull',col:0xa8101a,spd:8,jmp:10,atk:'wind'}};
let W,PF=[],E=[],I=[],Co=[],ST=[],Pr=[],HZ=[],FX=[],CP=[],PL=[],grp,goal,gp,bossDead=0,won=0,t=0,camYaw=0,running=false,sc='sprocket',sw=0,mode='solo',rem,stars=0,kill=-14,mt,nt=0,ht=0,ac;
const cv=$('c'),ren=new T.WebGLRenderer({canvas:cv,antialias:false});ren.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,300);
scene.add(new T.HemisphereLight(0xffffff,0x556677,.95));const sun=new T.DirectionalLight(0xffffff,.7);sun.position.set(5,10,3);scene.add(sun);
function rs(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
const mat=c=>new T.MeshLambertMaterial({color:c});
function bx(w,h,d,c,x=0,y=0,z=0,g){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);g&&g.add(m);return m}
function sfx(f,d=.1,ty='square',g=.05,s=0){try{ac=ac||new(window.AudioContext||webkitAudioContext)();const o=ac.createOscillator(),v=ac.createGain(),n=ac.currentTime;o.type=ty;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(f+s,30),n+d);v.gain.setValueAtTime(g,n);v.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(v);v.connect(ac.destination);o.start();o.stop(n+d)}catch(e){}}
function puff(x,y,z,c,n=6,sz=.14){for(let i=0;i<n;i++)FX.push({m:bx(sz,sz,sz,c,x,y+.1,z,grp),v:new T.Vector3((rnd()-.5)*3,rnd()*3,(rnd()-.5)*3),l:.5})}
// ---- character model with pivots so limbs can animate
function robot(k){const g=new T.Group(),ev=k=='evil',C=ev?0xc4001a:CH[k].col,D=0x333a44,body=new T.Group(),head=new T.Group(),arm=s=>{const a=new T.Group();a.position.set(s*.55,.8,0);body.add(a);bx(.25,.6,.25,C,0,-.3,0,a);bx(.3,.3,.3,D,0,-.65,0,a);return a},leg=s=>{const l=new T.Group();l.position.set(s*.2,0,0);body.add(l);bx(.28,.9,.3,D,0,-.45,0,l);bx(.34,.14,.5,C,0,-.88,.08,l);return l};
 g.add(body);body.position.y=.9;bx(.8,.9,.5,C,0,.45,0,body);head.position.y=.95;body.add(head);bx(.7,.6,.6,C,0,.3,0,head);bx(.5,.18,.1,ev?0xffee00:0x33ddff,0,.35,.31,head);
 const u=g.u={body,head,aL:arm(-1),aR:arm(1),lL:leg(-1),lR:leg(1)};
 if(k=='sprocket'){const o=new T.Mesh(new T.CylinderGeometry(.35,.35,.12,8),mat(0x555d66));o.rotation.x=Math.PI/2;o.position.set(0,.5,-.32);body.add(o);u.gear=o;bx(.06,.3,.06,0x4aa8ff,0,.75,0,head)}
 if(k=='flame'){const f=new T.Mesh(new T.ConeGeometry(.3,.7,6),mat(0xffa51e));f.position.y=.9;head.add(f);u.fl=f}
 if(k=='bull'||ev)for(const s of[-1,1]){const h=new T.Mesh(new T.ConeGeometry(.12,.5,5),mat(ev?0x111111:0xf2f2f2));h.position.set(s*.3,.75,0);h.rotation.z=-s*.5;head.add(h)}
 const pr=u.prop=new T.Group();pr.position.y=.85;pr.visible=false;bx(.08,.2,.08,0x888888,0,.1,0,pr);bx(1.3,.05,.2,0x33ddff,0,.22,0,pr);bx(.2,.05,1.3,0x33ddff,0,.22,0,pr);head.add(pr);
 return g}
function pose(u,ph,run,air,vy,at){const s=Math.sin(ph)*run,a=vy>0?-2.6:-1.3;
 u.lL.rotation.x=air?.7:s*.9;u.lR.rotation.x=air?-.4:-s*.9;
 u.aL.rotation.x=air?a:-s*.8;u.aR.rotation.x=air?a:s*.8;u.aL.rotation.z=air?-.5:0;u.aR.rotation.z=air?.5:0;
 u.body.position.y=.9+Math.abs(Math.cos(ph))*.08*run+(air?0:Math.sin(t*3)*.02*(1-run));
 u.body.rotation.x=run*.12;u.head.rotation.x=-run*.1;
 if(at>0){u.aR.rotation.x=-1.7;u.body.rotation.y=(1-at/.3)*6.28}else u.body.rotation.y=0}
// ---- level building
function build(wi){
 if(grp)scene.remove(grp);grp=new T.Group();scene.add(grp);W=LEVELS[wi];scene.background=new T.Color(W.sky);scene.fog=new T.Fog(W.sky,40,130);
 PF=[];E=[];I=[];Co=[];ST=[];Pr=[];HZ=[];FX=[];CP=[];stars=0;
 const add=(x,y,z,w,d,o={})=>{const p=Object.assign({bx:x,by:y,by0:y,bz:z,x,y,z,hw:w/2,hd:d/2,dx:0,dy:0,dz:0,ax:0,ay:0,az:0,sp:1,ph:0,tm:0,fv:0},o),m=new T.Group();
  bx(w,1,d,W.edge,0,0,0,m);bx(w+.02,.22,d+.02,o.col||W.col,0,.4,0,m);m.position.set(x,y-.5,z);grp.add(m);p.m=m;PF.push(p);return p};
 if(W.lava){const l=new T.Mesh(new T.PlaneGeometry(600,600),new T.MeshBasicMaterial({color:0xff4a10}));l.rotation.x=-Math.PI/2;l.position.y=-3;grp.add(l);kill=-3.5}else kill=-14;
 for(let i=0;i<30;i++){const c=bx(6+rnd()*8,1,4+rnd()*5,0xffffff,(rnd()-.5)*160,-8+rnd()*40,-rnd()*320,grp);c.material.transparent=true;c.material.opacity=.5}
 let last=add(0,0,0,10,10,{col:0x4488ff}),x=0,y=0,z=0;
 W.rows.forEach(([w,d,gap,dx,dy,k,f])=>{z-=last.hd+gap+d/2;x+=dx;y+=dy;const o={};
  if(k=='x')Object.assign(o,{ax:5,sp:1});if(k=='y')Object.assign(o,{ay:2.5,sp:.9});if(k=='z')Object.assign(o,{az:3,sp:1});if(k=='c')Object.assign(o,{crum:1,col:0xb08a5a});if(k=='b')Object.assign(o,{bn:1,col:0xff66cc});
  const p=add(x,y,z,w,d,o),has=c=>f.includes(c);
  if(has('c'))for(let i=-1;i<2;i++)coin(p,0,1.2+(1-Math.abs(i))*.6,i*1.3);
  if(has('k')){const m=new T.Mesh(new T.OctahedronGeometry(.6),mat(0x22dd66));grp.add(m);ST.push({m,pl:p,ox:0,oy:1.6,oz:0})}
  for(const[c,kd,col]of[['g','gear',0x44ff88],['t','star',0xffee33],['p','prop',0x33ddff],['u','boots',0xff44cc]])if(has(c)){const m=new T.Mesh(new T.OctahedronGeometry(.5),mat(col));grp.add(m);I.push({m,pl:p,ox:p.hw*.55,oy:1.4,oz:0,k:kd})}
  if(has('e'))enemy(p,'w');if(has('h'))enemy(p,'h');
  if(has('f')){const m=new T.Group();bx(.15,2.4,.15,0xffffff,0,1.2,0,m);const fl=bx(1,.6,.05,0xff3322,.55,2.1,0,m);m.position.set(p.x-p.hw+1,p.y,p.z+p.hd-1);grp.add(m);CP.push({m,fl,p,on:0})}
  if(has('s')){const m=new T.Group(),L=Math.min(w,d)+1;bx(L,.4,.5,0xffcc00,0,0,0,m);bx(.8,1.2,.8,0x444444,0,-.4,0,m);m.position.set(p.x,p.y+.8,p.z);grp.add(m);HZ.push({m,p,L,a:0})}
  last=p});
 z-=last.hd+16;const ar=add(0,y,z,28,28,{col:0x883333});enemy(ar,'b');
 goal=new T.Group();bx(.2,5,.2,0xffffff,0,2.5,0,goal);bx(1.6,1,.1,0xffd21e,.8,4.4,0,goal);goal.position.set(0,y,z-10);goal.visible=false;grp.add(goal);gp={x:0,y,z:z-10}}
function coin(p,ox,oy,oz){const m=new T.Mesh(new T.TorusGeometry(.3,.1,6,12),mat(0xffd21e));grp.add(m);Co.push({m,pl:p,ox,oy,oz})}
function enemy(p,ty){const boss=ty=='b',m=boss?robot('evil'):new T.Group();
 if(!boss){const b=new T.Group();m.add(b);bx(1,1,1,ty=='h'?0xff8a1e:0x6a3d9a,0,.5,0,b);bx(.7,.2,.1,0xffffff,0,.65,.51,b);bx(.25,.3,.25,0x222222,-.3,.1,.3,b);bx(.25,.3,.25,0x222222,.3,.1,.3,b);m.u={b}}else m.scale.setScalar(2);
 grp.add(m);E.push({m,pl:p,ox:0,oy:0,oz:0,hp:boss?W.boss:1,boss,ty,cd:2,fz:0,s:0,ic:0,ph:rnd()*6})}
function mk(c,x,rm){const m=robot(c);grp.add(m);return{c,m,x,y:0,z:0,vx:0,vy:0,vz:0,ry:Math.PI,hp:3,inv:0,star:0,boots:0,prop:0,pu:0,cd:0,coins:0,g:null,coy:0,jb:0,jh:0,ph:0,sq:0,at:0,dust:0,safe:{x,y:0,z:0},remote:rm,tx:x,ty:0,tz:0}}
function start(wi,fn){sw=wi;won=0;build(wi);PL=[];rem=null;bossDead=0;const ks=Object.keys(CH);
 PL.push(mk(sc,0));if(mode=='local')PL.push(mk(ks[(ks.indexOf(sc)+1)%3],2.5));
 if(!fn&&mode=='online')net({t:'w',w:wi});
 $('menu').style.display='none';running=true;msg(W.name,2200)}
const at=e=>e.m.position.set(e.pl.x+e.ox,e.pl.y+e.oy,e.pl.z+e.oz);
function msg(s,ms){const m=$('msg');m.textContent=s;clearTimeout(mt);mt=setTimeout(()=>m.textContent='',ms)}
// ---- input
const K={},TS={x:0,y:0,j:0,a:0};
addEventListener('keydown',e=>{K[e.code]=1;if(running&&/^(Space|Arrow)/.test(e.code))e.preventDefault()});addEventListener('keyup',e=>K[e.code]=0);
function inp(i){return i==0?{x:(K.KeyD?1:0)-(K.KeyA?1:0)+TS.x,y:(K.KeyW?1:0)-(K.KeyS?1:0)+TS.y,j:K.Space||TS.j,a:K.KeyF||K.KeyJ||TS.a}:{x:(K.ArrowRight?1:0)-(K.ArrowLeft?1:0),y:(K.ArrowUp?1:0)-(K.ArrowDown?1:0),j:K.Enter,a:K.ShiftRight}}
if(matchMedia('(pointer:coarse)').matches)$('ui').style.display='block';
const js=$('js'),kn=$('kn');let jd=0;
function jm(e){const r=js.getBoundingClientRect(),dx=e.clientX-r.left-60,dy=e.clientY-r.top-60,d=Math.min(Math.hypot(dx,dy),50),a=Math.atan2(dy,dx),px=Math.cos(a)*d,py=Math.sin(a)*d;TS.x=px/50;TS.y=-py/50;kn.style.transform=`translate(${px}px,${py}px)`}
js.onpointerdown=e=>{jd=1;js.setPointerCapture(e.pointerId);jm(e)};js.onpointermove=e=>jd&&jm(e);js.onpointerup=js.onpointercancel=()=>{jd=0;TS.x=TS.y=0;kn.style.transform=''};
for(const[id,k]of[['bj','j'],['ba','a']]){const b=$(id);b.onpointerdown=()=>TS[k]=1;b.onpointerup=b.onpointercancel=b.onpointerleave=()=>TS[k]=0}
let dr=null;cv.onpointerdown=e=>dr=e.clientX;cv.onpointermove=e=>{if(dr!=null){camYaw-=(e.clientX-dr)*.006;dr=e.clientX}};cv.onpointerup=cv.onpointerleave=()=>dr=null;
// ---- combat
function hurt(p){if(p.inv>0||p.star>0)return;p.hp--;p.inv=1.5;p.vy=8;sfx(220,.3,'sawtooth',.06,-150);puff(p.x,p.y+1,p.z,0xff4444,8);if(p.hp<=0)respawn(p)}
function respawn(p,f){if(f)p.hp--;if(p.hp<=0)p.hp=3;Object.assign(p,{x:p.safe.x,y:p.safe.y+.3,z:p.safe.z,vx:0,vy:0,vz:0,inv:1.5})}
function hurtE(e,d){if(d&&e.ic>0)return;e.hp-=d;if(d)e.ic=.4;if(e.hp<=0&&E.includes(e)){E.splice(E.indexOf(e),1);FX.push({m:e.m,l:.35,sq:1});puff(e.m.position.x,e.m.position.y+.5,e.m.position.z,0xffffff,8);sfx(180,.15,'square',.06,-100);
 if(e.boss){bossDead=1;goal.visible=true;msg('Evil Sprocket is down! Reach the flag!',3000)}}}
function shoot(p){const a=CH[p.c].atk,d=new T.Vector3(Math.sin(p.ry),0,Math.cos(p.ry)),w=a=='wind';
 const m=new T.Mesh(w?new T.TorusGeometry(.6,.15,6,12):new T.SphereGeometry(.3,8,6),mat({water:0x44aaff,fire:0xff7a1a,wind:0xe8e8e8}[a]));if(w)m.rotation.x=Math.PI/2;
 m.position.set(p.x,p.y+1,p.z).addScaledVector(d,.8);grp.add(m);sfx(a=='fire'?400:a=='water'?600:200,.2,'sawtooth',.04,-100);
 Pr.push({m,v:d.multiplyScalar(a=='fire'?14:w?9:12),life:w?1:1.8,a,team:'p',r:w?1.6:.5,hit:new Set()})}
function bolt(e){const n=PL[0],ep=e.m.position;if(Math.hypot(n.x-ep.x,n.z-ep.z)>30)return;const d=new T.Vector3(n.x-ep.x,n.y+.8-ep.y-2.5,n.z-ep.z).normalize(),m=new T.Mesh(new T.SphereGeometry(.4,8,6),mat(0xff0022));m.position.set(ep.x,ep.y+2.5,ep.z);grp.add(m);Pr.push({m,v:d.multiplyScalar(9),life:3,a:'bolt',team:'e',r:.4,hit:new Set()})}
const near=(p,m,r)=>Math.hypot(p.x-m.position.x,p.y+.8-m.position.y,p.z-m.position.z)<r;
// ---- player physics: AABB platforms, moving-surface carry, coyote time, jump buffer, propeller glide
function step(p,i,dt){
 const k=inp(i),edge=k.j&&!p.jh;let mx=k.x,my=k.y;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}
 const s=Math.sin(camYaw),c=Math.cos(camYaw),wx=mx*c-my*s,wz=-mx*s-my*c;
 if(p.g){p.x+=p.g.dx;p.y+=p.g.dy;p.z+=p.g.dz;p.coy=.12;p.pu=0}else p.coy-=dt;
 const sp=CH[p.c].spd*(p.boots>0?1.3:1),a=Math.min(1,dt*(p.g?14:6));
 p.vx+=(wx*sp-p.vx)*a;p.vz+=(wz*sp-p.vz)*a;
 if(edge)p.jb=.12;p.jh=!!k.j;p.jb-=dt;
 if(p.jb>0&&p.coy>0){p.vy=CH[p.c].jmp*(p.boots>0?1.35:1);p.coy=0;p.jb=0;p.g=null;p.sq=-.6;sfx(330,.15,'square',.05,300);puff(p.x,p.y,p.z,0xffffff,4)}
 else if(p.prop>0&&!p.g&&k.j){if(edge&&!p.pu){p.vy=9;p.pu=1;sfx(500,.2,'triangle',.05,300)}if(p.vy<-2.5)p.vy=-2.5}
 if(!k.j&&p.vy>4&&!(p.prop>0))p.vy-=60*dt;
 p.vy=Math.max(p.vy-28*dt,-26);const vy0=p.vy,py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.g=null;
 for(let it=0;it<2;it++)for(const q of PF){
  const ox=Math.min(p.x+.4,q.x+q.hw)-Math.max(p.x-.4,q.x-q.hw),oz=Math.min(p.z+.4,q.z+q.hd)-Math.max(p.z-.4,q.z-q.hd);
  if(ox<=0||oz<=0)continue;const top=q.y,bot=q.y-1;
  if(p.y>=top||p.y+1.6<=bot)continue;
  if(py>=top-.4-Math.abs(q.dy)&&p.vy<=.1){if(vy0<-5){p.sq=1;puff(p.x,p.y,p.z,0xffffff,5);sfx(110,.08,'triangle',.08)}p.y=top;p.vy=0;p.g=q;if(q.crum)q.hit=1;if(q.bn){p.vy=19;p.g=null;p.coy=0;p.sq=-.8;sfx(250,.25,'sine',.08,500)}}
  else if(p.vy>0&&p.y+1.6<=bot+.6){p.vy=0;p.y=bot-1.6}
  else if(ox<oz){p.x+=p.x<q.x?-ox:ox;p.vx=0}else{p.z+=p.z<q.z?-oz:oz;p.vz=0}}
 if(p.g&&!(p.g.ax||p.g.ay||p.g.az||p.g.crum))p.safe={x:p.x,y:p.y,z:p.z};
 if(p.y<kill)respawn(p,1);
 if(Math.hypot(p.vx,p.vz)>.5)p.ry=Math.atan2(p.vx,p.vz);
 if(p.g&&Math.hypot(p.vx,p.vz)>4&&(p.dust-=dt)<=0){p.dust=.14;puff(p.x,p.y,p.z,0xdddddd,1,.1)}
 p.inv-=dt;p.star-=dt;p.boots-=dt;p.prop-=dt;p.cd-=dt;p.at-=dt;
 if(k.a&&p.cd<=0){p.cd=.45;p.at=.3;shoot(p);net({t:'a'})}
 for(const e of E.slice()){const ep=e.m.position,h=e.boss?3.6:1;
  if(Math.hypot(p.x-ep.x,p.z-ep.z)<(e.boss?1.8:1.1)&&p.y<ep.y+h&&p.y+1.6>ep.y){
   if(p.star>0)hurtE(e,3);else if(p.vy<0&&p.y>ep.y+h*.6){hurtE(e,1);p.vy=12;sfx(260,.12,'square',.06,200)}else if(e.fz<=0)hurt(p)}}
 for(const h of HZ){const dx=p.x-h.m.position.x,dz=p.z-h.m.position.z,c=Math.cos(h.a),s=Math.sin(h.a),al=dx*c-dz*s,pe=dx*s+dz*c;if(Math.abs(al)<h.L/2&&Math.abs(pe)<.7&&Math.abs(p.y+.8-h.m.position.y)<1.3)hurt(p)}
 for(const c of Co.slice())if(near(p,c.m,1)){grp.remove(c.m);Co.splice(Co.indexOf(c),1);p.coins++;sfx(880,.1,'square',.04,500)}
 for(const c of ST.slice())if(near(p,c.m,1.4)){grp.remove(c.m);ST.splice(ST.indexOf(c),1);stars++;sfx(660,.4,'triangle',.07,700);puff(p.x,p.y+1,p.z,0x22dd66,10);msg('Green star '+stars+'/3',1500)}
 for(const c of CP)if(!c.on&&near(p,c.m,2.5)){c.on=1;c.fl.material.color.setHex(0x22dd66);p.safe={x:c.m.position.x,y:c.p.y,z:c.m.position.z};sfx(520,.3,'triangle',.06,400);msg('Checkpoint!',1200)}
 for(const o of I.slice())if(near(p,o.m,1.2)){grp.remove(o.m);I.splice(I.indexOf(o),1);puff(p.x,p.y+1,p.z,0xffee33,10);sfx(440,.35,'triangle',.07,600);
  if(o.k=='gear'){p.hp=Math.min(5,p.hp+1);msg('Gear! +1 health',1300)}else if(o.k=='star'){p.star=8;msg('Star power!',1300)}else if(o.k=='prop'){p.prop=15;msg('Propeller! Hold jump in the air to glide',2200)}else{p.boots=12;msg('Spring boots!',1300)}}
 if(bossDead&&Math.hypot(p.x-gp.x,p.z-gp.z)<2.5&&Math.abs(p.y-gp.y)<4)next(p)}
function next(p){if(won)return;won=1;const n=sw+1;p.at=1;msg(n<3?`Level clear!  Green stars ${stars}/3`:'You beat Evil Sprocket! Stars '+stars+'/3',2800);sfx(784,.6,'triangle',.08,400);setTimeout(()=>{if(n<3)start(n);else{running=false;$('menu').style.display='flex'}},2900)}
// ---- main update
function update(dt){
 t+=dt;camYaw+=((K.KeyQ?1:0)-(K.KeyE?1:0))*dt*2;
 for(const p of PF){const o=[p.x,p.y,p.z],s=Math.sin(t*p.sp+p.ph);
  if(p.hit){p.tm+=dt;if(p.tm>.6){p.fv+=30*dt;p.by-=p.fv*dt}if(p.tm>3.5){p.by=p.by0;p.tm=p.fv=p.hit=0}}
  p.x=p.bx+p.ax*s;p.y=p.by+p.ay*s;p.z=p.bz+p.az*s;p.dx=p.x-o[0];p.dy=p.y-o[1];p.dz=p.z-o[2];
  p.m.position.set(p.x+(p.hit&&p.tm<.6?Math.sin(t*60)*.05:0),p.y-.5,p.z)}
 PL.forEach(p=>{if(p.remote){p.vx=(p.tx-p.x)*6;p.vz=(p.tz-p.z)*6;p.g=Math.abs(p.ty-p.y)<.15?1:null;p.vy=p.ty-p.y;p.x+=(p.tx-p.x)*.35;p.y+=(p.ty-p.y)*.35;p.z+=(p.tz-p.z)*.35;p.at-=dt}else step(p,PL.indexOf(p),dt);
  const u=p.m.u,sp=Math.hypot(p.vx,p.vz),air=!p.g;p.ph+=dt*(5+sp*1.4);p.sq+=(0-p.sq)*Math.min(1,dt*9);
  pose(u,p.ph,Math.min(sp/6,1),air,p.vy,p.at);
  p.m.position.set(p.x,p.y,p.z);p.m.rotation.y=p.ry;p.m.visible=p.inv>0?((t*20|0)%2==0):true;
  p.m.scale.set(1+p.sq*.2,1-p.sq*.3+(air?Math.min(Math.abs(p.vy)*.01,.12):0),1+p.sq*.2);
  if(u.gear)u.gear.rotation.y+=dt*3;if(u.fl)u.fl.scale.y=1+Math.sin(t*20)*.2;u.prop.visible=p.prop>0;u.prop.rotation.y+=dt*(air?40:12);
  p.m.traverse(o=>o.material&&o.material.emissive.setHSL(p.star>0?t*2%1:0,1,p.star>0?.35:0))});
 Co.forEach(c=>{at(c);c.m.rotation.y=t*3});ST.forEach(c=>{at(c);c.m.rotation.y=t*2;c.m.position.y+=Math.sin(t*3)*.2});I.forEach(o=>{at(o);o.m.rotation.y=t*2;o.m.rotation.x=.4;o.m.position.y+=Math.sin(t*3)*.15});
 CP.forEach(c=>c.fl.rotation.y=Math.sin(t*4)*.3);HZ.forEach(h=>{h.a+=dt*2.2;h.m.rotation.y=h.a;h.m.position.set(h.p.x,h.p.y+.8,h.p.z)});
 goal.rotation.y=Math.sin(t*3)*.15;
 const loc=PL.filter(p=>!p.remote);
 for(const e of E.slice()){if(e.fz>0)e.fz-=dt;else e.s+=dt;e.ic-=dt;const q=e.pl,hop=e.ty=='h';
  e.ox=Math.sin(e.s*(e.boss?.7:hop?.9:1.2)+e.ph)*(e.boss?q.hw-3:q.hw-1.2);if(e.boss)e.oz=Math.cos(e.s*.5)*(q.hd-3);
  e.oy=hop?Math.abs(Math.sin(e.s*3))*1.8:0;at(e);const ep=e.m.position;
  if(e.boss){if(loc[0])e.m.rotation.y=Math.atan2(loc[0].x-ep.x,loc[0].z-ep.z);pose(e.m.u,e.s*8,.8,0,0,0);if(e.fz<=0&&(e.cd-=dt)<=0){e.cd=Math.max(1,2.4-W.boss*.15);bolt(e)}}
  else{e.m.rotation.y=Math.cos(e.s*1.2+e.ph)>0?Math.PI/2:-Math.PI/2;e.m.u.b.rotation.z=Math.sin(e.s*8)*.12;e.m.u.b.scale.y=hop?(e.oy>.05?1.15:.7):1}
  e.m.traverse(o=>o.material&&o.material.emissive.setHex(e.fz>0?0x66ccff:0))}
 for(const b of Pr.slice()){b.life-=dt;const m=b.m,pp=m.position;pp.addScaledVector(b.v,dt);
  if(b.a=='fire'){b.v.y-=22*dt;for(const q of PF)if(Math.abs(pp.x-q.x)<q.hw&&Math.abs(pp.z-q.z)<q.hd&&pp.y<q.y+.3&&pp.y>q.y-1&&b.v.y<0){b.v.y=7;pp.y=q.y+.3}}
  if(b.a=='wind'){m.rotation.z+=dt*10;m.scale.setScalar(1+(1-b.life)*1.5)}
  if(b.a!='bolt'&&rnd()<.5)puff(pp.x,pp.y,pp.z,{water:0x88ccff,fire:0xffaa33,wind:0xffffff}[b.a],1,.08);
  if(b.team=='e'){for(const p of loc)if(near(p,m,1)){hurt(p);b.life=0}}
  else for(const e of E.slice()){const ep=e.m.position;
   if(Math.hypot(ep.x-pp.x,ep.z-pp.z)<(e.boss?1.6:.8)+b.r*.3&&pp.y>ep.y-.5&&pp.y<ep.y+(e.boss?4:1.5)){
    if(b.a=='wind'){if(b.hit.has(e))continue;b.hit.add(e);hurtE(e,1)}
    else{if(b.a=='water'){hurtE(e,e.fz>0?2:0);e.fz=3}else hurtE(e,1);b.life=0;break}}}
  if(b.life<=0){grp.remove(m);Pr.splice(Pr.indexOf(b),1)}}
 for(const f of FX.slice()){f.l-=dt;if(f.sq){f.m.scale.set(1+(.35-f.l)*2,Math.max(f.l*2,.05),1+(.35-f.l)*2)}else{f.m.position.addScaledVector(f.v,dt);f.v.y-=9*dt;f.m.scale.setScalar(Math.max(f.l*2,.01))}if(f.l<=0){grp.remove(f.m);FX.splice(FX.indexOf(f),1)}}
 let cx=0,cy=0,cz=0,sp=0,vv=0;loc.forEach(p=>{cx+=p.x;cy+=p.y;cz+=p.z;vv=Math.max(vv,Math.hypot(p.vx,p.vz))});cx/=loc.length;cy/=loc.length;cz/=loc.length;
 if(loc.length>1)sp=Math.hypot(loc[0].x-loc[1].x,loc[0].z-loc[1].z);const d=9+sp*.6;
 cam.position.lerp(new T.Vector3(cx+Math.sin(camYaw)*d,cy+6+sp*.3,cz+Math.cos(camYaw)*d),.12);cam.lookAt(cx,cy+1,cz);
 cam.fov+=(60+Math.min(vv*.5,5)-cam.fov)*.08;cam.updateProjectionMatrix();
 if((nt-=dt)<=0&&loc[0]){nt=.07;const p=loc[0];net({t:'s',x:p.x,y:p.y,z:p.z,ry:p.ry,c:p.c})}
 if((ht-=dt)<=0){ht=.2;$('hud').innerHTML=PL.map((p,i)=>`<b>${p.remote?'NET':'P'+(i+1)}</b> ${CH[p.c].n} <span style="color:#ff5566">${'❤'.repeat(Math.max(p.hp,0))}</span> 🪙${p.coins}${p.star>0?' ⭐':''}${p.boots>0?' 👟':''}${p.prop>0?' 🚁':''}`).join('<br>')+`<br><span style="color:#22dd66">◆ ${stars}/3</span> · ${W.name} ${bossDead?'🚩':'👿'}`}}
// ---- menu
function group(id,items,cb,sel){const el=$(id);items.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{[...el.children].forEach(x=>x.classList.remove('sel'));b.classList.add('sel');cb(v)};el.appendChild(b);if(v===sel)b.classList.add('sel')})}
group('chars',[['sprocket','Sprocket: water & ice'],['flame','Flame: fire'],['bull','Bull: wind']],v=>sc=v,'sprocket');
group('worlds',LEVELS.map((w,i)=>[i,w.name]),v=>sw=v,0);
group('modes',[['solo','Solo'],['local','Local 2P'],['online','Online']],v=>{mode=v;$('net').style.display=v=='online'?'block':'none'},'solo');
$('go').onclick=()=>{if(mode=='online'){if(!(dc&&dc.readyState=='open'))return $('ns').textContent='Connect a friend first';if(role=='join')return $('ns').textContent='The host starts the game'}start(sw)};
build(0);cam.position.set(0,8,14);cam.lookAt(0,0,-10);
let last=0;(function loop(ts){requestAnimationFrame(loop);const dt=Math.min((ts-last)/1000,.033)||0;last=ts;if(running)update(dt);ren.render(scene,cam)})(0);
