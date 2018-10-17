
### SET UP ###

import re
import enum

class DIR(enum.Enum):
    UP = 0
    LEFT = 1
    RIGHT = 2
    DOWN = 3

class STATE(enum.Enum):
    LIVE = 0
    DIE = 1
    STAY = 2

class index:
    def __init__(self,line,start,end):
        self.line = line
        self.start = start
        self.end = end

words = re.compile('[^a-zA-Z\s.\']').sub('',open("deathrow.txt","r").read()).replace('\n',"")

wordHolder = [[[z for z in y.split(" ") if z!= ''] for y in x.split(".")] for x in words.split("QQ")]
letterGrid = [[" " for z in range(200)] for x in range(20)]
letterGridNext = [[" " for z in range(200)] for x in range(20)]

### FUNCTIONS ##

def makeGrid(i):
    text = wordHolder[i]
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

def checkNext(line,x,direction,type):
    if x>=0 or x<200:
        if (letterGrid[line][x]==" " and type==" ") or (letterGrid[line][x]!=" " and type!= " "):
            return x+1 if direction==-1 else x
    return checkNext(line,x+direction,direction,type)

def haveNeighbor(index,direction):
    neighbors = set()
    if direction == DIR.RIGHT or direction == DIR.LEFT:
        flip = index.end+2 if direction == DIR.RIGHT else index.start-2
        if (flip>=0 and flip<200):
            if letterGrid[index.line][flip]!=" ":
                neighbors.add(''.join(letterGrid[index.line][checkNext(index.line,flip,-1," "):checkNext(index.line,flip,1," ")]))
    else:
        flip = -1 if direction ==  DIR.UP else 1
        letterIndex = index.start
        if (index.line+flip>=0 and index.line+flip<20):
            for letter in letterGrid[index.line+flip][index.start:index.end]:
                neighbors.add(''.join(letterGrid[index.line+flip][checkNext(index.line+flip,letterIndex,-1," "):checkNext(index.line+flip,letterIndex,1," ")]))
                letterIndex +=1
    return neighbors

def getNeighbors(index):
    neighbors = set()
    for direction in DIR:
        neighbors = neighbors.union(haveNeighbor(index,direction))
    if '' in neighbors:
        neighbors.remove('')
    return neighbors

def reaper(line,start,end,state):
    if state == STATE.STAY:
        for index in range(start,end):
            letterGridNext[line][index] = letterGrid[line][index]

    if state == STATE.DIE:
        for index in range(start,end):
            letterGridNext[line][index] = " "

    if state == STATE.LIVE:
        for index in range(start,end):
            letterGridNext[line][index] = "t"

def evaluate(line,start,end,alive):
    neighbors = getNeighbors(index(line,start,end))
    word = ''.join(letterGrid[line][start:end])

    if alive:
        '''tally = 0
        for neighbor in neighbors:
            if len(neighbor)>len(word):
                tally+=1
        if tally>int(len(neighbors)/2):
            reaper(line,start,end,STATE.DIE)
        else:
            reaper(line,start,end,STATE.STAY)'''
        if len(neighbors)<2 or len(neighbors)>3:
            reaper(line,start,end,STATE.DIE)
        else:
            reaper(line,start,end,STATE.STAY)

    else:
        '''if (len(neighbors)>=2):
            size = 0
            equal = True
            for neighbor in neighbors:
                if size == 0:
                    size = len(neighbor)
                else:
                    equal = equal and size == len(neighbor)
            if equal:
                reaper(line,start,end,STATE.LIVE)
            else:
                reaper(line,start,end,STATE.DIE)
        else:
            reaper(line,start,end,STATE.STAY)'''
        if len(neighbors)==3:
            reaper(line,start,end,STATE.LIVE)
        else:
            reaper(line,start,end,STATE.STAY)


def cycle(letterGrid):
    for lineIndex,line in enumerate(letterGrid):
        flag = False
        start = 0
        for letterIndex, letter in enumerate(line):
            if flag == False:
                if letter == ' ' and (letterIndex+1>=200 or letterGrid[lineIndex][letterIndex+1]== ' '):
                    evaluate(lineIndex,letterIndex,letterIndex+1,False)
                elif letter != ' ':
                    start = letterIndex
                    flag = True
                else:
                    reaper(lineIndex,lineIndex,lineIndex+1,STATE.STAY)
            else:
                if letter == ' ':
                    evaluate(lineIndex,start,letterIndex,True)
                    flag = False
    return letterGridNext

def printGrid():
    for line in letterGrid:
        for letter in line:
            print(letter, end ="")
        print()

### PROCEDURE ####

makeGrid(1)
printGrid()
while True:
    input("Enter...")
    letterGrid = cycle(letterGrid)
    printGrid()
