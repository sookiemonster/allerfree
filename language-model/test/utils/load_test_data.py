import pandas as pd
import os
import pickle
from typing import Optional, Tuple


def load_test_data(file_path: os.PathLike) -> Tuple[dict, dict]:

    raw_df = pd.read_csv(
        file_path,
        usecols=[
            "Label",
            "Menu URL",
            "Items",
            "contains_gluten",
            "contains_shellfish",
            "contains_peanuts",
            "image_link",
        ],
    )
    # return raw_df
    data = {link: {} for link in set(raw_df["image_link"])}

    for idx, row in raw_df.iterrows():
        link = row["image_link"]
        data[link][row["Items"].lower().strip()] = {
            "contains_gluten": row["contains_gluten"],
            "contains_shellfish": row["contains_shellfish"],
            "contains_peanuts": row["contains_peanuts"],
        }

    label_dict = raw_df[["Label", "image_link"]].drop_duplicates()
    label_dict = label_dict.groupby("image_link").to_dict("index")

    return data, label_dict


def save_obj(
    obj: object, filename: str, resource_path: str = "./test/resources"
) -> None:
    filepath = os.path.join(resource_path, filename)
    with open(filepath, "wb") as file:
        pickle.dump(obj, file, protocol=pickle.HIGHEST_PROTOCOL)


def load_obj(
    filename: str, resource_path: str = "./test/resources"
) -> Optional[object]:
    filepath = os.path.join(resource_path, filename)

    data = None
    with open(filepath, "rb") as file:
        data = pickle.load(file)

    return data
