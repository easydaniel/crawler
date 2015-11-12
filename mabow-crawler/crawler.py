import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time

schema = {
    "board": "",
    "author": "",
    "title": "",
    "date": "",
    "content": "",
    "reply": [{
        "author": "",
        "content": "",
        "date": ""
    }]
}

print("Start parsing...")

board = input("Enter an exist board (BabyMother):") or 'BabyMother'
suffix = '/bbs/' + board
base = 'https://www.ptt.cc'
nextpage = suffix + '/index.html'
count = 1

while True:
    try:
        schema = {}
        time.sleep(2)
        print("Now parsing..." + base + nextpage)
        req = requests.get(base + nextpage)
        soup = BeautifulSoup(req.text, 'html.parser')
        nextpage = soup.find('div', 'btn-group pull-right').find_all('a')[1]['href']
        pagelist = soup.find('div','r-list-container bbs-screen').find_all('a')
        with open('./data/page' + str(count), 'w') as f:
            f.write('Current url: ' + base + nextpage + '\n')
            f.write('Parse time: ' + str(datetime.now()) + '\n')
            for link in pagelist:
                # print("Now parsing..." + link['href'])
                req = requests.get(base + link['href'])
                soup = BeautifulSoup(req.text, 'html.parser')
                try:
                    schema['board'] = board
                    schema['author'] = soup.find_all('div','article-metaline')[0].find('span','article-meta-value').text.strip()
                    schema['title'] = soup.find_all('div','article-metaline')[1].find('span','article-meta-value').text.strip()
                    schema['date'] = soup.find_all('div','article-metaline')[2].find('span','article-meta-value').text.strip()
                    content = ''
                    for line in soup.find('div','bbs-screen bbs-content').text.split('\n')[1:]:
                        if line == '--':
                            break
                        content += line + '\n'
                    schema['content'] = content
                    reply = []
                    repSchema = {
                        "author": "",
                        "content": "",
                        "date": ""
                    }
                    for push in soup.find_all('div','push'):
                        repSchema = {}
                        repSchema['author'] = push.find('span','push-userid').text.strip()
                        repSchema['content'] = push.find('span','push-content').text.strip()
                        repSchema['date'] = push.find('span','push-ipdatetime').text.strip()
                        reply.append(repSchema)
                    schema['reply'] = reply
                    # print(schema)
                    f.write(str(schema) + '\n')
                except:
                    continue
        count += 1
    except Exception as e:
        print(e)
        continue
