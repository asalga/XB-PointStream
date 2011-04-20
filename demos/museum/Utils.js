
public int getRandomInt(int num1, int num2){
  return floor(getRandomNumber(num1, num2));
}

public float getRandomFloat(float num1, float num2){
  if(num1 < num2){
    return random(num1, num2);
  }
  return random(num2, num1);
}