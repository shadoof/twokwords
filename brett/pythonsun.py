import re

values_a = open("reflect.rtf").read() #VALUES TO BE LOOKED IT
values_b = open("radiation.rtf").read()
values_c = open("emission.rtf").read()

class wordScore:
    def __init__(self,word,score):
        self.word = word
        self.score = score

def makeList(words):
    words = re.compile('[\W]').sub('',words)
    words = re.split(r'(score+|word+)', words)
    wordScoreList = [] #
    flag = 0
    wordTemp = ""

    for word in words:
        if flag == 2:
            wordTemp = word
        elif flag ==1:
            wordScoreList.append(wordScore(wordTemp,word))

        if word == "word":
            flag = 2
        elif word == "score":
            flag = 1
        else:
            flag = 0

    return wordScoreList

categories = [makeList(values_a),makeList(values_b),makeList(values_c)]
mainText = open("climatedecision.rtf").read() #MAIN TEXT TO BE READ THROUGH
mainText = re.compile(r'[^a-zA-Z ]+').sub('',mainText)
mainText = mainText.split(" ")


scores = [0,0,0]
triplets = [[],[],[]]

for index,word in enumerate(mainText):
    for cat,wordScoreList in enumerate(categories):
        for match in wordScoreList:
            if word == match.word:
                scores[cat] += int(match.score)
                triplets[cat].append(mainText[index-1]+" "+mainText[index]+" "+mainText[index+1]+'\n')

files = [open("resultsA.txt","w+"),open("resultsB.txt","w+"),open("resultsC.txt","w+")]

for index,triplet in enumerate(triplets):
    for line in triplet:
        files[index].write(line)
    files[index].write("score:"+str(scores[index]))

print("done")
