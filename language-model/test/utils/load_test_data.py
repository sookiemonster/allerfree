import pandas as pd
import os 
import pickle
from typing import Optional

def load_test_data(file_path:os.path) -> pd.DataFrame:
    raw_df = pd.read_csv(file_path, usecols=['Menu URL', 'Items', 'contains_gluten', 'contains_shellfish', 'contains_peanuts', 'image_link'])
    # return raw_df
    data = { 
        link: {}
        for link in set(raw_df["image_link"])
    }

    for idx,row in raw_df.iterrows():
        link = row['image_link']
        data[link][row['Items'].lower().strip()] = {
                "contains_gluten" : row['contains_gluten'], 
                "contains_shellfish" : row['contains_shellfish'], 
                "contains_peanuts" : row['contains_peanuts'], 
            }
        # data[row['image_link']].append(row.drop('image_link'))

    return data
    
def save_obj(obj:object, filename:str) -> None:
    with open(filename, "wb") as file:
        pickle.dump(obj, file, protocol=pickle.HIGHEST_PROTOCOL)

def load_obj(filename:str) -> Optional[object]:
    with open(filename, "rb") as file:
        return pickle.load(file)

    return None