/*BEGIN*/document.addEventListener('DOMContentLoaded', function() {

window.visited=['D9'];
window.visitedImages={}
window.mapVisibility='hidden';

var idx="D9";
var debug=false
var dbg_cell=new URL(location.href).searchParams.get("c");
console.log(dbg_cell)
if (dbg_cell != null) {
    //debug=true;
    idx=dbg_cell
}


var instructions="Welcome mouse detective! Are you ready for your first assignment? There is an elf hiding behind a mask that is causing all sorts of mayhem, stealing toys and stealing the holiday joy. Your assignment is to find which elf is hiding behind the mask. Use the left and right arrow controls to steer your vehicle. Starting in.......... Three.............................. Two.............................. One.............................."

if (dbg_cell!=null) instructions=""


var angle=225;
var px=-1  //player x, each gameloop needs position data immediately
var py=-1

function draw_button(name,x,y) {
    var img=document.createElement("img");
    img.src="images/icons/"+name+".png";
    img.style.opacity=0.8;
    img.style.zIndex="1000008";
    img.style.position='absolute';
    img.style.left=x+'px';
    img.style.top=y+'px';
    img.style.width='44px';
    img.style.height='44px';
    img.style.border='3px solid lightyellow';
    document.getElementById('game').appendChild(img)
    return img;
}


function draw_map() {
    var existing=document.getElementById('map');
    if (existing != null) existing.remove();
    var tbl=document.createElement("table");
    tbl.style.position="absolute";
    tbl.id="map";
    //tbl.style.border="3px solid black";//transparent";
    //tbl.style.borderColor="black";//"transparent";
    //tbl.style.borderSpacing="3px";
    //tbl.style.borderCollapse="separate";
    tbl.style.left="224px";
    tbl.style.top="0px";
    tbl.style.zIndex="100006";
    var cols='ABCDEFGHI';
    for (var r=1;r<=13;r++) {
        var row=document.createElement("tr");
        //row.style.borderColor="black";
        for (var c=0;c<cols.length;c++) {
            var td=document.createElement("td");
            td.style.width="48px";
            td.style.height="48px";
            td.style.backgroundColor="white";
            td.style.color="black";
            //td.style.borderColor="black";
            var cell=cols[c]+r;

            if (window.visited.includes(cell)){
                td.style.backgroundColor="#FFCCFF";
            } else {
                td.style.backgroundColor="white";//"black";//"#A9A9A9";
            }
            if (suspectsList.includes(cell)) {
                td.style.backgroundColor="#B3000C";//"darkred";
            }
            if (cell==idx){
                td.style.backgroundColor="#23778e";//"#FFCCFF";
            }
            else if (!map.hasOwnProperty(cell)) {
                td.style.backgroundColor="transparent";
            }
            if (window.visitedImages.hasOwnProperty(cell)) {
                td.style.backgroundImage="url('images/elf"+cell+".png')";
                td.style.backgroundColor="green";
            }
            td.style.opacity=0.65;//0.75;
            row.appendChild(td);
        }
        tbl.appendChild(row);
    }

    document.getElementById("game").appendChild(tbl);
    tbl.style.visibility=window.mapVisibility;
}

var suspects=0;
window.dbg_clear = function() {
    var els=document.getElementsByClassName("dbg")
    while (els.length>0) {els[0].remove()}//.outerHTML="";els.pop()}
}
window.dbg = function() {
    var els=document.getElementsByClassName("dbg")
    while (els.length>0) {els[0].remove()}//.outerHTML="";els.pop()}
    for (var i=0;i<map[idx].road.length;i++) {
        for (var j=0;j<map[idx].road[i].length;j++) {
            //for (var k=0;k<map[idx][i][j].length;k++) {
                var obj=map[idx].road[i][j];
                var div=document.createElement("span")
                div.style.position="absolute";
                div.style.backgroundColor='blue'
                div.style.width='8px'
                div.style.height='8px'
                div.style.left=obj.x+"px"
                div.style.top=obj.y+"px"
                div.className="dbg"
                div.style.zIndex="100005";
                //div.style.display=""
                document.getElementById("game").appendChild(div)
                //console.log(window.getComputedStyle(div).left+","+window.getComputedStyle(div).top)
            //}
        }
    }
    for (var i=0;i<map[idx].exits.length;i++) {
        var dots=map[idx].exits[i].dots;
        for (var j=0;j<dots.length;j++) {
            var obj=dots[j];
            var div=document.createElement("span")
            div.style.position="absolute";
            div.style.backgroundColor='red'
            div.style.width='8px'
            div.style.height='8px'
            div.style.left=obj.x+"px"
            div.style.top=obj.y+"px"
            div.className="dbg"
            div.style.zIndex="100005";
            document.getElementById("game").appendChild(div)
        }
    }
    for (var i=0;i<Object.keys(map[idx].entrances).length;i++){
        var key=Object.keys(map[idx].entrances)[i];
        var dot=create_dot(map[idx].entrances[key].x,map[idx].entrances[key].y,'gray', 100);
        dot.style.opacity=0.9;
    }
    for (var i=0;i<map[idx].safe.length;i++){
        var pt=map[idx].safe[i];
        create_dot(pt.x,pt.y,'black', 7);
    }
}

function similar_x(x1,x2) {
    return Math.abs(x1-x2)<10;
}
function similar_y(y1,y2) {
    return Math.abs(y1-y2)<10;
}
function inside_simple_polygons_fallback(pts, polys) {
    for (var i=0;i<polys.length;i++) {
        
        for (var j=0;j<pts.length;j++) {
            var pt=pts[j]
            var q1=false;var q2=false;var q3=false;var q4=false;
            for (var k=0;k<polys[i].length;k++) {
                var polypt=polys[i][k];
                if (polypt.x>pt.x && polypt.y>pt.y) q1=true;
                if (polypt.x<pt.x && polypt.y>pt.y) q2=true;
                if (polypt.x<pt.x && polypt.y<pt.y) q3=true;
                if (polypt.x>pt.x && polypt.y<pt.y) q4=true;
            }
            if (q1&&q2&&q3&&q4) {
                return true;
            }
        }
    }
    return false;
}
function inside_simple_polygons(pts, polys) {
    var xbuff=50;
    var ybuff=50;
    var pt_bools=[]
    for (var i=0; i<pts.length;i++) {
        for (var j=0;j<polys.length;j++) {
            var foundW=false; var foundN=false; var foundE=false; var foundS=false;
            for (var k=0;k<polys[j].length;k++) {
                var ppt=pts[i]; //player point
                var ept=polys[j][k];//edge point
                if (ppt.x>ept.x && similar_y(ppt.y,ept.y)) foundE=true;
                if (ppt.x<ept.x && similar_y(ppt.y,ept.y)) foundW=true;
                if (ppt.y>ept.y && similar_x(ppt.x,ept.x)) foundN=true;
                if (ppt.y<ept.y && similar_x(ppt.x,ept.x)) foundS=true;
            }
            if (foundW&&foundN&&foundE&&foundS) return true;
            //pt_bools.push(foundW&&foundN&&foundE&&foundS)
        }
    }
    return false;
    //for (var i=0;i<pt_bools.length;i++) { if (!pt_bools[i]) return false;/*inside_simple_polygons_fallback(pts, polys);*/ }
    //return true;
    // connect every point of inner rectangle (player) with
    // outer polygons (road) vertices
    // if one of the inner points can connect to all 4 quadrants
    // then it is assumed to be within the road
}

function inside_rect(pts, rect) {
    for (var i=0; i<pts.length;i++) {
        var pt=pts[i];
        if ( pt.x>rect.x1 && pt.x<rect.x2 &&
             pt.y>rect.y1 && pt.y<rect.y2) {
            if (debug)console.log("pt:"+pt.x+","+pt.y+" x1:"+rect.x1+" y1:"+rect.y1+" x2:"+rect.x2+" y2:"+rect.y2)
            console.log(transitioning)
            return true;
        }
    }
    return false
}

function quadrants_simple_polygons(pts, polys) {
    // connect every point of inner rectangle (player) with
    // outer polygons (road) vertices
    // if one of the inner points can connect to all 4 quadrants
    // then it is assumed to be within the road
    var quads={'q1':false,'q2':false,'q3':false,'q4':false}
    for (var i=0;i<polys.length;i++) {
        
        for (var j=0;j<pts.length;j++) {
            var pt=pts[j]
            var q1=false;var q2=false;var q3=false;var q4=false;
            for (var k=0;k<polys[i].length;k++) {
                var polypt=polys[i][k];
                //if(k>1){console.log(polypt); return quads;}
                //0,720  1280,0
                if (polypt.x>pt.x && polypt.y>pt.y) q1=true;
                if (polypt.x<pt.x && polypt.y>pt.y) q2=true;
                if (polypt.x<pt.x && polypt.y<pt.y) q3=true;
                if (polypt.x>pt.x && polypt.y<pt.y) q4=true;
            }
            if (q1) quads.q1=true
            if (q2) quads.q2=true
            if (q3) quads.q3=true
            if (q4) quads.q4=true
        }
    }
    return quads;
}

function sus_animation() {

    var susw=206
    var sush=340
    var y=(720-sush)
    var sus=document.createElement("div")
    //sus.innerHTML="<img src='images/balloon-36286__340.png'>"
    //sus.zIndex=100000
    sus.style.zIndex="100006";
    sus.style.width=(susw)+"px"
    sus.style.height=(sush)+"px"
    sus.style.position="absolute"
    sus.style.left=(1280-susw)+"px"
    sus.style.top=(y)+"px"
    document.getElementById("game").appendChild(sus)
    var hat=document.createElement("div")
    hat.style.position="relative"
    hat.style.left="78px";
    hat.style.top="296px";
    hat.style.width="48px"
    hat.style.height="48px"
    //hat.zIndex=200001
    hat.style.zIndex="100006";
    hat.innerHTML="<img src='images/elf"+idx+".png'>"
    sus.appendChild(hat)
    
    var balloon=document.createElement("div")
    balloon.style.zIndex="100006";//.zIndex=200000
    balloon.style.position="relative"
    balloon.style.left="0px";
    balloon.style.top="0px";
    balloon.innerHTML="<img src='images/balloon-36286__340.png'>"
    sus.appendChild(balloon)

    sus.className="sus";

    var sus2=document.createElement("div");
    sus2.className="sus";
    //sus.innerHTML="<img src='images/balloon-36286__340.png'>"
    sus2.style.zIndex="100006";//.zIndex=100000
    sus2.style.width=(susw)+"px"
    sus2.style.height=(sush)+"px"
    sus2.style.position="absolute"
    sus2.style.left=(1280-susw)+"px"
    sus2.style.top=(y)+"px"
    var balloon2=document.createElement("div")
    balloon2.style.zIndex="100006";//.zIndex=200000
    balloon2.style.position="relative"
    balloon2.style.left="0px";
    balloon2.style.top="0px";
    balloon2.innerHTML="<img src='images/balloon-36286__340.png'>"
    var hat2=document.createElement("div")
    hat2.style.position="relative"
    hat2.style.left="78px";
    hat2.style.top="296px";
    hat2.style.width="48px"
    hat2.style.height="48px"
    hat2.style.zIndex="100006";//.zIndex=200001
    hat2.innerHTML="<img src='images/mask.png'>"
    sus2.appendChild(hat2)
    sus2.appendChild(balloon2)
    //game.appendChild(sus2)
    //sus2.style.visibility="hidden"
    var removedEarly=false
    var animIntId=setInterval(function() {
        if (transitioning || y<-sush) {
            if (transitioning) {
                //sus.visibility="hidden"
                //sus2.visibility="hidden"
                sus.remove();removedEarly=true
                return;
            }
            clearInterval(animIntId)
            if (!removedEarly)            game.appendChild(sus2)
            //if (sus.visibility!="hidden"){sus2.style.visibility="visible"}
            //sus.visibility="hidden"
            sus.remove()
            y=(720-sush)
            var animIntId2=setInterval(function() {
                if (transitioning || y<-sush) {
                    clearInterval(animIntId2)
                    sus.remove()
                    sus2.remove()
                }
                y-=1
                sus2.style.top=y+"px"
            },10); 
        }
        y-=2
        sus.style.top=y+"px"
    }, 10);

}

transitioning=false
window.setp=function(x,y,player) {
    px=x
    py=y
    if (player==null) {
        player=document.getElementById("player");
    }
    player.style.left=x+"px";
    player.style.top=y+"px";
    speedEl.style.left=player.style.left;
    speedEl.style.top=player.style.top;
}
function shift_screen(from, to) {
   transitioning=true
   var suss=document.getElementsByClassName("sus")
   for (var i=0;i<suss.length;i++){suss[i].remove()}
   dbg_clear();
   document.getElementById('edit').innerHTML='Edit';
   document.getElementById('debug').innerHTML='Debug';
   while (document.getElementsByClassName('edit').length>0){document.getElementsByClassName('edit')[0].remove()}
   if (document.getElementById('editlog')!=null){document.getElementById('editlog').remove()}
   // shifting screens HAS to wait a bit using setTimeout,
   // this is because previous game loops will linger
   // and the player will unintentionally skip a cell,
   // ie: when the cell you are entering horizontally
   // has symmetric left and right entrance and exit edges (E7)
   setTimeout(function() {
       lastX=-1;
       idx=to
       setp(map[idx].entrances[from].x, map[idx].entrances[from].y)
       console.log(from+"->"+to)
       document.getElementById("cell").innerHTML=to
       var game=document.getElementById("game");
       /*var player=document.getElementById("player");
       player.style.left=map[idx].entrances[from].x+"px";
       player.style.top=map[idx].entrances[from].y+"px";*/
       game.style.backgroundImage="url('images/background/"+map[idx].img+"')"

       /**fg logic**/
       var fgs=document.getElementsByClassName("fg");
       while (fgs.length>0) { fgs[0].remove() }
       if (foregrounds.includes(map[idx].img)){
           var fgImg=document.createElement("img"); fgImg.style.zIndex="100004";
           fgImg.style.position="absolute";
           fgImg.className="fg";
           fgImg.style.top="0px";
           fgImg.style.left="0px";
           fgImg.src="images/foreground/"+map[idx].img
           game.appendChild(fgImg)
       }
       /************/

       if (debug) dbg()
       //console.log(map[idx].entrances[from].x+"px")
       var susFlag=map[idx].suspects.length>0;
       if (map[idx].suspects.length>0) {
           window.visitedImages[idx]=true;
           if (suspects==23) {
               var cell="A1"
               for (var i=0;i<suspectsList.length;i++){
                   if (map[suspectsList[i]].suspects.length>0) {
                       cell=suspectsList[i];
                   }
               }
               location.href="end.html?s="+cell
           }
           map[idx].suspects.shift()
           suspects+=1
           document.getElementById("sus").innerHTML="Suspects: "+suspects
       }
       draw_map();
       transitioning=false
       if (susFlag) { sus_animation() }
   },100);
}

function create_dot(x,y,color,size) {
    if (size==null)size=6;
    var div=document.createElement("span")
    div.style.position="absolute";
    div.style.backgroundColor=color
    div.style.width=size+'px'
    div.style.height=size+'px'
    div.style.left=x-(size/2)+"px"
    div.style.top=y-(size/2)+"px"
    div.className="dbg"
    div.style.zIndex="10000";
    document.getElementById("game").appendChild(div)
    return div;
}

function draw_rect(x1,y1,x2,y2) {
    var s='/*Created by Rect editor*/'+idx+'.road.push([';
    var xf=(x2-x1)%1+1;
    var yf=(y2-y1)%1+1;
    var x=x1*xf;
    while (x<x2) {
        create_dot(x,y2,'yellow').className='edit';
        s+="{'x':"+x+",'y':"+y2+"},";
        x+=(5*xf);
    }
    x=x1;
    while (x<x2) {
        create_dot(x,y1,'yellow').className='edit';
        s+="{'x':"+x+",'y':"+y1+"},";
        x+=(5*xf);
    }
    var y=y1*yf;
    while (y<y2) {
        create_dot(x1,y,'yellow').className='edit';
        s+="{'x':"+x1+",'y':"+y+"},";
        y+=(5*yf);
    }
    y=y1*yf;
    while (y<y2) {
        create_dot(x2,y,'yellow').className='edit';
        s+="{'x':"+x2+",'y':"+y+"},";
        y+=(5*yf);
    }
    s+=']);'
    //console.log(s);
    document.getElementById("editlog").value+=s;
}
function draw_polys(pts) {
    var s='/*Created by Poly editor*/'+idx+'.road.push([';
    pts[pts.length-1].x=pts[0].x;
    pts[pts.length-1].y=pts[0].y;
    var lastPt=null;
    while (pts.length>0) {
        var pt=pts.shift();
        create_dot(pt.x,pt.y,'orange').className='edit';
        s+="{'x':"+pt.x+",'y':"+pt.y+"},";
        if (lastPt==null){lastPt=pt;continue;}
        var x=lastPt.x;
        var y=lastPt.y;
        while (x!=pt.x || y!=pt.y) {
            var dx=8;
            var dy=8;
            if (similar_x(x,pt.x)) x=pt.x
            else if ((x+dx)<=pt.x){x+=dx}
            else if ((x-dx)>=pt.x){x-=dx}
            else x=pt.x
            if (similar_y(y,pt.y))y=pt.y
            else if ((y+dy)<=pt.y){y+=dy}
            else if ((y-dy)>=pt.y){y-=dy}
            else y=pt.y
            create_dot(x,y,'orange').className='edit';
            s+="{'x':"+x+",'y':"+y+"},";
        }
        lastPt=pt;
    }
    s+=']);'
    //console.log(s);
    document.getElementById("editlog").value+=s;
}

window.editlog = function() {
    if (document.getElementById('editlog')!=null){document.getElementById('editlog').value='';return;}
    var div=document.createElement("textarea")
    div.id="editlog";
    div.style.position="absolute";
    div.style.backgroundColor='yellow';
    div.style.width='1280px'
    div.style.height='600px'
    div.style.left=0+"px"
    div.style.top="750px"
    div.className="editlog"
    div.style.zIndex="10000";
    document.getElementById("game").appendChild(div)
}

var drawDone=false
var drawx=0; var drawy1=0;
var drawQ=[]
var editEl=null
function mousedown(e) {
    e = e || window.event;
    console.log("{'x':"+e.clientX + "," + "'y':"+e.clientY+"},")
    if (editEl==null) editEl=document.getElementById('edit');
    if (editEl.innerHTML != 'Edit' && e.clientY<=720) {
        if (drawDone) {
            if (editEl.innerHTML=='Rect')
                { draw_rect(drawx,drawy,e.clientX,e.clientY); }
        }
        drawx=e.clientX;
        drawy=e.clientY;
        drawQ.push({'x':e.clientX,'y':e.clientY});
        if (editEl.innerHTML=='Rect')
            drawDone=!drawDone;
        create_dot(e.clientX,e.clientY,'orange').className='edit';
        if (editEl.innerHTML=='Point'){
            document.getElementById('editlog').value += ("{'x':"+e.clientX+",'y':"+e.clientY+"},");
        }
        if (editEl.innerHTML=='Poly' && drawQ.length>1
                                     && similar_x(e.clientX,drawQ[0].x)
                                     && similar_y(e.clientY,drawQ[0].y)){
            draw_polys(drawQ);
            drawDone=!drawDone;
        }

    } else { drawDone=false; drawQ=[];}
}

function goto_nearest_safe(x,y) {
    var min_dist=99999
    var min_idx=-1
    for (var i=0;i<map[idx].safe.length;i++) {
        var sx=map[idx].safe[i].x;
        var sy=map[idx].safe[i].y;
        var cmp=Math.abs(sx-x)+Math.abs(sy-y);
        if (cmp<min_dist) {min_dist=cmp;min_idx=i;}
    }
    setp(map[idx].safe[min_idx].x,map[idx].safe[min_idx].y)
}

function point_at_nearest_safe(x,y) {
    var min_dist=99999
    var min_idx=-1
    for (var i=0;i<map[idx].safe.length;i++) {
        var sx=map[idx].safe[i].x;
        var sy=map[idx].safe[i].y;
        var cmp=Math.abs(sx-x)+Math.abs(sy-y);
        if (cmp<min_dist) {min_dist=cmp;min_idx=i;}
    }
    var sx=map[idx].safe[min_idx].x;
    var sy=map[idx].safe[min_idx].y;
    var angles=[0,45,90,135,180,225,270,315]
    var ang=Math.atan2(sy-y,sx-x);//*180.0/Math.PI;
    ang *= 180 / Math.PI;
    if (ang<0) ang = 360+ang;
//    console.log(ang)
    var nearest_angle=900;
    for (var i=0;i<angles.length;i++) {
        if (Math.abs(angles[i]-ang)<nearest_angle) nearest_angle=angles[i];
    }
    if (nearest_angle!=0)console.log(nearest_angle)
    var dx = (sx>=x) ? 4:0;
    dx = (sx<x) ? -4:dx;
    var dy = (sy>=y) ? 4:0;
    dy = (sy<y) ? -4:dy;
    //var dx=0; var dy=-50;
    setp(player.x+dx,player.y+dy,player);
    //var el=document.getElementById("player");
    ///angle = nearest_angle//((nearest_angle) % 360)
//    console.log(angle)
    ///player.src="images/player"+angle+".png";
}

var keydown_positions=[]
speedf=1;//speed factor
function keydown(e) {
    e = e || window.event;
    if (e.keyCode == '37') {
        // left
        var el=document.getElementById("player");
        angle = ((angle + 45) % 360)
        el.src="images/player"+angle+".png";
    }
    else if (e.keyCode == '39') {
        // right
        var el=document.getElementById("player");
        angle=((angle - 45) % 360)
        if (angle<0) angle+=360;
        el.src="images/player"+angle+".png";
    }
    else if (e.keyCode == '38') {
        speedf+=1; if (speedf>3)speedf=3;
    }
    else if (e.keyCode == '40') {
        speedf-=1;
        if (speedf<0)speedf=0;
    }
    else if (e.keyCode == '32') {
        //space
        if (window.mapVisibility=='hidden')
            window.mapVisibility='visible';
        else window.mapVisibility='hidden';
        document.getElementById('map').style.visibility=window.mapVisibility;
    }
    if (keydown_positions.length>2) {
        //if player gets stuck user can press recenter button
        //removing stuck logic will allow player to turn around
        //while stopped.
        /*var stuck=(
            keydown_positions[0].x==keydown_positions[1].x &&
            keydown_positions[0].y==keydown_positions[1].y &&
            keydown_positions[1].x==keydown_positions[2].x &&
            keydown_positions[1].y==keydown_positions[2].y
        );*/
        var outofbounds=(
            player.x<0 || player.x>1280 || player.y>720 || player.y<0
        );
        if(/*stuck || */outofbounds) {
            goto_nearest_safe(player.x, player.y)
        }
        keydown_positions=[]
    }
    keydown_positions.push({'x':player.x,'y':player.y});
}
var lastX=500;
var lastY=530;
function gameloop() {
    if (transitioning)return;
    if (speedEl.src != "images/speed"+speedf+".png"){
        speedEl.src="images/speed"+speedf+".png";
    }
    var el=document.getElementById("player");
    var dx=0; var dy=0;
    if (angle>90 && angle<270) {
        dx=-1;
    }
    else if (angle==90||angle==270) {
        dx=0;
    } else {
        dx=1;
    }
    if (angle>180 && angle<360) {
        dy=1;
    }
    else if (angle==180 || angle==360 || angle==0) {
        dy=0;
    } else {
        dy=-1;
    }
    //if (debug) {dx*=2;dy*=2}
    dx*=speedf;dy*=speedf;
    var x=px//parseInt(el.style.left.replace("px",""));
    var y=py//parseInt(el.style.top.replace("px",""));
    var road=map[idx];
    var img=document.getElementById("player");
    img.style.zIndex="1000";
    var w=parseInt(window.getComputedStyle(img).width.replace("px",""));
    var h=parseInt(window.getComputedStyle(img).height.replace("px",""));
//    console.log((y+h)>=road.y2)
    var pts=[/*
        {'x':x, 'y':y},
        {'x':x+w,'y':y},
        {'x':x,'y':y+h},
        {'x':x+w,'y':y+h},*/
        {'x':x+dx+(w/2.0),'y':y+dy+(h/2.0)}//center-point
    ]
    var valid=inside_simple_polygons(pts,map[idx].road)
    if (valid) {
        setp(x+dx,y+dy,el)
        /*el.style.top=(y+dy)+"px";
        el.style.left=(x+dx)+"px";*/
        lastX=x;
        lastY=y;
        var rect={}
        rect.x1=x+dx;
        rect.y1=y+dy;
        rect.x2=rect.x1+w;
        rect.y2=rect.y1+h;
        for (var i=0;i<map[idx].exits.length;i++) {
            if (inside_rect(map[idx].exits[i].dots, rect)) {
                shift_screen(idx, map[idx].exits[i].name)
            }
        }
    } else {
        /*var quads = quadrants_simple_polygons(pts,map[idx])
        var quad1=quads.quad1;var quad2=quads.quad2;var quad3=quads.quad3;
            var quad4=quads.quad4;*/
        if (lastX<0)return;
        dx=0;dy=0;
        point_at_nearest_safe(x+dx,y+dy);
        //var dy=(lastY-y)*4;
        //var dx=(lastX-x)*4;
        /*setp(x+dx,y+dy)*//*
        el.style.top=(y+dy)+"px"
        el.style.left=(x+dx)+"px"*/
        //q1 and q3 are false
        //console.log(quads)
        //return
        /*
        if (!quad1&&!quad2) y+=1
        else if (!quad3&&!quad4) y-=1
        else if (!quad2&&!quad3) x+=1
        else if (!quad1&&!quad4) x-=1
        else if (!quad1) { y-=1;x-=1; }
        else if (!quad2) { y-=1;x+=1; }
        else if (!quad3) { y+=1;x+=1; }
        else if (!quad4) { y+=1;x-=1; } 
        el.style.top=(y)+"px";
        el.style.left=(x)+"px";*/
    }
    /*
    if (x>=road.x1 && (x+w)<=road.x2 && (y+h)<=road.y1 && (y)>=road.y2) {
        el.style.top=(y+dy)+"px";
        el.style.left=(x+dx)+"px";    
    } else {
        while ((y)<(road.y2)) {//((y-h)<(road.y2)) {
            y+=1
        }
        while ((y+h)>road.y1) {
            y-=1
        }
        while (x<road.x1) {
            x+=1
        }
        while ((x+w)>road.x2) {
            x-=1
        }
        el.style.top=(y)+"px";
        el.style.left=(x)+"px";
    }*/
}

var intId=setInterval(function(){
    if (instructions.length==0) {
        clearInterval(intId);
        var game=document.getElementById("game");
        game.innerHTML="";
        game.style.backgroundImage="url('images/background/"+map[idx].img+"')"
        var el=document.createElement("img");
        el.id="player";
        el.src="images/player225.png";
        el.style.position="absolute";
        //setp(800,555,el)
        /*el.style.left="500px";
        el.style.top="530px";*/
        game.appendChild(el);

        /*global*/speedEl=document.createElement("img");
        speedEl.id="speed";
        speedEl.src="images/speed1.png";
        speedEl.style.position="absolute";
        speedEl.style.zIndex="1001";
        game.appendChild(speedEl);
        setp(500,530,el);

        /**/var sus=document.createElement("div");
        sus.style.position="absolute";
        sus.id="sus"
        sus.style.left="0px";
        sus.style.top="0px";
        sus.innerHTML="Suspects: 0"
        sus.style.zIndex="100006";
        game.appendChild(sus);
        /**/var cell=document.createElement("div");
        cell.style.position="absolute";
        cell.id="cell"
        cell.style.left="1200px";
        cell.style.top="0px";
        cell.innerHTML=idx;
        game.appendChild(cell);

        //if (debug) dbg();

        document.onkeydown = keydown;
        document.onclick=mousedown;

        draw_button("up",1000,600);
        draw_button("down",1000,644);
        draw_button("left",956,644);
        draw_button("right",1044,644);
        var space=draw_button("space",764,644);
        space.style.width='176px';
        space.style.height='44px';

        draw_map();

        var recenter=document.createElement("a");
        recenter.innerHTML="recenter";
        recenter.onclick= function() {goto_nearest_safe(640,360);}
        recenter.style.position="absolute";
        recenter.style.left="1100px";
        recenter.style.top="658px";
        recenter.style.zIndex="1000008";
        recenter.id="recenter";
        game.appendChild(recenter);

        setInterval(gameloop, 10);
        return;
    }
    document.getElementById("game").innerHTML=document.getElementById("game").innerHTML+instructions[0];
    instructions=instructions.substring(1);
    //setTimeout(load_game, 2400);
}, 32);


/*END**/});
