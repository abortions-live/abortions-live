from operator import itemgetter
from json import loads
from utils import dump_json
import pandas as pd

def csvToJson(paths):
    # Read the original file as a pandas data frame 
    df = pd.read_csv(paths['original']['abortPathCsv'])
    # remove rows missing data in 'number of abortions' column
    df = df.dropna(subset=['numberofabortions'])
    # group into multiple dataframes - seperated by iso 
    for (iso), group in df.groupby(['iso']):
        # remove columns that will not be used throughout project - to save space.
        drop = list(['country', 'iso', 'region', 'subregion', 'abortionrate', 'perc_p_ending_in_a' ])
        group = group.drop(drop, axis=1)
        # Replace human answers with more computer friendly answers
        replace = {
            'Yes': True,
            'No': False,
            'Incomplete': False,
            'Complete': True
        }
        group = group.replace(to_replace=replace)

        json = str(group.to_json(orient="records"))
        lst = list(loads(json))
        # Data structure is now a list (lst) of dictionaries (dct)
        # Exceptions contains approved exceptions from notes column
        exceptions = [
            # These notes are in reference to data not used in project.
            'Rate is per 1,000 women ages 12-49', 
            'Rate is per 1,000 women ages 20-49', 
            # This is the best we have for the D.R.C.
            'Only for capital city, Kinshasa', 
            # This is the best we have for Bosnia
            'Data are only for the Republic Srpska and the Canton Sarajevo', 
            # This is ok, they are considered seperate regions by the ISO
            'Excludes Kosovo and Metohija',
            # This is ok, we can process them are one unit.
            'Sum of official statistics of England and Wales and Scotland', 
        ]
        # Let's get a clean list of dicts without all those notes and exceptions
        clean_list = []
        for dct in lst:

            if not dct['notes']:
                # Notes column is where exceptions are documented
                # No notes means no documented exceptions
                clean_list.append(dct)
            elif dct['notes'] in exceptions:
                # (Else) If notes contains text from preconfigured approved exception,
                # the row is added to cleaned list
                clean_list.append(dct)

        # Now lets sort the list in reverse chronological order for easy reading and processing.
        sorted_list = list(sorted(clean_list, key=itemgetter('yearstart'), reverse=True))
        # Finally, let's dump the data to a json file to be quickly processed by scripts and read by browser
        dump_json(sorted_list, f"{paths['created']['dirs']['abort']}/{iso}.json")

