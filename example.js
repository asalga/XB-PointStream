var minBB = [-100, -100, -100];
var maxBB = [ 100, 100, 100];
const dd = 5;

var r = 0;
var ps;
var fixedFunctionProg;
var pointCloud0;
var test123 = 0;

var pointClouds = [];

var LOD = 0;

function baseLight(light){
  var lightName = "lights" + light.id;
  ps.uniformi( lightName + ".isOn", true);

  ps.uniformf( lightName + ".position", light.position);
  
  if(light.ambient){ps.uniformf( lightName + ".ambient", light.ambient);}
  if(light.diffuse){ps.uniformf( lightName + ".diffuse", light.diffuse);}
  if(light.specular){ps.uniformf( lightName + ".specular", light.specular);}
}

function dirLight(light){
  baseLight(light);
  ps.uniformi( "lights" + light.id + ".type", 1);
}


function start(){
  ps = new PointStream();
  ps.setup(document.getElementById("canvas"));
  
//  var pointCloud1 = ps.load("clouds/acorn_920K.asc");
  
    pointClouds[0] = ps.load("clouds/mask_low_0.asc");
    pointClouds[1] = ps.load("clouds/mask_low_1.asc");
    pointClouds[2] = ps.load("clouds/mask_low_2.asc");
    pointClouds[3] = ps.load("clouds/mask_low_3.asc");
    pointClouds[4] = ps.load("clouds/mask_low_4.asc");
    pointClouds[5] = ps.load("clouds/mask_low_5.asc");
   
   
   var vert = ps.getShaderStr("shaders/fixed_function.vs");
  var frag = ps.getShaderStr("shaders/fixed_function.fs");
  fixedFunctionProg = ps.createProgram(vert, frag);

  ps.useProgram(fixedFunctionProg);  

//  var pointCloud1 = ps.load("clouds/xaa.asc");
 // var pointCloud2 = ps.load("clouds/xab.asc");
 // var pointCloud3 = ps.load("clouds/xac.asc");
 // var pointCloud4 = ps.load("clouds/xad.asc");
  
  
  ps.onKeyDown = function(){
  //alert(ps.key);
  
    if(ps.key == 119){
      minBB[1] += dd;
      maxBB[1] += dd;
    }


    if(ps.key == 115){
      minBB[1] -= dd;
      maxBB[1] -= dd;
    }
    
    
    if(ps.key == 97){
      minBB[0] -= dd;
      maxBB[0] -= dd;
    }


    if(ps.key == 100){
      minBB[0] += dd;
      maxBB[0] += dd;
    }


if(ps.key >= 49 && ps.key < 57){
LOD = ps.key-49;
}
    
  }
  
  ps.pointSize(6);
  ps.onRender = function(){
  
  
  r = Math.sin(ps.frameCount/100);
  
  
   dirLight({id:0, ambient:[0.364, 0.264, 0.864], diffuse:[r,.3,.7], position:[0,-r/3,r]});
 //  dirLight({id:2, ambient:[0.004, 0.04, 0.004], diffuse:[.76,.006,.006], position:[0,0,1]});
   // dirLight({id:1, ambient:[0.004, 0.004, 0.004], diffuse:[.006,.006,.96], position:[0,1,1]});
    // if(pointCloud1.status === 3){
    ps.translate(0, 0, -200);
  //  ps.rotateY(ps.frameCount/100);
   // ps.rotateX(ps.frameCount/100);
    ps.clear();
    
    test123 = 0;
    
    
    for(var i = 0; i <= LOD; i++){
    
      for(var j = 0; j < 3; j++){
        ps.render(pointClouds[i]);
      }
    }
    
    
    /*
    ps.render(pointCloud0);
    ps.render(pointCloud1);
    ps.render(pointCloud2);
    ps.render(pointCloud3);
    ps.render(pointCloud4);
    ps.render(pointCloud5);
*/
/*
    ps.render(pointCloud0);
    ps.render(pointCloud1);
    ps.render(pointCloud2);
    ps.render(pointCloud3);
    ps.render(pointCloud4);
    ps.render(pointCloud5);*/
/*

    ps.translate(-15, 25, 0);
    ps.render(pointCloud0);
    ps.render(pointCloud1);
    ps.render(pointCloud2);
    ps.render(pointCloud3);
    ps.render(pointCloud4);
    ps.render(pointCloud5);


    ps.translate(35, 25, 0);
    ps.render(pointCloud0);
    ps.render(pointCloud1);
    ps.render(pointCloud2);
    ps.render(pointCloud3);
    ps.render(pointCloud4);
    ps.render(pointCloud5);



    ps.translate(-35, -45, 0);
    ps.render(pointCloud0);
    ps.render(pointCloud1);
    ps.render(pointCloud2);
    ps.render(pointCloud3);
    ps.render(pointCloud4);
    ps.render(pointCloud5);*/
    
    counterTest = 0;
    myCounter = 10000000;//ps.mouseX/350 * 512;
   // console.log(myCounter);
    
    var d = new Date();
    var s = d.getSeconds();
    
  /* if(ps.frameCount % 10 === 0){
    counter1 = 0;
    counter2++; 
    }
    
    if(counter2 >= 512){
    counter1 = 0;
    counter2 = 1;
    }*/
    
   // }
//    document.getElementById('debug').innerHTML = leafcounter;    
    document.getElementById('debug').innerHTML = Math.floor(ps.frameRate) + "<br />" + " -> " + test123;
    
    childCounter = 0;
    //document.getElementById('debug').innerHTML = Math.floor(ps.frameRate);  
    //    leafcounter = 0;
  };
}