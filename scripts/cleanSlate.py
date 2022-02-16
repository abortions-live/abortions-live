from os import mkdir
from shutil import rmtree

def cleanSlate(paths):
    # Let's restart with a clean slate
    for f in paths['created']['files']:
        try:
            rmtree(paths['created']['files'][f])
        except Exception as e:
            print(str(f'{f} does not exist yet.'))

    for d in paths['created']['dirs']:
        try:
            rmtree(paths['created']['dirs'][d])
        except Exception as e:
            print(str(f'{d} does not exist yet.'))
        mkdir(paths['created']['dirs'][d])