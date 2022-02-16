from os import listdir as ld

from utils import dump_json, load_json, clean_str
from csvToJson import csvToJson
from cleanSlate import cleanSlate
from paths import paths

def main():

    cleanSlate(paths)
    csvToJson(paths)

    geojson_resp = { 
        "type": "FeatureCollection",
        "features": []
    }
    features = geojson_resp['features']

    rankings_resp = []

    total_per_year = 0 # 40,565,201
    percents_resp = []

    life_expectancy_resp = {}
    children_born_resp = {}
    industries_resp = {}
    ethnicities_resp = {}
    religions_resp = {}
    languages_resp = {}
    missing_languages_resp = []

    hello = load_json(paths['original']['hello'])
    hello = [d['language'] for d in hello]
    for f in ld(paths['original']['iso']):
         # This is only here because I dont want to fix spacing.
        try:

            try:
                iso = load_json(f"{paths['original']['iso']}/{f}")
                ccn3 = int(iso['ccn3'])
                name = iso['name']['common']
            except Exception as e:
                print(str(f'Error @ iso: {e}'))

            try:
                cia = load_json(f"{paths['original']['cia']}/{f}")
                data = cia['data']
                people = data['people']
                economy = data['economy']
            except Exception as e:
                print(str(f'Error @ cia: {e}'))

            try:
                abort = load_json(f"{paths['original']['abort']}/{f}")[0]
                per_year = int(abort['numberofabortions'])
            except Exception as e:
                print(str(f'Error @ guttmucher: {e}'))

            try:
                population = people['population']['total']
                total_per_year += per_year
                percents_resp.append([ccn3, per_year])
                relative = float(per_year/population)
                per_100k = relative*100000
                ranking = {
                        "flag": f'assets/img/flags/{ccn3}.svg',
                        "name": name,
                        "per_year": per_year,
                        "relative": per_100k
                }
                rankings_resp.append(ranking)
            except Exception as e:
                print(str(f'Error @ ranking: {e}'))

            try: 
                lat = iso['latlng'][0]
                lng = iso['latlng'][1]
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point", 
                        "coordinates": [lng, lat]
                    },
                    "properties": ranking
                }
                features.append(feature)
            except Exception as e:
                print(str(f'Error @ geojson features: {e}'))

            try: 
                life_expectancy_at_birth = people['life_expectancy_at_birth']
                life_expectancy_resp[ccn3] = {
                    'total': life_expectancy_at_birth['total_population']['value'],
                    'm': life_expectancy_at_birth['male']['value'],
                    'f': life_expectancy_at_birth['female']['value'],
                }
            except Exception as e:
                print(str(f'Error @ life expectancy at birth: {e}'))

            try:
                # TODO: This obviously doesn't apply for men as well ... not sure how to fix this.
                # Using birth rate, population, and count per woman? Any missing vars?
                children_born_resp[ccn3] = people['total_fertility_rate']["children_born_per_woman"]
            except Exception as e:
                print(str(f'Error @ children born per woman: {e}'))

            try:
                # TODO: The industries dont have percents attatched, definetly not assigning industries with proper proportion
                industries_resp[ccn3] = economy['industries']["industries"]
            except Exception as e:
                print(str(f'Error @ industries: {e}'))

            try:
                ethnicities_resp[ccn3] = {}
                ethnic_groups = people['ethnic_groups']['ethnicity']
                for ethnic_group in ethnic_groups:
                    try:
                        ethnicities_resp[ccn3][ethnic_group['name']] = ethnic_group['percent']
                    except Exception as e:
                        print(str(f'Error @ ethnicity percent: {e}'))
            except Exception as e:
                print(str(f'Error @ ethnicity: {e}'))

            try:
                religions_resp[ccn3] = {}
                religious_groups = people['religions']['religion']
                for religious_group in religious_groups:
                    try:
                        religions_resp[ccn3][religious_group['name']] = religious_group['percent']
                    except Exception as e:
                        print(str(f'Error @ religion percent: {e}'))
            except Exception as e:
                print(str(f'Error @ religion: {e}'))

            try:
                languages_resp[ccn3] = []
                languages = people['languages']['language']
                for language in languages:

                    renamer = {
                        "Afghan Persian or Dari": "Persian",
                        "Spanish or Spanish Creole": "Spanish",
                        "French or French Creole": "French",
                        "Serbo-Croatian": "Croatian",
                        "Castilian Spanish": "Spanish",
                        "Serbo-Croat": "Croatian",
                        "Standard Arabic": "Arabic",
                        "Moroccan Arabic": "Arabic",
                        "Hassaniya Arabic": "Arabic",
                        "Standard Chinese or Mandarin": "Chinese",
                        "Mandarin Chinese": 'Chinese',
                        "Northern Chinese": "Chinese",
                        "Kiswahili or Swahili": "Swahili",
                        "Cook Islands Maori": "Maori"
                    }
                    
                    try:
                        language_name = language['name']
                        if language_name in renamer:
                            language_name = renamer[language_name]
                            
                        language_name = language_name.replace('only', '')
                        language_name = language_name.replace(' Creole', '')
                        language_name = clean_str(language_name)

                        if language_name in hello:

                            if 'percent' in language:
                                language_percent = language['percent']

                            else: 
                                # TODO: This is a sloppy expirament .. figure something else out
                                language_percent = 0.1 

                            arr = [language_name, language_percent]
                            languages_resp[ccn3].append(arr)

                    except Exception as e:
                        print(f'Error @ language percent: {e}')
            except Exception as e:
                print(str(f'Error @ language: {e}'))

        # This is only here because I dont want to fix spacing.
        except Exception as e:
            print(str(f'Error @ main try ... this should not happen. Something is really wrong.  : {e}'))
    
    for index in range(len(percents_resp)):
        ccn3 = int(percents_resp[index][0])
        per_year_national = int(percents_resp[index][1])
        percent_of_global = float(per_year_national / int(total_per_year)) * 100
        percents_resp[index] = [ccn3, percent_of_global]


    world_resp = {
        'per': {
            'year': int(total_per_year/1),
            'week': float(total_per_year/52.17857),
            'day': float(total_per_year/365.25),
            'hour': float(total_per_year/8766),
            'minute': float(total_per_year/525960),
            'second': float(total_per_year/31557600),
        },
        'rep': {
            'second': float(1/float(total_per_year/31557600)),
            'millisecond': float(1/float(total_per_year/31557600000))
        },
        'cnt': percents_resp,
        'eth': ethnicities_resp,
        'rel': religions_resp,
    }

    pcf = paths['created']['files']
    dump_json(geojson_resp, pcf['geojson']) # widget maps
    # dump_json(rankings_resp, pcf['rankings'])
    dump_json(languages_resp, pcf['languages']) # widget profile
    # dump_json(missing_languages_resp, pcf['languagesMissing'])
    dump_json(life_expectancy_resp, pcf['expect']) # widget profile
    dump_json(children_born_resp, pcf['children']) # widget profile     
    dump_json(industries_resp, pcf['industry']) # widget profile
    dump_json(world_resp, pcf['world']) # widget profile

# https://stackoverflow.com/questions/419163/what-does-if-name-main-do
if __name__ == "__main__":
    main()
