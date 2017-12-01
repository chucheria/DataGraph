#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Create JSON files for the D3 visualization"""

import json
import urllib
import itertools

# Read JSON
url = "https://data.nasa.gov/data.json"
response = urllib.urlopen(url)
data = json.loads(response.read())

def get_title_theme(entry):
    try:
        tt = (entry['title'], entry['theme'], entry['distribution'][0]['downloadURL'])
    except KeyError, e:
        if (str(e) in 'downloadURL'):
            tt = (entry['title'], entry['theme'], [])
        elif (str(e) in 'theme'):
            tt = (entry['title'], [], entry['distribution'][0]['downloadURL'])
        else:
            tt = (entry['title'], [], [])
    return tt

titles_themes = [get_title_theme(x) for x in data['dataset']]

for a, b in itertools.combinations(titles_themes, 2):
    if(a == b):
        try:
            titles_themes.remove(a)
        except ValueError:
            pass

for a in titles_themes:
    if not (a[1] and a[2]):
        try:
            titles_themes.remove(a)
        except ValueError:
            pass

links = []

for a, b in itertools.combinations(titles_themes, 2):
    if(a[1] == b[1]):
        links.append('{"source": "' + a[0] + '", "target": "' + b[0] + '"}')
