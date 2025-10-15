import pandas as pd
import os 

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
    



