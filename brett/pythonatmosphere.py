import re

words = open("atmosphere.txt").read()
words = re.compile('[\W]').sub('',words)

words = re.split(r'(score+|word+)', words)

wordScoreList = [] #WHERE EVERYTHING IS STORED

flag = 0
wordTemp = ""

class wordScore:
    def __init__(self,word,score):
        self.word = word
        self.score = score

for word in words:


    if flag ==2:
        wordTemp = word
    elif flag ==1:
        wordScoreList.append(wordScore(wordTemp,word))

    if word == "word":
        flag = 2
    elif word == "score":
        flag = 1
    else:
        flag = 0



mainText = open("POEMS FOR THE ANTHROPOCENE.txt").read()
mainText = mainText.split(" ")

totalScore = 0

for word in mainText:
    for match in wordScoreList:
        if word == match.word:
            totalScore += int(match.score)

print(totalScore)
