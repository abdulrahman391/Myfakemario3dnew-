// Online play: peer-to-peer WebRTC with copy/paste codes (no server needed).
let pc,dc,role;
const net=o=>dc&&dc.readyState=='open'&&dc.send(JSON.stringify(o));
const pcs=()=>{pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});pc.ondatachannel=e=>wire(e.channel)};
function wire(ch){dc=ch;ch.onopen=()=>$('ns').textContent='Connected! The host can press START.';
 ch.onclose=()=>{$('ns').textContent='Disconnected';if(rem&&grp){grp.remove(rem.m);PL=PL.filter(p=>p!==rem);rem=null}};
 ch.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.t=='w'){mode='online';start(m.w,1)}
  else if(m.t=='s'&&running){if(!rem||rem.c!=m.c){if(rem){grp.remove(rem.m);PL=PL.filter(p=>p!==rem)}rem=mk(m.c,m.x,1);rem.y=m.y;rem.z=m.z;PL.push(rem)}Object.assign(rem,{tx:m.x,ty:m.y,tz:m.z,ry:m.ry})}
  else if(m.t=='a'&&rem){rem.at=.3;shoot(rem)}}}
const gather=()=>new Promise(r=>{if(pc.iceGatheringState=='complete')return r();pc.onicegatheringstatechange=()=>pc.iceGatheringState=='complete'&&r();setTimeout(r,3500)}).then(()=>btoa(JSON.stringify(pc.localDescription)));
$('hb').onclick=async()=>{role='host';pcs();wire(pc.createDataChannel('g'));await pc.setLocalDescription(await pc.createOffer());$('nout').value=await gather();$('ns').textContent='Send your code to a friend, paste their reply above, press Connect'};
$('jb').onclick=()=>{role='join';pcs();$('ns').textContent='Paste the host code above, press Connect'};
$('nok').onclick=async()=>{try{await pc.setRemoteDescription(JSON.parse(atob($('nin').value.trim())));if(role=='join'){await pc.setLocalDescription(await pc.createAnswer());$('nout').value=await gather();$('ns').textContent='Send this reply code to the host'}}catch(e){$('ns').textContent='That code did not work. Check you pasted all of it.'}};
