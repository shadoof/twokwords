ArrayList<ArrayList <String>> poem= new ArrayList<ArrayList<String>>(); // input text
String [] words = new String[0]; // empty 0 len array for words
int currentStanza;
float down = 40;
BufferedReader reader;



void setup(){
  
  
  
  size(400,700);
  background(200);
 reader = createReader("2k_words_text_MM.txt");
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
 fill(random(175));
}

void nextStanza(){
 currentStanza++; 
}

String randomLine(){
  int randomNum = (int)random(0,poem.get(currentStanza).size());
  return poem.get(currentStanza).get(randomNum);
}


void keyPressed(){
   if(key == 'w'){
     currentStanza = 1;
    text(randomLine(),20,down);
    down += 12;
   }
    
    if(key == 'a'){
      currentStanza = 2;
    text(randomLine(),20,down);
    down += 12;
   }
   if(key == 's'){
      currentStanza = 3;
    text(randomLine(),20,down);

    down += 12;
   }
   if(key == 'd'){
      currentStanza = 4;
    text(randomLine(),20,down);
 
    down += 12;
    
   }
   
}
