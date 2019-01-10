### SET UP ###

import re
import enum
import random
from random_words import RandomWords
rw = RandomWords()

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

GRID_Y = 50
GRID_X = 200

filename = "deathrow.txt"

words = re.compile('[^a-zA-Z\s.\']').sub('',open(filename,"r").read()).replace('\n',"")
wordHolder = [[[z for z in y.split(" ") if z!= ''] for y in x.split(".")] for x in words.split("QQ")]

letterGrid = [[" " for z in range(GRID_X)] for x in range(GRID_Y)]
letterGridNext = [[" " for z in range(GRID_X)] for x in range(GRID_Y)]

### FUNCTIONS ###

def makeGrid(text): # Put all the texts into a grid
    lineOffset = int((GRID_Y - len(text))/2)
    allLetters = 0
    for lineIndex,line in enumerate(text):
        lineSize = -1
        for word in line:
            lineSize+=len(word)+1
        wordOffset = int((GRID_X - (lineSize))/2)
        allLetters += lineSize
        for word in line:
            for letter in word:
                letterGrid[lineOffset+lineIndex][wordOffset] = letter
                wordOffset+=1
            letterGrid[lineOffset+lineIndex][wordOffset]=" "
            wordOffset+=1
    return scrambler(text,allLetters)

def scrambler(text,allLetters):
    words = []
    for line in text:
        for word in line:
            words.append(word.upper())

    while allLetters < 9990:
        next = rw.random_word()
        words.append(next)
        allLetters += len(next)

    random.shuffle(words)
    lineTemp = 0
    lineDex = 0
    letterDex = 0
    scrambled = [[" " for z in range(GRID_X)] for x in range(GRID_Y)]
    for word in words:
        if letterDex + len(word) < 200:
            for letter in word:
                scrambled[lineDex][letterDex] = letter
                letterDex += 1
            if letterDex + 1 <200:
                scrambled[lineDex][letterDex] = " "
                letterDex += 1
        else:
            letterDex = 0
            lineDex += 1
        if lineDex >= 50:
            break
    return scrambled

def checkNext(line,x,direction,type): # Recursive check for neighbor similarity
    if x>=0 and x<GRID_X:
        if (letterGrid[line][x]==" ") == (type ==" "):
            return x+1 if direction==-1 else x
    return checkNext(line,x+direction,direction,type)

def getNeighbor(index,direction): # Get cell neighbors in a single direction
    neighbors = set()
    if direction in (DIR.RIGHT,DIR.LEFT):
        flip = index.end+2 if direction == DIR.RIGHT else index.start-2
        if (flip>=0 and flip<GRID_X):
            if letterGrid[index.line][flip]!=" ":
                neighbors.add(''.join(letterGrid[index.line]\
                [checkNext(index.line,flip,-1," "):checkNext(index.line,flip,1," ")]))
    else:
        flip = -1 if direction ==  DIR.UP else 1
        letterIndex = index.start
        if (index.line+flip>=0 and index.line+flip<GRID_Y):
            for letter in letterGrid[index.line+flip][index.start:index.end]:
                neighbors.add(''.join(letterGrid[index.line+flip]\
                [checkNext(index.line+flip,letterIndex,-1," "):checkNext(index.line+flip,letterIndex,1," ")]))
                letterIndex +=1
    return neighbors

def getAllNeighbors(index):# Get all neighbors of a cell
    neighbors = set()
    for direction in DIR:
        neighbors = neighbors.union(getNeighbor(index,direction))
    if '' in neighbors:
        neighbors.remove('')
    return neighbors

def reaper(index,state): # Kill, birth or save a cell
    for digit in range(index.start,index.end):
        letterGridNext[index.line][digit] =("t",letter[index.line][digit]," ")[state] #LIVE,STAY,DIE

def evaluate(index,alive): # Evaluate a cell for reaping
    neighbors = getAllNeighbors(index)
    if alive:
        state =  STATE.DIE if len(neighbors)<2 or len(neighbors)>3 else STATE.STAY
    else:
        state = STATE.LIVE if len(neighbors)==3 else STATE.LIVE
    reaper(index,STATE.STAY)

def cycle(letterGrid): # Cycle through all cells to be evaluated
    for lineIndex,line in enumerate(letterGrid):
        start = 0
        for letterIndex, letter in enumerate(line):
            if start == 0:
                if letter == ' ' and (letterIndex+1>=GRID_X or letterGrid[lineIndex][letterIndex+1]== ' '):
                    evaluate(index(lineIndex,letterIndex,letterIndex+1),False)
                elif letter != ' ':
                    start = letterIndex
            else:
                if letter == ' ':
                    evaluate(index(lineIndex,start,letterIndex),True)
                    start = 0
    return letterGridNext

def printGrid(grid): # Print the Grid
    for line in grid:
        for letter in line:
            print(letter, end ="")
        print()

### PROCEDURE ####

scrambledGrid = makeGrid(wordHolder[1])
printGrid(letterGrid)
print("---------------------")
printGrid(scrambledGrid)
'''
while True:
    input("Enter...")
    letterGrid = cycle(letterGrid)
    printGrid()
'''
