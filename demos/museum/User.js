/*
*/

final int DEF_USER_TURN_SPEED = 2.0;
final int DEF_USER_MOVE_SPEED = 30.0;

class User{
  PVector position;
  PVector direction;

  private float moveSpeed;
  private float turnSpeed;
  private float rot;

  public User(){
    position = new PVector(0, 3, 10);
    direction = new PVector(0, 0, 1);
    
    turnSpeed = DEF_USER_TURN_SPEED;
    moveSpeed = DEF_USER_MOVE_SPEED;
    
    rot = 0.0f;
  }

  public void setPosition(PVector pos){
    position = pos;
  }

  public float getFacing(){
    return rot;
  }
  
  public PVector getPosition(){
    return position;
  }

  public void setDirection(PVector dir){
    direction = direction;
  }
  
  public PVector getDirection(){
    return direction;
  }

  public void turnLeft(float deltaTime){
    rot += turnSpeed * deltaTime;
	  direction.x = sin(rot);
	  direction.z = cos(rot);
  }
  
  public void turnRight(float deltaTime){
    rot -= turnSpeed * deltaTime;
	  direction.x = sin(rot);
	  direction.z = cos(rot);
  }

  public void goForward(deltaTime){
    position.x -= direction.x * deltaTime * moveSpeed;
    position.y -= direction.y * deltaTime;
    position.z -= direction.z * deltaTime * moveSpeed;
  }

  public void goBackward(deltaTime){
	  position.x += direction.x * deltaTime * moveSpeed;
	  position.y += direction.y * deltaTime;
	  position.z += direction.z * deltaTime * moveSpeed;
  }
  
  public void update(float deltaTime){
  }
}
