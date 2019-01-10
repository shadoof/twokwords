ArrayList<ArrayList <String>> poem= new ArrayList<ArrayList<String>>(); // input text
String [] words = new String[0]; // empty 0 len array for words
int currentStanza;
int maxSize = 34;
Snippet[] lines = new Snippet[maxSize];
float down = 40;
BufferedReader reader;
float delay;
float x;
PFont font;
float z;


import ddf.minim.*; 
Minim minim; 
Minim chopin;
AudioPlayer player;

AudioPlayer player2;

void setup(){
  
  minim = new Minim(this);
  player = minim.loadFile("thunder.mp3");
  
  chopin = new Minim(this);
  player2 = minim.loadFile("chopin.mp3");
  
  player2.loop();


  

 fullScreen(); 
//size(800,715);

font = createFont("Geneva", 24);
textFont (font);
fill(0);

 reader = createReader("combined_texts2.txt");
 String my_line = "start";
 int i=0;
 poem.add(new ArrayList());
 while(my_line!=null){
   try{ //If the line isnt the end of file
    my_line = reader.readLine();
    if(my_line!=null){
      if(my_line.contains("~")){
        poem.add(new ArrayList());
        i++;
      }else{
        poem.get(i).add(my_line);  
       }
   }
   }catch(IOException e) { //If it is the end of file
     my_line = null;
   }
 }
}

void draw(){
  background(200,0,15);
  for(int i=0;i<maxSize;i++){
    Snippet snippy = lines[i];
    if(snippy != null){
      textSize(((mouseX)/5)+24);
      text(snippy.text,snippy.x,(i*25)+50);
     
       z = (mouseX);
    
      if (z <= 1000){
        
         player.loop();
      }
   if (z >= 1000){
        fill(random(255));
  }
      
     
    }
  }
}

void nextStanza(){
 currentStanza++; 
}

String randomLine(){
  int randomNum = (int)random(0,poem.get(currentStanza).size());
  return poem.get(currentStanza).get(randomNum);
}


void keyPressed(){

 
 float x = (random(0,300));
  
  if (int(random(1,150)) <= 10){
   if(key == 'w'){
     currentStanza = 1;
   }  
   if(key == 'a'){
      currentStanza = 2;
   }
   if(key == 's'){
      currentStanza = 3;
   }
   if(key == 'd'){
      currentStanza = 4;   
   }
   if(key == 'f'){
      currentStanza = 5;     
   }
    if(key == 'g'){
      currentStanza = 6;
  }
  if (key == CODED) {
    if (keyCode == UP) {
      currentStanza = 7;
    }
  }
  if (key == CODED) {
    if (keyCode == DOWN) {
      currentStanza = 8;
    }
      
  }
  if (key == CODED) {
    if (keyCode == LEFT) {
      currentStanza = 9;
    }
  }
  if (key == CODED) {
    if (keyCode == RIGHT) {
      currentStanza = 10;
    }
       
  }
  
  addLine(randomLine(),x,0);
 } 
 {
   if (int(random(1,150)) >= 149){
     addLine (randomLine(), 800, random(180));
     
   }
 }
}

void addLine(String a, float b,float c){
 Snippet snippy = new Snippet();
 snippy.text = a;
 snippy.x = b;
 snippy.shade = c;
 
 for(int i =0; i<maxSize; i++){
  if(lines[i] == null){
    lines[i] = snippy;
    return;
  }
 }
 
 for(int i=0; i<maxSize; i++){
   if(i == maxSize-1){
     lines[i] = snippy;
   } else {
     lines[i] = lines[i+1];  
   } 
 }
 
 
}

 
public class Snippet{
  public String text;
  public float x;
  public float shade;
}

void stop()
{ // always close Minim audio classes 
player.close();
// always stop Minim before exiting 
minim.stop();
//  e super.stop() makes sure that all the normal cleanup routines are done } 

super.stop();

}
