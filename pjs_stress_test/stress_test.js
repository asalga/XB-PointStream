void setup() {
  size(500, 500, OPENGL);
  strokeWeight(10);
  translate(width/2, height/2, 0);
  background(200);
}

void runIt(int numPoints){
  int timeToRun = runTest(numPoints);  
  addEntry(numPoints, timeToRun);
}

void addEntry(int numPoints, timeToRun){
  var TR = document.createElement('tr');
  var TD_1 = document.createElement('td');
  var TD_2 = document.createElement('td');  
  
  TD_1.innerHTML = numPoints ;
  TD_2.innerHTML = timeToRun;
  
  TR.appendChild(TD_1);
  TR.appendChild(TD_2);
  
  var TABLE = document.getElementById('entries');
  TABLE.appendChild(TR);
}

int runTest(numPoints){
  background(200);
  
  ArrayList arr = new ArrayList();

  for(int i = 0; i < numPoints; i++)
  {
    PVector p = new PVector();
    p.set(random(-1,1), random(-1,1), random(-1,1));
    p.normalize();
    p.mult(200);
    arr.push(p.array()[0]);
    arr.push(p.array()[1]);
    arr.push(p.array()[2]);
  }
  
  int timer = millis();
  for(int i=0; i < numPoints*3; i+=3){
    point(arr[i], arr[i+1], arr[i+2]);
  }
  return millis()-timer;
}
