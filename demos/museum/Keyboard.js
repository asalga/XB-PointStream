final int KEY_LEFT = 37;
final int KEY_UP = 38;
final int KEY_RIGHT = 39;
final int KEY_DOWN = 40;

final int KEY_A = 65;
final int KEY_B = 66;
final int KEY_C = 67; 
final int KEY_D = 68;  // debugging
final int KEY_E = 69;
final int KEY_F = 70;
final int KEY_G = 71;
final int KEY_H = 72;
final int KEY_I = 73;

final int KEY_S = 83;

final int KEY_W = 87; // wireframe

public class Keyboard{

  private boolean[] keysDown;
  private boolean[] keysToggled;

  public Keyboard(){
    keysDown = new boolean[128];
    keysToggled = new boolean[128];
  }
  
  public void setKeyDown(int key){
    keysDown[key] = true;
  }
  
  public void setKeyUp(int key){
    keysToggled[key] = !keysToggled[key]
    keysDown[key] = false;
  }

  public boolean isKeyToggled(int key){
    return keysToggled[key];
  }

  public boolean isKeyDown(int key){
    return keysDown[key];
  }    
}
