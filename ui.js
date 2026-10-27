'use strict';
// Common loading markup for startup, file import, Drive sync and lesson preparation.
window.AgendaUI=(()=>{
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cubes='<div class="loading-visual" aria-hidden="true"><div class="boxes">'+Array.from({length:4},()=>'<div class="box"><div></div><div></div><div></div><div></div></div>').join('')+'</div></div>';
 function loadingHTML(label){return '<div class="loading-indicator" role="status" aria-live="polite">'+cubes+'<p>'+escape(label)+'</p></div>'}
 const active=new Map();let sequence=0,previousFocus=null;
 function update(){
  const screen=document.getElementById('pageLoading'),app=document.querySelector('.app'),label=[...active.values()].at(-1);
  if(!screen)return;
  if(label){screen.innerHTML=loadingHTML(label);screen.hidden=false;if(app){app.inert=true;app.setAttribute('aria-busy','true')}}
  else{screen.hidden=true;screen.replaceChildren();if(app){app.inert=false;app.removeAttribute('aria-busy')}if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null}
 }
 function start(label){const id=++sequence;if(!active.size)previousFocus=document.activeElement;active.set(id,label);update();let stopped=false;return ()=>{if(stopped)return;stopped=true;active.delete(id);update()}}
 const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const finishStartup=start('Carregando sua agenda…');
 return {loadingHTML,start,nextFrame,finishStartup};
})();
