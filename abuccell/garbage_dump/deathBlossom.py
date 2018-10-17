import re
import enum

words = open("deathrow.txt","r").read()
words = re.compile('[^a-zA-Z\s.\']').sub('',words).replace('\n',"")

class aWord:
    def __init__(self,word,start,end):
        self.word = word
        self.start = start
        self.end = end

class DIR(enum.Enum):
    UP = 0
    LEFT = 1
    RIGHT = 2
    DOWN = 3

class triple:
    def __init__(self,x,y,z):
        self.x = x
        self.y = y
        self.z = z

blank = aWord("",0,0)
wordHolder = [[[z for z in y.split(" ") if z!= ''] for y in x.split(".")] for x in words.split("QQ")]
wordGrid = [[[blank for z in range(150)] for y in range(50)] for x in range(len(wordHolder))]
tempGrid = [[[blank for z in range(150)] for y in range(50)] for x in range(len(wordHolder))]

letterGrid = [["" for z in range(200)] for x in range(20)]

for textIndex,text in enumerate(wordHolder):
    lineOffset = int((50 - len(text))/2)
    for lineIndex,line in enumerate(text):
        lineSize = -1
        for word in line:
            lineSize+=len(word)+1
        wordOffset = int((150 - (lineSize))/2)
        wordStart = int(-lineSize/2)
        for wordIndex,word in enumerate(line):
            newWord = aWord(word,wordStart,wordStart+len(word))
            wordStart+= len(word)+1
            wordGrid[textIndex][lineIndex+lineOffset][wordIndex+wordOffset] = newWord

text = wordHolder[1]
lineOffset = int((20 - len(text))/2)
for lineIndex,line in enumerate(text):
    lineSize = -1
    for word in line:
        lineSize+=len(word)+1
    wordOffset = int((200 - (lineSize))/2)
    for word in line:
        for letter in word:
            letterGrid[lineOffset+lineIndex][wordOffset] = letter
            wordOffset+=1
        letterGrid[lineOffset+lineIndex][wordOffset]=" "
        wordOffset+=1
    print(line)
    print(letterGrid[lineOffset+lineIndex])


def printText(n):
    flag = False
    for i in wordGrid[n]:
        for j in i:
            print(j.word, end = " ")
        print()
        flag = False
        for j in i:
            if(j.start!=0):
                buff = ""
                for z in range(j.start,j.end):
                    buff +=" "
                print(j.start, end =buff)

        print()

def haveNeighbor(index,direction):
    text = index.x
    line = index.y
    word = index.z

    if direction == DIR.RIGHT or DIR.LEFT:
        flip = 1 if direction == DIR.RIGHT else -1
        if ((word!= 75+(75*flip)) and (wordGrid[text][line][word+flip]!= blank)):
            return wordGrid[text][line][word+flip]
        else:
            return None

    if direction == DIR.DOWN or direction == DIR.UP:
        flip = 1 if direction == DIR.UP else -1
        rSet = set(range(wordGrid[text][line][word].start,wordGrid[text][line][word].end))
        neighbors = []
        end = False
        for testWord in wordGrid[text][line+flip]:
            tSet = range(testWord.start,testWord.end)
            if (rSet.intersection(tSet)!= set()):
                return neighbors
            if (rSet.intersection(tSet)!= set()):
                neighbors.append(testWord)
                end = True
        return None

def neighborList(index):
    neighbors = []
    for direction in DIR:
        neighbors.append(haveNeighbor(index,direction))

def easyPicking(i,j,k,p):
    lineTick = 0
    lineFlag= False

    for lineIndex,line in enumerate(wordGrid[i]):
        wordTick = 0
        lineFlag = False
        for wordIndex,word in enumerate(line):
            if word.word!="":
                if lineFlag == False:
                    lineTick+=1
                    lineFlag = True
                wordTick+=1
                if (lineTick == j) and (wordTick == k):
                    if p:
                        return word
                    else:
                        return triple(i,lineIndex,wordIndex)
    return None



'''
input("Start Blossom")

while 1:
    for lineIndex,line in enumerate(wordGrid[1]):
        for wordIndex,word in enumerate(wordGrid[line]):
            neighbors = 0
            for direction in {DIR.UP,DIR.LEFT,DIR.RIGHT,DIR.DOWN}:
                if (haveNeightbor(triple(1,lineIndex,wordIndex),direction)!=None):
                    neighbors +=1
            if word!=blank:
                if neighbors<2:
                    tempGrid[1][lineIndex][wordIndex] = blank
                elif neighbors>3
            if neighbors<2:
                tempGrid[1][lineIndex][wordIndex] = blank

}
'''
