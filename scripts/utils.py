from csv import DictReader
from glob import glob 
from json import dump, load
from os import remove, replace
from random import uniform
from re import sub, compile
from shutil import copyfileobj
from time import sleep
from uuid import uuid4 as uu


def clean_str(s):
    c = compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    s = sub(c, '', s)
    s = sub(r'…', '...', s)
    s = sub(r'[`‘’‛⸂⸃⸌⸍⸜⸝]', "'", s)
    s = sub(r'[„“]|(\'\')|(,,)', '"', s)
    s = sub(r'\s+', ' ', s).strip()
    return s

def clean_dct(dct):
    for k, v in dct.copy().items():
        if isinstance(v, dict):
            dct[k] = clean_dct(v)
        elif isinstance(v, list):
            dct[k] = [clean_dct(i) for i in v]
        else:
            clean = clean_str(v)
            dct[k] = clean
    return dct

def gen_str(length=16):
    s = ''
    for i in range(max(1, int(length/32))):
        s += str(uu()).replace('-', '') 
    lst = [s[i:i+1] for i in range(0, len(s), 1)] 
    return ''.join(lst[:length])


def dump_json(content, dest):
    pth = f'./{uu()}{uu()}.json'
    with open(pth, "w") as f:
        dump(content, f, indent=4)
    try:
        with open(pth) as f:
            q = load(f)
        replace(pth, dest)
    except:
        remove(pth)


def load_json(pth):
    with open(pth, 'r') as json_file:
        data = load(json_file)
    return data

def load_csv_rows(pth):
    rows = []
    with open(pth, encoding='utf-8') as csvf:
        csvReader = DictReader(csvf)
        for row in csvReader:
            rows.append(row)
    return rows

def zzz(mn=2, mx=3):
    return sleep(round(uniform(mn, mx), 4))


def csv_to_json(csvFilePath, jsonFilePath, key):
    data = {}
    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = DictReader(csvf)
        for row in csvReader:
            data[row[key]] = row
    dump_json(data, jsonFilePath)


# example: merge_dir('csv', './iso')
def merge_dir(end, mergedir):
    dir_name = mergedir.split('/')[-1]
    writef = f'{dir_name}.{end}'
    with open(writef, 'wb') as writef:
        for f in glob(f'{mergedir}/*.{end}'):
            if f == writef:
                continue
            with open(f, 'rb') as readf:
                copyfileobj(readf, writef)

