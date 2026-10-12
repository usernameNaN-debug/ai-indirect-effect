// The supplied prototype's Matter physics, with resize and lifecycle support.
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function seeded(seed){let a=seed|0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function closest(vertices,p){
    let best=null,distance=Infinity;
    for(let i=0;i<vertices.length;i++){
      const a=vertices[i],b=vertices[(i+1)%vertices.length],dx=b.x-a.x,dy=b.y-a.y;
      const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
      const q={x:a.x+t*dx,y:a.y+t*dy},d=Math.hypot(q.x-p.x,q.y-p.y);
      if(d<distance){distance=d;best=q;}
    }
    return{point:best,distance};
  }
  class MotionField{
    constructor(M,width,height,definitions){
      this.M=M;this.width=width;this.height=height;this.definitions=definitions;this.clock=0;this.contacts=0;this.objectContacts=0;this.pointerEntries=0;
      this.settings={kick:7.4,omega:3.3,restitution:.87,radius:76};
      this.pointer={x:-1000,y:-1000,vx:0,vy:0,active:false};
      this.engine=M.Engine.create({gravity:{x:0,y:0,scale:0},positionIterations:9,velocityIterations:8,enableSleeping:false});
      this.items=[];this.layout(0);
      M.Events.on(this.engine,'collisionStart',event=>{if(this.arranging)return;this.contacts+=event.pairs.length;this.objectContacts+=event.pairs.filter(p=>!p.bodyA.isStatic&&!p.bodyB.isStatic).length;});
    }
    layout(seed=0,preserve=false){
      const previous=new Map(preserve?this.items.map(item=>[item.id,{position:{...item.body.position},velocity:{...item.body.velocity},angle:item.body.angle,angularVelocity:item.body.angularVelocity,width:item.width}]):[]);
      const M=this.M;this.arranging=true;M.Composite.clear(this.engine.world,false);M.Engine.clear(this.engine);this.items=[];
      const w=this.width,h=this.height,random=seeded(7211+seed*137),count=this.definitions.length;
      const columns=Math.max(2,Math.round(Math.sqrt(count*w/h))),rows=Math.ceil(count/columns),margin=Math.min(18,w*.035);
      const cellW=(w-margin*2)/columns,cellH=(h-margin*2)/rows,slots=[];
      this.motionScale=clamp(Math.min(cellW,cellH)/170,.5,1.08);
      this.pointerRadius=clamp(Math.min(cellW,cellH)*.3,28,60);
      for(let row=0;row<rows;row++){const inRow=Math.min(columns,count-row*columns);for(let col=0;col<inRow;col++)slots.push({x:margin+cellW*(col+.5+(columns-inRow)/2),y:margin+cellH*(row+.5)});}
      for(let i=slots.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
      this.definitions.forEach((d,i)=>{
        const angle=(d.angle||0)+(random()-.5)*.62,unit=d.hull.map(([x,y])=>({x,y:y/d.ratio}));
        const origin=M.Vertices.centre(unit),cos=Math.cos(angle),sin=Math.sin(angle);
        const rotated=unit.map(p=>({x:(p.x-origin.x)*cos-(p.y-origin.y)*sin,y:(p.x-origin.x)*sin+(p.y-origin.y)*cos}));
        const spanX=Math.max(...rotated.map(p=>p.x))-Math.min(...rotated.map(p=>p.x)),spanY=Math.max(...rotated.map(p=>p.y))-Math.min(...rotated.map(p=>p.y));
        const width=previous.get(d.id)?.width??d.spawnWidth??Math.min(cellW*.73/spanX,cellH*.77/spanY)*(d.scale||1),height=width/d.ratio;
        const vertices=M.Vertices.hull(d.hull.map(([x,y])=>({x:x*width,y:y*height})));
        const center=M.Vertices.centre(vertices),x=slots[i].x+(random()-.5)*cellW*.14,y=slots[i].y+(random()-.5)*cellH*.12;
        const body=M.Body.create({position:{x:center.x,y:center.y},vertices,label:d.id,friction:.025,frictionStatic:0,frictionAir:.006,restitution:this.settings.restitution,slop:.05});
        M.Body.setPosition(body,{x,y});
        M.Body.setMass(body,d.mass);M.Body.setAngle(body,angle);
        const item={id:d.id,body,width,height,center,home:{x,y,angle},prior:previous.get(d.id),spawn:d.spawn,near:false,lastKick:-1000};delete d.spawn;delete d.spawnWidth;
        this.items.push(item);M.Composite.add(this.engine.world,body);
      });
      const thick=120,options={isStatic:true,restitution:.92,friction:0,label:'boundary'};
      M.Composite.add(this.engine.world,[M.Bodies.rectangle(w/2,-thick/2,w+thick*2,thick,options),M.Bodies.rectangle(w/2,h+thick/2,w+thick*2,thick,options),M.Bodies.rectangle(-thick/2,h/2,thick,h+thick*2,options),M.Bodies.rectangle(w+thick/2,h/2,thick,h+thick*2,options)]);
      // Pack a resting layout for mixed sizes, then animate existing objects toward it.
      for(let i=0;i<80;i++)M.Engine.update(this.engine,1000/120);
      for(const item of this.items){
        const body=item.body,prior=item.prior;
        item.home={x:body.position.x,y:body.position.y,angle:body.angle};
        M.Body.setVelocity(body,{x:0,y:0});M.Body.setAngularVelocity(body,0);
        if(prior||item.spawn){
          M.Body.setPosition(body,prior?prior.position:item.spawn);
          if(prior){M.Body.setAngle(body,prior.angle);M.Body.setVelocity(body,prior.velocity);M.Body.setAngularVelocity(body,prior.angularVelocity);}
          else M.Body.setVelocity(body,{x:(random()-.5)*3,y:(random()-.5)*3});
          const shiftX=body.bounds.min.x<2?2-body.bounds.min.x:body.bounds.max.x>w-2?w-2-body.bounds.max.x:0;
          const shiftY=body.bounds.min.y<2?2-body.bounds.min.y:body.bounds.max.y>h-2?h-2-body.bounds.max.y:0;
          M.Body.translate(body,{x:shiftX,y:shiftY});
        }
        delete item.prior;delete item.spawn;
      }
      M.Engine.clear(this.engine);M.Composite.setModified(this.engine.world,true,false,false);this.arranging=false;this.contain();
    }
    resize(width,height){
      const scaleX=width/this.width,scaleY=height/this.height;
      const previous=new Map(this.items.map(item=>[item.id,{
        x:item.body.position.x*scaleX,y:item.body.position.y*scaleY,
        vx:item.body.velocity.x*scaleX,vy:item.body.velocity.y*scaleY,
        angle:item.body.angle,angularVelocity:item.body.angularVelocity,
      }]));
      this.width=width;this.height=height;this.layout(0);
      for(const item of this.items){
        const prior=previous.get(item.id);if(!prior)continue;
        this.M.Body.setPosition(item.body,{x:prior.x,y:prior.y});
        this.M.Body.setAngle(item.body,prior.angle);
        this.M.Body.setVelocity(item.body,{x:prior.vx,y:prior.vy});
        this.M.Body.setAngularVelocity(item.body,prior.angularVelocity);
      }
      this.contain();this.setPointer(-1000,-1000,false);
    }
    destroy(){
      this.M.Events.off(this.engine);
      this.M.Composite.clear(this.engine.world,false);
      this.M.Engine.clear(this.engine);
      this.items=[];
    }
    setPointer(x,y,active=true,vx=0,vy=0){this.pointer={x,y,active,vx,vy};}
    nudge(index,angle=-.6,strength=1){
      const item=this.items[index],b=item.body,M=this.M,s=this.settings.kick*strength*this.motionScale;
      M.Body.setVelocity(b,{x:b.velocity.x+Math.cos(angle)*s,y:b.velocity.y+Math.sin(angle)*s});
      M.Body.setAngularVelocity(b,b.angularVelocity+(.018+(index%2)*.006)*strength*(index%2?-1:1));
    }
    setPreset(name){
      const options={soft:{kick:4.8,omega:2.8,restitution:.70,radius:66},lively:{kick:7.4,omega:3.3,restitution:.87,radius:76},playful:{kick:10.2,omega:3.8,restitution:.94,radius:84}};
      this.settings={...options[name]};this.items.forEach(item=>{item.body.restitution=this.settings.restitution;});
    }
    step(dt=1000/120){
      const M=this.M,p=this.pointer;this.clock+=dt;
      for(const item of this.items){
        const b=item.body,dx=item.home.x-b.position.x,dy=item.home.y-b.position.y,w=this.settings.omega;
        const vx=b.velocity.x*60,vy=b.velocity.y*60;
        const ax=w*w*dx-1.02*vx,ay=w*w*dy-1.02*vy;
        M.Body.applyForce(b,b.position,{x:b.mass*ax/1e6,y:b.mass*ay/1e6});
        const angleError=Math.atan2(Math.sin(item.home.angle-b.angle),Math.cos(item.home.angle-b.angle));
        b.torque+=b.inertia*(7*angleError-1.25*b.angularVelocity*60)/1e6;
        let inRange=false;
        if(p.active){
          const hit=closest(b.vertices,p),inside=M.Vertices.contains(b.vertices,p),radius=this.settings.radius*this.pointerRadius/76;
          inRange=inside||hit.distance<radius;
          if(inRange){
            let nx=b.position.x-p.x,ny=b.position.y-p.y,n=Math.hypot(nx,ny);
            if(n<1){nx=Math.cos(item.body.id);ny=Math.sin(item.body.id);n=1;}nx/=n;ny/=n;
            const falloff=inside?1:(1-hit.distance/radius)**2;
            if(!item.near&&this.clock-item.lastKick>350){
              const velocity=Math.min(2.3,Math.hypot(p.vx,p.vy)/450),kick=this.settings.kick*(.7+velocity*.22)*this.motionScale;
              M.Body.setVelocity(b,{x:b.velocity.x+nx*kick,y:b.velocity.y+ny*kick});
              const offX=hit.point.x-b.position.x,offY=hit.point.y-b.position.y;
              M.Body.setAngularVelocity(b,b.angularVelocity+clamp((offX*ny-offY*nx)*.0011,-.08,.08));
              item.lastKick=this.clock;this.pointerEntries++;
            }
            const force=1900*falloff*this.motionScale;
            M.Body.applyForce(b,hit.point,{x:nx*b.mass*force/1e6,y:ny*b.mass*force/1e6});
          }
        }
        item.near=inRange;
        const speed=Math.hypot(b.velocity.x,b.velocity.y),limit=15*this.motionScale;if(speed>limit)M.Body.setVelocity(b,{x:b.velocity.x*limit/speed,y:b.velocity.y*limit/speed});
        if(Math.abs(b.angularVelocity)>.11)M.Body.setAngularVelocity(b,Math.sign(b.angularVelocity)*.11);
      }
      M.Engine.update(this.engine,dt);
      this.contain();
    }
    contain(){
      const M=this.M;
      for(const {body} of this.items){
        const bounds=M.Bounds.create(body.vertices);
        const x=bounds.min.x<0?-bounds.min.x:bounds.max.x>this.width?this.width-bounds.max.x:0;
        const y=bounds.min.y<0?-bounds.min.y:bounds.max.y>this.height?this.height-bounds.max.y:0;
        if(x||y){
          const velocity={...body.velocity};
          if(x&&velocity.x*x<0)velocity.x*=-this.settings.restitution;
          if(y&&velocity.y*y<0)velocity.y*=-this.settings.restitution;
          M.Body.translate(body,{x,y});M.Body.setVelocity(body,velocity);
        }
      }
    }
    snapshot(){return{width:this.width,height:this.height,contacts:this.contacts,objectContacts:this.objectContacts,pointerEntries:this.pointerEntries,items:this.items.map(item=>({id:item.id,x:item.body.position.x,y:item.body.position.y,angle:item.body.angle,speed:item.body.speed,homeError:Math.hypot(item.body.position.x-item.home.x,item.body.position.y-item.home.y),bounds:this.M.Bounds.create(item.body.vertices)}))};}
  }
export default MotionField;
