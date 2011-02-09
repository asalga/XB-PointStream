var ps, mickey;

var XHR_Timer;
var XHR_TimerDone = false;

function render() {

  if(mickey.status === 3){

    if(XHR_TimerDone === false){
      document.getElementById('XHR_Timer').innerHTML = (new Date() - XHR_Timer)/1000 + " seconds";
      XHR_TimerDone = true;
      ps.onRender = function(){};
    }

    var c = mickey.getCenter();
    ps.translate(-c[0], -c[1], -50-c[2]);    
 
    ps.render(mickey); 
  }
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.onRender = render;
  
  ps.pointSize(5);
  ps.background([.5, .5, .5, 1]);
  ps.clear();

  XHR_Timer = new Date();
  mickey = ps.load("../../clouds/mickey.asc");
}