/* Prince Street site viewer — realistic pass (P16).
   Model units: mm, x east (to laneway), y south (to shed), z up.  three.js: x, y=up, z=model y.  */
(function(){
  var D=window.__D, LAB=window.__LAB, BASE=window.__ASSETS||'assets16/';
  var box=document.getElementById('view'), cv=document.getElementById('cv'), pick=document.getElementById('pick');
  function fail(){document.getElementById('nogl').hidden=false;cv.hidden=true;pick.hidden=true}
  if(!window.THREE){fail();return}
  var renderer; try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true})}catch(e){fail();return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.95;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  var scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(42,1.6,0.05,250);
  var ctl=new THREE.OrbitControls(cam,cv); ctl.maxPolarAngle=Math.PI*0.62; ctl.minDistance=0.5; ctl.maxDistance=45;
  var VIEWS=window.__VIEWS;
  function setView(k){var v=VIEWS[k];cam.position.set(v[0][0],v[0][1],v[0][2]);ctl.target.set(v[1][0],v[1][1],v[1][2]);ctl.update();draw()}
  window.__v=function(p,t){cam.position.set(p[0],p[1],p[2]);ctl.target.set(t[0],t[1],t[2]);ctl.update();draw()};
  var maxAniso=renderer.capabilities.getMaxAnisotropy();

  /* ---------- sky, light ---------- */
  (function(){var c=document.createElement('canvas');c.width=2;c.height=256;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
    g.addColorStop(0,'#7fa9d6');g.addColorStop(0.55,'#c4dbef');g.addColorStop(1,'#e9eef0');x.fillStyle=g;x.fillRect(0,0,2,256);
    var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;scene.background=t})();
  scene.add(new THREE.HemisphereLight(0xdbe9ff,0x5d5a4c,0.6));
  var sun=new THREE.DirectionalLight(0xfff0d8,1.7); sun.position.set(-7.5,14,-9.5); sun.target.position.set(3.5,0,2.5);
  sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); var sc=sun.shadow.camera; sc.left=-14;sc.right=14;sc.top=14;sc.bottom=-14;sc.near=1;sc.far=45;
  sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.02; scene.add(sun); scene.add(sun.target);

  /* ---------- seeded random ---------- */
  function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

  /* ---------- textures ---------- */
  var TL=new THREE.TextureLoader(), texCache={};
  function tex(name,srgb){if(texCache[name])return texCache[name];var t=TL.load(BASE+'tex/'+name+'.jpg',draw);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=maxAniso;if(srgb)t.encoding=THREE.sRGBEncoding;texCache[name]=t;return t}
  function canvasTex(w,h,fn,srgb){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=maxAniso;if(srgb!==false)t.encoding=THREE.sRGBEncoding;return t}
  // fence palings: vertical boards ~100 mm (texture tile = 1 m wide x 1 m tall)
  function palingTex(base,vary,gap){return canvasTex(512,512,function(x,w,h){var r=rng(7);x.fillStyle=gap;x.fillRect(0,0,w,h);
      for(var i=0;i<10;i++){var x0=i*w/10+1,ww=w/10-3,dv=(r()-0.5)*vary,c=base.map(function(v){return Math.max(0,Math.min(255,Math.round(v+dv)))});
        x.fillStyle='rgb('+c.join(',')+')';x.fillRect(x0,0,ww,h);
        for(var k=0;k<26;k++){x.strokeStyle='rgba(60,40,20,'+(0.05+r()*0.08)+')';x.lineWidth=1+r()*1.5;x.beginPath();var gx=x0+r()*ww;x.moveTo(gx,0);x.bezierCurveTo(gx+(r()-0.5)*6,h*0.33,gx+(r()-0.5)*6,h*0.66,gx+(r()-0.5)*4,h);x.stroke()}
        if(r()<0.6){x.fillStyle='rgba(70,45,20,0.35)';x.beginPath();x.ellipse(x0+r()*ww,r()*h,2+r()*3,4+r()*5,0,0,6.3);x.fill()}}})}
  function pineTex(base,seed){return canvasTex(512,256,function(x,w,h){var r=rng(seed);x.fillStyle='rgb('+base.join(',')+')';x.fillRect(0,0,w,h);
      for(var k=0;k<70;k++){var y=r()*h,a=0.04+r()*0.12,dk=r()<0.7;x.strokeStyle=dk?'rgba(120,85,40,'+a+')':'rgba(255,240,200,'+a+')';x.lineWidth=0.6+r()*2.2;x.beginPath();x.moveTo(0,y);
        for(var xx=0;xx<=w;xx+=32)x.lineTo(xx,y+Math.sin(xx/w*6.28*(1+r()*0.3)+k)*(1+r()*3));x.stroke()}
      for(var q=0;q<3;q++){var kx=r()*w,ky=r()*h;var g=x.createRadialGradient(kx,ky,0,kx,ky,6+r()*8);g.addColorStop(0,'rgba(110,70,30,0.55)');g.addColorStop(1,'rgba(110,70,30,0)');x.fillStyle=g;x.fillRect(kx-20,ky-20,40,40)}})}
  // slat topper: vertical slats with see-through gaps (alpha)
  var slatTex=canvasTex(512,128,function(x,w,h){var r=rng(3);x.clearRect(0,0,w,h);for(var i=0;i<16;i++){var c=[176+((r()-0.5)*30)|0,142+((r()-0.5)*24)|0,92+((r()-0.5)*20)|0];x.fillStyle='rgb('+c.join(',')+')';x.fillRect(i*w/16,0,w/16*0.62,h)}
    x.fillStyle='rgb(160,128,80)';x.fillRect(0,0,w,10);x.fillRect(0,h-10,w,10);x.fillRect(0,h/2-5,w,10)});
  // bangalow trunk: grey with leaf-scar rings
  var ringTex=canvasTex(64,256,function(x,w,h){x.fillStyle='#8f8e88';x.fillRect(0,0,w,h);var r=rng(5);for(var y=0;y<h;y+=10+r()*6){x.fillStyle='rgba(70,68,62,0.55)';x.fillRect(0,y,w,2);x.fillStyle='rgba(200,198,190,0.25)';x.fillRect(0,y+3,w,3)}
    for(var k=0;k<300;k++){x.fillStyle='rgba(60,60,55,'+r()*0.15+')';x.fillRect(r()*w,r()*h,1,2)}});
  // leaf-cluster card (alpha) for broadleaf trees/shrubs
  function leafCard(seed,cols,n,lw,lh){return canvasTex(256,256,function(x,w,h){var r=rng(seed);x.clearRect(0,0,w,h);
      for(var i=0;i<n;i++){var cx=w*0.5+(r()-0.5)*w*0.82,cy=h*0.5+(r()-0.5)*h*0.82;if(Math.hypot(cx-w/2,cy-h/2)>w*0.46)continue;var a=r()*6.28,c=cols[(r()*cols.length)|0];
        x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=c;x.beginPath();x.ellipse(0,0,lw*(0.7+r()*0.5),lh*(0.7+r()*0.5),0,0,6.3);x.fill();
        x.strokeStyle='rgba(255,255,230,0.18)';x.lineWidth=1;x.beginPath();x.moveTo(-lw,0);x.lineTo(lw,0);x.stroke();x.restore()}})}
  var ashCard=leafCard(11,['#2f5a2a','#3b6b31','#476f36','#28502a','#557a3c'],170,14,4.5);
  var slimCard=leafCard(13,['#4f6b3e','#5c7a47','#3f5d36','#6a8452'],230,10,2.2);
  var vineCard=leafCard(17,['#2d5a2c','#3a6d35','#4b7a3a'],110,11,5);
  var pothCard=leafCard(23,['#1f4a22','#2a5a28','#24502a','#356a30'],70,16,8);
  var violCard=leafCard(19,['#3e6a35','#4c7a3e'],60,9,8);

  /* ---------- materials ---------- */
  function std(o){o.side=o.side||THREE.FrontSide;var m=new THREE.MeshStandardMaterial(o);m.color.convertSRGBToLinear();return m}
  function pbr(map,nor,tile,color,rough,metal,extra){var m=std(Object.assign({map:tex(map,true),normalMap:nor?tex(nor):null,color:color||0xffffff,roughness:rough==null?0.85:rough,metalness:metal||0},extra||{}));m.userData.tile=tile;return m}
  var MAT={}, plain={};
  function makeMats(){
    var pine=std({map:pineTex([222,198,148],21),roughness:0.8});pine.userData.tile=1.2;pine.userData.v=0.3;pine.userData.wood=1;
    var pineDark=std({map:pineTex([196,176,128],23),roughness:0.85});pineDark.userData.tile=1.2;pineDark.userData.v=0.3;pineDark.userData.wood=1;
    var deck=std({map:pineTex([206,178,128],25),roughness:0.7});deck.userData.tile=1.6;deck.userData.v=0.4;deck.userData.wood=1;
    var corr=pbr('corrugated_iron_diff','corrugated_iron_nor',1.14,0xe9eef0,0.42,0.55);
    var corrG=pbr('corrugated_iron_diff','corrugated_iron_nor',1.14,0xb9c0c2,0.5,0.45);
    var poly=std({color:0xeef8fc,roughness:0.15,metalness:0,transparent:true,opacity:0.32,depthWrite:false,side:THREE.DoubleSide,normalMap:tex('corrugated_iron_nor')});poly.userData.tile=1.14;
    var conc=pbr('concrete_diff','concrete_nor',2.0,0xd9d6cf,0.95);
    var gravel=pbr('gravel_floor_02_diff','gravel_floor_02_nor',1.1,0x97a3b0,0.95);
    var lane=pbr('asphalt_02_diff','asphalt_02_nor',3.0,0xcfcfcf,0.95);
    var ply=pbr('plywood_diff','plywood_nor',1.2,0xffffff,0.7);
    var sand=pbr('old_sandstone_02_diff','old_sandstone_02_nor',0.9,0xe6dccb,0.95);
    var newFence=std({map:palingTex([196,158,104],34,'#6b5233'),color:0xffffff,roughness:0.9});newFence.userData.tile=1.0;
    var oldFence=std({map:palingTex([150,146,138],26,'#55524c'),color:0xffffff,roughness:0.95});oldFence.userData.tile=1.0;
    var topper=std({map:slatTex,alphaTest:0.5,side:THREE.DoubleSide,roughness:0.9});topper.userData.tile=1.0;topper.userData.v=0.6;
    var steelDark=std({color:0x30363a,roughness:0.55,metalness:0.4}), ss=std({color:0xd6dadc,roughness:0.28,metalness:0.85}), galv=std({color:0xc3c9cc,roughness:0.35,metalness:0.75});
    var ikea=std({color:0x5d6469,roughness:0.6,metalness:0.2}), glass=std({color:0x1f2f3a,roughness:0.08,metalness:0.4}), door=std({color:0x5b3a22,roughness:0.55});
    var white=std({color:0xf2f2ef,roughness:0.4}), hardwood=std({map:pineTex([150,104,66],29),roughness:0.55});hardwood.userData.tile=1.2;hardwood.userData.v=0.3;hardwood.userData.wood=1;
    MAT={post:pineDark,stump:pineDark,fascia:pine,brace:pine,bearer:pineDark,joist:pineDark,deck:deck,stepdeck:deck,B1:pineDark,B2:pineDark,B3:pineDark,rafter:pine,purlin:pine,slat:pine,slat2:pine,slatrail:pineDark,fcframe:pine,stepframe:pine,
      sheet:poly,zinc:corr,swall:corr,sroof:std({color:0xf1f2f0,roughness:0.5,metalness:0.2}),groof:corr,gwall:corrG,gpoly:std({color:0xdce8ea,transparent:true,opacity:0.5,roughness:0.3}),
      footing:conc,slab:conc,gravel:conc,paver:sand,chain:std({color:0xa8643a,roughness:0.35,metalness:0.8}),creek:pbr('gravel_stones_diff','gravel_stones_nor',0.6,0xd9c8a8,0.9),blue:gravel,lane:lane,ply:ply,rock:sand,rock2:sand,
      fence:newFence,fencetop:topper,gatetop:topper,pgate:newFence,fencepost:pineDark,gate:newFence,fencegrey:oldFence,fencegreypost:std({color:0x7c7a74,roughness:0.95}),
      anchor:galv,steel:steelDark,gutter:galv,planter:galv,firepit:steelDark,ikea:ikea,ikdoor:std({color:0x4a5054,roughness:0.6}),ikss:ss,ikburn:std({color:0x15181a,roughness:0.6}),ss:ss,ssb:ss,ssleg:ss,
      glass:glass,appdoor:glass,door:door,gdoor:std({color:0x8d7748,roughness:0.7}),floor:pine,appl:white,table:hardwood,tleg:steelDark,boundary:std({color:0xc2500f,roughness:0.8})};
  }
  function matFor(g){if(MAT[g])return MAT[g];var s=(window.__S||{})[g];if(plain[g])return plain[g];var o={color:s?s[0]:0x999999,roughness:0.8};if(s&&s[1]!==undefined&&s[1]<1){o.transparent=true;o.opacity=s[1]}return plain[g]=std(o)}

  /* ---------- UVs in metres from geometry (box-projected) ---------- */
  function planarUV(geo,tile,vscale,longAx){var p=geo.attributes.position,n=geo.attributes.normal,uv=new Float32Array(p.count*2),t=tile||1,vs=vscale||t;
    for(var i=0;i<p.count;i++){var nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i)),c=[p.getX(i),p.getY(i),p.getZ(i)],u,v,ax=(ny>=nx&&ny>=nz)?1:(nx>=nz?0:2),pl=[0,1,2].filter(function(a){return a!==ax});
      if(longAx!=null&&pl.indexOf(longAx)>=0){u=c[longAx];v=c[pl[0]===longAx?pl[1]:pl[0]]}
      else if(ax===1){u=c[0];v=c[2]}else if(ax===0){u=c[2];v=c[1]}else{u=c[0];v=c[1]}uv[2*i]=u/t;uv[2*i+1]=v/vs}
    geo.setAttribute('uv',new THREE.BufferAttribute(uv,2))}

  /* ---------- groups / picking ---------- */
  var FIT={slatrail:1,firepit:1,ikea:1,ikdoor:1,ikss:1,ikburn:1,ssb:1,ssleg:1,slat2:1,fc:1,fcframe:1,ply:1,ktop:1,ss:1,burner:1,appl:1,appdoor:1,table:1,tleg:1}, PER={person:1,personh:1};
  var GRD={blue:1,lane:1};
  var CTX={pgate:1,gatetop:1,fencegrey:1,fencegreypost:1,gate:1,boundary:1,planter:1,rock2:1,swall:1,sroof:1,glass:1,door:1,steel:1,floor:1,gwall:1,gpoly:1,groof:1,gdoor:1,slab:1,gutter:1,fence:1,fencetop:1};
  var groups={sheet:[],deck:[],ctx:[],ground:[],slat:[],fit:[],person:[],plant:[]}, pickable=[];
  var NOSHADOW={sheet:1,gpoly:1,boundary:1,blue:1,lane:1};
  function add(o,g,kind){scene.add(o); o.userData.g=g;
    o.traverse(function(c){if(c.isMesh){c.castShadow=!NOSHADOW[g];c.receiveShadow=true;c.userData.g=g;if(LAB[g]||kind)pickable.push(c)}});
    if(kind==='plant'){groups.plant.push(o);return}
    if(g==='sheet'||g==='zinc')groups.sheet.push(o); if(g==='deck'||g==='stepdeck')groups.deck.push(o); if(FIT[g])groups.fit.push(o); if(PER[g])groups.person.push(o);
    if(g==='slat'){groups.slat.push(o);o.visible=false} if(CTX[g])groups.ctx.push(o); if(GRD[g])groups.ground.push(o)}

  /* ---------- build the model ---------- */
  function buildModel(){
    makeMats();
    D.M.forEach(function(m){
      var g=m[0], ty=m[7], geo, mesh;
      if(g==='person'||g==='personh'||g.indexOf('pl_')===0||g==='trunk')return;
      if(g==='chain'){var CG=new THREE.Group(),cm=matFor('chain'),z0=(m[3]-m[6]/2)/1000,z1=(m[3]+m[6]/2)/1000,tg=new THREE.TorusGeometry(0.03,0.007,6,14),k=0;
        for(var zz=z1;zz>z0;zz-=0.05){var t=new THREE.Mesh(tg,cm);t.position.y=zz;t.rotation.y=(k++%2)*Math.PI/2;CG.add(t)}
        var cup=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.035,0.12,14,1,true),cm);cup.position.y=z1+0.06;CG.add(cup);
        var bowl=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.14,0.08,20),std({color:0x6e6a62,roughness:0.9}));bowl.position.y=0.04;CG.add(bowl);
        CG.position.set(m[1]/1000,0,m[2]/1000);add(CG,g);return}
      geo=ty===6?new THREE.SphereGeometry(0.5,18,12):ty===2?new THREE.CylinderGeometry(m[4]/2000,m[4]/2000,m[6]/1000,28):new THREE.BoxGeometry(m[4]/1000,m[6]/1000,m[5]/1000);
      var mt=matFor(g); if(mt.userData.tile){var la=null;if(mt.userData.wood&&ty!==2&&ty!==6){var dm=[m[4],m[6],m[5]];la=dm.indexOf(Math.max.apply(null,dm))}planarUV(geo,mt.userData.tile,mt.userData.v,la)}
      mesh=new THREE.Mesh(geo,mt); mesh.position.set(m[1]/1000,m[3]/1000,m[2]/1000);
      if(ty===6)mesh.scale.set(m[4]/1000,m[6]/1000,m[5]/1000); if(ty===1)mesh.rotation.x=m[8]; if(ty===3)mesh.rotation.y=-m[8]; if(ty===5)mesh.rotation.z=m[8];
      add(mesh,g);
    });
    D.P.forEach(function(p){
      var x=p[1]/1000, pts=p[2], pos=[], idx=[], i;
      for(i=0;i<pts.length;i++)pos.push(x,pts[i][1]/1000,pts[i][0]/1000);
      for(i=1;i<pts.length-1;i++)idx.push(0,i,i+1);
      var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
      var mt=matFor(p[0]); if(mt.userData.tile)planarUV(geo,mt.userData.tile);
      var me=new THREE.Mesh(geo,mt.side===THREE.DoubleSide?mt:(function(){var c=mt.clone();c.side=THREE.DoubleSide;return c})()); add(me,p[0]);
    });
    (D.R||[]).forEach(function(r){var v=r[1],pos=[],i;for(i=0;i<v.length;i+=3)pos.push(v[i]/1000,v[i+2]/1000,v[i+1]/1000);
      var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(r[2]);geo.computeVertexNormals();planarUV(geo,0.9);
      var mt=matFor(r[0]).clone();mt.side=THREE.DoubleSide;add(new THREE.Mesh(geo,mt),r[0])});
    var gmat=std({color:0x59603f,roughness:1});
    var ground=new THREE.Mesh(new THREE.PlaneGeometry(60,50),gmat); ground.rotation.x=-Math.PI/2; ground.position.set(3,-0.003,3); ground.receiveShadow=true; scene.add(ground); groups.ground.push(ground);
    buildPlants();
    loadPerson();
  }

  /* =================== procedural native plants =================== */
  var V3=THREE.Vector3;
  function Buf(){this.p=[];this.n=[];this.c=[];this.i=[];this.uv=[]}
  Buf.prototype.mesh=function(mat){var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));
    if(this.c.length)g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3)); if(this.uv.length)g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uv,2));
    g.setIndex(this.i);g.computeVertexNormals();return new THREE.Mesh(g,mat)};
  function col(hex){var c=new THREE.Color(hex);return c.convertSRGBToLinear()}
  // a ribbon leaf: base point, heading (azimuth), start elevation (rad from horizontal), length, width, droop (gravity), taper both ends?
  function ribbon(B,base,az,elev,len,wid,droop,c0,c1,shape,seg){seg=seg||9;var dir=new V3(Math.cos(az)*Math.cos(elev),Math.sin(elev),Math.sin(az)*Math.cos(elev)),
      side=new V3(-Math.sin(az),0,Math.cos(az)),p=base.clone(),start=B.p.length/3,ds=len/seg;
    for(var k=0;k<=seg;k++){var t=k/seg,w;
      if(shape==='lance')w=wid*Math.sin(Math.PI*Math.min(1,t*1.05))*0.5+0.0006; else if(shape==='sword')w=wid*(1-Math.pow(t,1.6))*0.5+0.0005; else w=wid*(1-t*0.85)*0.5+0.0005;
      var tw=Math.sin(t*2.5)*0.25, up=new V3().crossVectors(side,dir).normalize(), s2=side.clone().multiplyScalar(Math.cos(tw)).add(up.clone().multiplyScalar(Math.sin(tw)));
      var a=p.clone().addScaledVector(s2,-w), b=p.clone().addScaledVector(s2,w);
      // slight fold (V section) gives depth
      var fold=up.clone().multiplyScalar(w*0.25); a.add(fold); b.add(fold);
      B.p.push(a.x,a.y,a.z,b.x,b.y,b.z); var cc=c0.clone().lerp(c1,t); B.c.push(cc.r,cc.g,cc.b,cc.r*0.92,cc.g*0.92,cc.b*0.92);
      if(k<seg){var i0=start+k*2;B.i.push(i0,i0+1,i0+2,i0+1,i0+3,i0+2)}
      p.addScaledVector(dir,ds); dir.y-=droop*ds; dir.normalize()}
    return p}
  function tube(B,a,b,r0,r1,c,sides){sides=sides||7;var d=new V3().subVectors(b,a),L=d.length();d.normalize();var u=Math.abs(d.y)<0.9?new V3(0,1,0):new V3(1,0,0),s=new V3().crossVectors(d,u).normalize(),t=new V3().crossVectors(s,d).normalize(),st=B.p.length/3;
    for(var e=0;e<2;e++){var o=e?b:a,r=e?r1:r0;for(var k=0;k<sides;k++){var an=k/sides*6.283,v=o.clone().addScaledVector(s,Math.cos(an)*r).addScaledVector(t,Math.sin(an)*r);B.p.push(v.x,v.y,v.z);B.c.push(c.r,c.g,c.b)}}
    for(var k2=0;k2<sides;k2++){var k3=(k2+1)%sides;B.i.push(st+k2,st+sides+k2,st+k3,st+k3,st+sides+k2,st+sides+k3)}}
  function cards(group,tex,centers,size,seed,colorHex,upright){var r=rng(seed),B=new Buf();
    centers.forEach(function(c){var n=3;for(var k=0;k<n;k++){var az=r()*3.14,tilt=upright?(r()-0.5)*0.5:(r()-0.5)*1.4,s=size*(0.75+r()*0.5);
      var ax=new V3(Math.cos(az),0,Math.sin(az)),ay=new V3(0,1,0).applyAxisAngle(ax,tilt),st=B.p.length/3,
          corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
      corners.forEach(function(q){var v=c.clone().addScaledVector(ax,q[0]*s/2).addScaledVector(ay,q[1]*s/2);B.p.push(v.x,v.y,v.z)});
      B.uv.push(0,0,1,0,1,1,0,1);var sh=0.85+r()*0.3;for(var j=0;j<4;j++)B.c.push(sh,sh,sh);B.i.push(st,st+1,st+2,st,st+2,st+3)}});
    var m=std({map:tex,alphaTest:0.45,side:THREE.DoubleSide,vertexColors:true,color:colorHex||0xffffff,roughness:0.75});
    var mesh=B.mesh(m);mesh.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:0.45});group.add(mesh)}
  var leafMat=std({vertexColors:true,side:THREE.DoubleSide,roughness:0.62,metalness:0});
  var barkMat=std({vertexColors:true,roughness:0.9});

  function strappy(G,r,n,lenA,lenB,wid,elevA,elevB,droop,c0,c1,shape,y0){var B=new Buf();y0=y0||0;
    for(var i=0;i<n;i++){var az=r()*6.283,el=elevA+(elevB-elevA)*Math.pow(r(),0.8),L=lenA+(lenB-lenA)*r();
      ribbon(B,new V3((r()-0.5)*0.06,y0,(r()-0.5)*0.06),az,el,L,wid*(0.8+r()*0.4),droop*(0.7+r()*0.6),col(c0).offsetHSL((r()-0.5)*0.03,0,(r()-0.5)*0.06),col(c1),shape)}
    G.add(B.mesh(leafMat))}
  var SPECIES={
    lom:function(G,r){strappy(G,r,95,0.65,1.0,0.012,0.55,1.45,1.25,0x3f5a26,0x768a40,'strap')},
    lsp:function(G,r){strappy(G,r,55,0.35,0.55,0.014,0.5,1.4,1.4,0x3f6230,0x6f8a48,'strap')},
    dian:function(G,r){strappy(G,r,46,0.45,0.65,0.02,0.6,1.4,1.0,0x355f2c,0x58803e,'strap');
      var B=new Buf();for(var k=0;k<5;k++){var a=r()*6.28,h=0.55+r()*0.25,base=new V3(Math.cos(a)*0.08,0,Math.sin(a)*0.08),top=new V3(Math.cos(a)*0.18,h,Math.sin(a)*0.18);tube(B,base,top,0.004,0.003,col(0x6d7a45),4)}
      G.add(B.mesh(barkMat));var bm=std({color:0x3046a8,roughness:0.3});for(var j=0;j<10;j++){var s=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,5),bm);var a2=r()*6.28;s.position.set(Math.cos(a2)*(0.12+r()*0.08),0.5+r()*0.25,Math.sin(a2)*(0.12+r()*0.08));G.add(s)}},
    cstr:function(G,r){var B=new Buf(),L=new Buf(),n=3+((r()*2)|0);for(var k=0;k<n;k++){var a=r()*6.28,h=1.3+r()*1.2,lean=0.08+r()*0.12,base=new V3((r()-0.5)*0.15,0,(r()-0.5)*0.15),top=new V3(base.x+Math.cos(a)*lean,h,base.z+Math.sin(a)*lean);
        tube(B,base,top,0.022,0.016,col(0x6b6152),6);for(var i=0;i<26;i++){var az=r()*6.28,el=-0.3+r()*1.6;ribbon(L,top.clone().add(new V3(0,-r()*0.12,0)),az,el,0.38+r()*0.22,0.028,0.9,col(0x24492a).offsetHSL(0,0,(r()-0.5)*0.05),col(0x3e6a35),'sword')}
        for(var j=0;j<10;j++){var y=0.2+r()*(h-0.6),p=new V3(base.x+(top.x-base.x)*y/h,y,base.z+(top.z-base.z)*y/h);ribbon(L,p,r()*6.28,-0.6+r()*0.6,0.28+r()*0.12,0.02,0.7,col(0x4d5b34),col(0x6b6b3e),'sword')}}
      G.add(B.mesh(barkMat));G.add(L.mesh(leafMat))},
    ging:function(G,r){var B=new Buf(),L=new Buf(),n=9+((r()*5)|0);for(var k=0;k<n;k++){var a=r()*6.28,d=r()*0.22,h=1.1+r()*0.8,base=new V3(Math.cos(a)*d,0,Math.sin(a)*d),top=new V3(base.x*1.6+Math.cos(a)*0.12,h,base.z*1.6+Math.sin(a)*0.12);
        tube(B,base,top,0.009,0.006,col(0x55703c),5);var m=7+((r()*3)|0);for(var i=0;i<m;i++){var t=0.35+0.62*i/m,p=base.clone().lerp(top,t),az=a+(i%2?1:-1)*1.4+(r()-0.5)*0.5;ribbon(L,p,az,0.35+r()*0.5,0.32+r()*0.15,0.085,0.55,col(0x2d5f2c).offsetHSL(0,0,(r()-0.5)*0.05),col(0x3e7536),'lance',7)}}
      G.add(B.mesh(barkMat));G.add(L.mesh(leafMat));var bm=std({color:0x2b4fb5,roughness:0.25});for(var j=0;j<8;j++){var s=new THREE.Mesh(new THREE.SphereGeometry(0.014,6,5),bm);s.position.set((r()-0.5)*0.5,1.3+r()*0.5,(r()-0.5)*0.5);G.add(s)}},
    dory:function(G,r){strappy(G,r,70,1.0,1.65,0.10,0.25,1.35,0.55,0x46663a,0x7d9257,'sword');var B=new Buf();var top=new V3(0.15,2.9,0.1);tube(B,new V3(0,0,0),top,0.04,0.025,col(0x5c6d3a),7);G.add(B.mesh(barkMat));
      var fm=std({color:0x7a161a,roughness:0.6}),bm2=std({color:0x5a2a1c,roughness:0.7});for(var k=0;k<70;k++){var t=r(),s=new THREE.Mesh(new THREE.ConeGeometry(0.022+r()*0.012,0.09,6),r()<0.8?fm:bm2);var a=r()*6.28,rr=0.06+0.1*Math.sin(Math.PI*t);s.position.set(top.x+Math.cos(a)*rr,top.y-0.7*t+0.15,top.z+Math.sin(a)*rr);s.rotation.set(r()*3,r()*3,r()*3);G.add(s)}},
    wsp:function(G,r){var B=new Buf(),L=new Buf(),n=2+((r()*2)|0);for(var k=0;k<n;k++){var a=r()*6.28,h=1.3+r()*0.7,base=new V3((r()-0.5)*0.2,0,(r()-0.5)*0.2),top=new V3(base.x+Math.cos(a)*0.05,h,base.z+Math.sin(a)*0.05);
        tube(B,base,top,0.016,0.013,col(0x4b6a3a),6);for(var f=0;f<9;f++){var az=f/9*6.28+r()*0.5,el=0.1+r()*0.9,dir=new V3(Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)),p=top.clone();
          for(var s=0;s<7;s++){p.addScaledVector(dir,0.12);dir.y-=0.16;dir.normalize();ribbon(L,p.clone(),az+1.3,el-0.5,0.3,0.09,0.6,col(0x2a5428),col(0x3f6e35),'lance',5);ribbon(L,p.clone(),az-1.3,el-0.5,0.3,0.09,0.6,col(0x2a5428),col(0x3f6e35),'lance',5)}
          tube(B,top,p,0.004,0.003,col(0x4b6a3a),4)}}G.add(B.mesh(barkMat));G.add(L.mesh(leafMat))},
    bang:function(G,r){var h=3.7+r()*0.8,B=new Buf(),L=new Buf(),lean=new V3((r()-0.5)*0.25,0,(r()-0.5)*0.25),top=new V3(lean.x,h,lean.z);
      var trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.14,h,14,1,true),std({map:ringTex,roughness:0.85}));trunk.position.set(lean.x/2,h/2,lean.z/2);trunk.rotation.set(lean.z/h,0,-lean.x/h);ringTex.repeat.set(1,h/0.9);G.add(trunk);
      var cs=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.8,12),std({color:0x6f8c3c,roughness:0.5}));cs.position.set(top.x,h+0.4,top.z);G.add(cs);
      var crown=new V3(top.x,h+0.75,top.z),nf=9;for(var f=0;f<nf;f++){var az=f/nf*6.283+r()*0.4,el=0.45+r()*0.9,dir=new V3(Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)),p=crown.clone(),len=2.3+r()*0.6,seg=24;
        var prev=p.clone();for(var s=0;s<seg;s++){var t=s/seg;p.addScaledVector(dir,len/seg);dir.y-=0.075*len/seg*9;dir.normalize();tube(B,prev,p,0.018*(1-t)+0.004,0.016*(1-t)+0.003,col(0x7b8c48),4);prev=p.clone();
          if(t>0.12){var ll=0.62*Math.sin(Math.PI*Math.min(1,(t-0.1)/0.92))+0.12;var sideAz=Math.atan2(dir.z,dir.x);for(var q=-1;q<=1;q+=2)ribbon(L,p.clone(),sideAz+q*1.35,-0.35+r()*0.25,ll,0.03,0.9,col(0x3f6e2c).offsetHSL(0,0,(r()-0.5)*0.05),col(0x5b8a3a),'sword',4)}}}
      G.add(B.mesh(barkMat));G.add(L.mesh(leafMat))},
    ash:function(G,r){var B=new Buf(),H=4.4+r()*0.4,leader=[new V3(0,0,0)],p=new V3(0,0,0);for(var s=1;s<=6;s++){p=p.clone().add(new V3((r()-0.5)*0.12,H/6,(r()-0.5)*0.12));leader.push(p)}
      for(var s2=0;s2<6;s2++)tube(B,leader[s2],leader[s2+1],0.075*(1-s2/7)+0.015,0.075*(1-(s2+1)/7)+0.012,col(0x6e665a),7);
      var centers=[];for(var b=0;b<11;b++){var t=0.22+0.72*b/11,base=leader[Math.min(5,(t*6)|0)].clone(),a=r()*6.28,len=(0.55+r()*0.45)*(1-t*0.45),end=base.clone().add(new V3(Math.cos(a)*len,len*0.9,Math.sin(a)*len));tube(B,base,end,0.03,0.012,col(0x6e665a),5);
        for(var k=0;k<5;k++)centers.push(base.clone().lerp(end,0.35+0.65*r()).add(new V3((r()-0.5)*0.3,(r()-0.2)*0.3,(r()-0.5)*0.3)))}
      for(var j=0;j<30;j++){var y=1.2+r()*(H-1.2),rad=0.95*Math.sin(Math.PI*(y-0.9)/(H-0.6))+0.15,a3=r()*6.28;centers.push(new V3(Math.cos(a3)*rad*r(),y,Math.sin(a3)*rad*r()))}
      G.add(B.mesh(barkMat));cards(G,ashCard,centers,0.75,r()*1e9|0,0xffffff,false)},
    slim:function(G,r){var B=new Buf(),y0=G.userData.y0||0,centers=[],H=2.2+r()*0.3;for(var k=0;k<14;k++){var a=r()*6.28,d=r()*0.16,base=new V3(Math.cos(a)*d*0.4,y0,Math.sin(a)*d*0.4),top=new V3(Math.cos(a)*(d+0.12),y0+H*(0.7+r()*0.3),Math.sin(a)*(d+0.12));tube(B,base,top,0.012,0.005,col(0x6a5a48),4);
        for(var j=0;j<5;j++)centers.push(base.clone().lerp(top,0.25+0.75*r()))}
      G.add(B.mesh(barkMat));cards(G,slimCard,centers,0.42,r()*1e9|0,0xffffff,true);
      var bm=std({color:0xc0262b,roughness:0.6});for(var q=0;q<22;q++){var c=centers[(r()*centers.length)|0],m=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.09,7),bm);m.position.copy(c).add(new V3((r()-0.5)*0.15,0.05,(r()-0.5)*0.15));m.rotation.z=(r()-0.5)*0.6;G.add(m)}},
    vine:function(G,r){var centers=[];for(var k=0;k<70;k++){var hy=Math.pow(r(),0.6);centers.push(new V3(-0.03-r()*0.08,0.3+hy*1.55,(r()-0.5)*(0.5+hy*1.6)))}
      var B=new Buf();cards(G,vineCard,centers,0.42,r()*1e9|0,0xffffff,true);G.children[G.children.length-1].rotation.y=0;
      var fm=std({color:0xf4e9ef,roughness:0.6}),pm=std({color:0xb94f80,roughness:0.6});for(var j=0;j<26;j++){var s=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.05,6),r()<0.5?fm:pm);s.position.set(-0.07,0.4+r()*1.4,(r()-0.5)*1.4);s.rotation.z=1.4;G.add(s)}},
    tfern:function(G,r){var B=new Buf(),L=new Buf(),h=2.3+r()*0.5,top=new V3((r()-0.5)*0.15,h,(r()-0.5)*0.15);
      var tr=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,h,10),std({color:0x4a3a2c,roughness:1}));tr.position.set(top.x/2,h/2,top.z/2);G.add(tr);
      var nf=14;for(var f=0;f<nf;f++){var az=f/nf*6.283+r()*0.3,el=0.15+r()*0.75,dir=new V3(Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)),p=top.clone(),len=1.1+r()*0.35,seg=28,prev=p.clone();
        for(var s=0;s<seg;s++){var t=s/seg;p.addScaledVector(dir,len/seg);dir.y-=0.09;dir.normalize();tube(B,prev,p,0.012*(1-t)+0.003,0.011*(1-t)+0.003,col(0x5a5030),4);prev=p.clone();
          if(t>0.06){var ll=0.24*Math.sin(Math.PI*Math.min(1,(t-0.03)/0.97))+0.04,sa=Math.atan2(dir.z,dir.x);for(var q=-1;q<=1;q+=2){var pp=p.clone(),pd=new V3(Math.cos(sa+q*1.5),-0.15,Math.sin(sa+q*1.5)).normalize();for(var u=1;u<=4;u++){var qp=pp.clone().addScaledVector(pd,ll*u/4.5);ribbon(L,qp,sa+q*1.5+0.9,-0.4,ll*0.32,0.022,0.3,col(0x5a9a38).offsetHSL(0,0,(r()-0.5)*0.05),col(0x86b84a),'lance',3);ribbon(L,qp,sa+q*1.5-0.9,-0.4,ll*0.32,0.022,0.3,col(0x5a9a38),col(0x86b84a),'lance',3)}tube(B,pp,pp.clone().addScaledVector(pd,ll),0.003,0.002,col(0x6a7a3a),3)}}}}
      G.add(B.mesh(barkMat));G.add(L.mesh(leafMat))},
    cpet:function(G,r){var B=new Buf(),L=new Buf(),n=2+((r()*2)|0);for(var k=0;k<n;k++){var a=r()*6.28,h=1.4+r()*1.0,base=new V3((r()-0.5)*0.15,0,(r()-0.5)*0.15),top=new V3(base.x+Math.cos(a)*0.15,h,base.z+Math.sin(a)*0.15);
        tube(B,base,top,0.025,0.018,col(0x6b6152),6);for(var i=0;i<16;i++){var red=r()<0.3;ribbon(L,top.clone().add(new V3(0,-r()*0.15,0)),r()*6.28,-0.2+r()*1.3,0.55+r()*0.25,0.11,0.9,red?col(0x6e2a2a):col(0x2c5a26).offsetHSL(0,0,(r()-0.5)*0.05),red?col(0x8a3a30):col(0x467a35),'lance',7)}}
      G.add(B.mesh(barkMat));G.add(L.mesh(leafMat));var bm=std({color:0xb3202a,roughness:0.4});for(var j=0;j<10;j++){var s=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,5),bm);s.position.set((r()-0.5)*0.4,1.0+r()*0.6,(r()-0.5)*0.4);G.add(s)}},
    cunj:function(G,r){var B=new Buf(),L=new Buf();for(var k=0;k<7;k++){var a=r()*6.28,h=0.5+r()*0.5,top=new V3(Math.cos(a)*0.25,h,Math.sin(a)*0.25);tube(B,new V3(0,0,0),top,0.02,0.012,col(0x5d7a3a),5);
        ribbon(L,top,a,-0.5-r()*0.3,0.55+r()*0.2,0.42,0.3,col(0x2f6a28),col(0x3f7f30),'lance',8)}G.add(B.mesh(barkMat));G.add(L.mesh(leafMat))},
    bnf:function(G,r){var L=new Buf(),y0=0.28;for(var k=0;k<16;k++){var a=k/16*6.28+r()*0.3;ribbon(L,new V3(0,y0,0),a,0.6+r()*0.5,0.5+r()*0.25,0.13,0.6,col(0x5c9a2e),col(0x8ab83e),'lance',7)}G.add(L.mesh(leafMat));
      var rk=new THREE.Mesh(new THREE.DodecahedronGeometry(0.32,0),std({color:0xcdb995,roughness:1}));rk.scale.set(1.2,0.8,1);rk.position.y=0.12;G.add(rk)},
    pot:function(G,r){var p=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.26,0.5,28,1),std({color:0x3e5a68,roughness:0.25,metalness:0.1}));p.position.y=0.25;G.add(p);
      var soil=new THREE.Mesh(new THREE.CylinderGeometry(0.31,0.31,0.02,24),std({color:0x3b2e22,roughness:1}));soil.position.y=0.47;G.add(soil);
      var c=[];for(var k=0;k<7;k++)c.push(new V3((r()-0.5)*0.4,0.52,(r()-0.5)*0.4));cards(G,violCard,c,0.22,r()*1e9|0,0xffffff,false)},
    crin:function(G,r){strappy(G,r,22,0.7,1.05,0.09,0.35,1.2,0.9,0x4a7a3a,0x7a9a52,'sword');var B=new Buf();for(var k=0;k<2;k++){var a=r()*6.28,top=new V3(Math.cos(a)*0.25,0.9+r()*0.2,Math.sin(a)*0.25);tube(B,new V3(0,0,0),top,0.012,0.01,col(0x6d8a45),5);
      var fm=std({color:0xf4f1ea,roughness:0.5});for(var j=0;j<10;j++){var f=new THREE.Mesh(new THREE.ConeGeometry(0.02,0.16,5),fm);f.position.copy(top).add(new V3((r()-0.5)*0.22,(r()-0.3)*0.12,(r()-0.5)*0.22));f.rotation.set((r()-0.5)*2,0,(r()-0.5)*2);G.add(f)}}G.add(B.mesh(barkMat))},
    cvine:function(G,r){var centers=[],B=new Buf();for(var k=0;k<80;k++){var t=Math.pow(r(),0.8);centers.push(new V3(-t*2.5,0.25+r()*(1.9-t*0.4),-0.05-r()*0.06))}
      cards(G,pothCard,centers,0.34,r()*1e9|0,0xffffff,true);var wm=std({color:0x9aa3a8,metalness:0.8,roughness:0.3});for(var h=0.6;h<2.1;h+=0.45){tube(B,new V3(0,h,-0.03),new V3(-2.6,h,-0.03),0.003,0.003,col(0x9aa3a8),3)}G.add(B.mesh(wm))},
    viol:function(G,r){var centers=[];for(var k=0;k<5;k++)centers.push(new V3((r()-0.5)*0.25,0.04,(r()-0.5)*0.25));cards(G,violCard,centers,0.2,r()*1e9|0,0xffffff,false);
      var pm=std({color:0x6c4fb0,roughness:0.6});for(var j=0;j<7;j++){var s=new THREE.Mesh(new THREE.SphereGeometry(0.01,6,5),pm);s.position.set((r()-0.5)*0.25,0.08,(r()-0.5)*0.25);G.add(s)}}
  };
  var PLAB={crin:'pl_crin',cvine:'pl_cvine',tfern:'pl_tfern',cpet:'pl_cpet',cunj:'pl_cunj',bnf:'pl_bnf',pot:'pl_pot',lom:'pl_lom',lsp:'pl_lsp',dian:'pl_dian',cstr:'pl_cstr',ging:'pl_ging',dory:'pl_dory',wsp:'pl_wsp',bang:'pl_bang',ash:'pl_ash',slim:'pl_slim',vine:'pl_vine',viol:'pl_viol'};
  function buildPlants(){(D.PL||[]).forEach(function(p){var G=new THREE.Group(),r=rng(p[3]*7919+13),k=p[0];
      var x=p[1]/1000,z=p[2]/1000,y=0;if(k==='slim'&&x<0){G.userData.y0=0.58}
      if(SPECIES[k])SPECIES[k](G,r);G.position.set(x,y,z);G.rotation.y=k==='vine'?0:k==='cvine'?0:r()*6.28;add(G,PLAB[k]||k,'plant')})}

  /* ---------- person (three.js Xbot mannequin scaled to 6'3") ---------- */
  function loadPerson(){if(!THREE.GLTFLoader||!D.PERSON)return;new THREE.GLTFLoader().load(BASE+'xbot.json',function(gl){var o=gl.scene;
      var s=1.905/1.775;o.scale.setScalar(s);o.position.set(D.PERSON[0]/1000,D.PERSON[2]/1000,D.PERSON[1]/1000);o.rotation.y=D.PERSON[3]||0;
      if(gl.animations&&gl.animations.length){var mix=new THREE.AnimationMixer(o),cl=THREE.AnimationClip.findByName(gl.animations,'idle')||gl.animations[0];mix.clipAction(cl).play();mix.update(0.6)}
      o.traverse(function(c){if(c.isMesh){c.frustumCulled=false;c.material=std({color:/Joints/.test(c.name)?0x3c4348:0x9aa7b0,roughness:0.55,metalness:0.1,skinning:true})}});add(o,'person');draw()},undefined,function(){})}

  /* ---------- UI ---------- */
  function bind(id,key){var el=document.getElementById(id);if(!el)return; el.addEventListener('change',function(){groups[key].forEach(function(o){o.visible=el.checked}); draw()})}
  var ray=new THREE.Raycaster(), mv=new THREE.Vector2(), down=null;
  function show(g){var l=LAB[g]; if(!l)return; pick.innerHTML='<b>'+l[0]+'</b>'+l[1]+(l[2]?'<span class="src">'+l[2]+'</span>':'')}
  function hit(ev){var r=cv.getBoundingClientRect(); mv.x=((ev.clientX-r.left)/r.width)*2-1; mv.y=-((ev.clientY-r.top)/r.height)*2+1; ray.setFromCamera(mv,cam);
    var hs=ray.intersectObjects(pickable.filter(function(o){var v=true;o.traverseAncestors(function(a){if(a.visible===false)v=false});return v&&o.visible}),false); return hs.length?hs[0].object:null}
  cv.addEventListener('pointerdown',function(e){down=[e.clientX,e.clientY]});
  cv.addEventListener('pointerup',function(e){ if(!down)return; var moved=Math.abs(e.clientX-down[0])+Math.abs(e.clientY-down[1]); down=null; if(moved>6)return;
    var o=hit(e); if(o){show(o.userData.g)} else {pick.innerHTML='<b>Tap a part</b>Each piece and plant shows what it is and where it comes from.'} });
  function size(){var w=box.clientWidth,h=box.clientHeight; if(!w||!h)return; renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); draw()}
  var pending=false; function draw(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;renderer.render(scene,cam)})}
  window.__draw=function(){renderer.render(scene,cam)};
  ctl.addEventListener('change',draw);
  buildModel();
  ['sheet','deck','ctx','ground','slat','fit','person','plant'].forEach(function(k){bind('t-'+k,k)});
  document.querySelectorAll('.views button').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.v)})});
  if(window.ResizeObserver)new ResizeObserver(size).observe(box); else window.addEventListener('resize',size);
  setView('site'); size(); setTimeout(draw,400);
})();
