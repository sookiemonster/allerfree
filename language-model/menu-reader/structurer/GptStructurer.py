from custom_types import MenuSection, ImageData
from typing import List
from logging import getLogger
from structurer import MenuStructurer
from openai import OpenAI
import base64


logger = getLogger(__name__)

class GptStructurer(MenuStructurer):
    SELECTED_MODEL = "gpt-5"
    
    openai_client:OpenAI

    def __init__(self, openai_client: OpenAI) -> None:
        self.openai_client = openai_client
    
    def structure(self, unstructured_ocr_text: str, img: ImageData) -> str:
        prompt = self._get_prompt(unstructured_ocr_text)

        logger.info("Attempting to structure OCR with prompt: \n", prompt)
        # response = self.openai_client.responses.create(
        #     model=GptStructurer.SELECTED_MODEL,
        #     input=[
        #         {
        #             "role": "user",
        #             "content": [
        #               {"type": "input_text", "text": prompt},
        #               {"type": "input_image", "image_url": f"data:{img.mime_type};base64,{img.base64}"},
        #             ],
        #         }
        #     ],
        # )

        base64_string = base64.b64encode(img.base64).decode('utf-8')
        image_url = f"data:{img.mime_type};base64,{base64_string}"

        print(image_url)

        response = self.openai_client.chat.completions.create(
        model=GptStructurer.SELECTED_MODEL,  # Make sure this is a vision model like "gpt-4o" or "gpt-4-turbo"
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    },
                ],
            }
        ],
    )

        print(response)
        return response.choices[0].message.content
