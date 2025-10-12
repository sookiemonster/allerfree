import logging
from google.cloud import vision
from typing import Optional
from common.custom_types import ImageData
from common.client import VISION_ANNOTATOR_CLIENT


class ImageToTextParser:

    logger = logging.getLogger(__name__)
    ANNOTATION_FEATURES = ({"type_": vision.Feature.Type.TEXT_DETECTION},)

    def __init__(self) -> None:
        pass

    def _check_confidences(self, response: vision.AnnotateImageResponse) -> None:
        print(response)

    def _validate_ocr_response(self, response: vision.AnnotateImageResponse) -> None:
        if response.error.message:
            self.logger.error("Failed to OCR url: ", response.error.message)
            raise Exception(
                f"{response.error.message}\nFor more info on error messages, check: "
                "https://cloud.google.com/apis/design/errors".format()
            )

        self._check_confidences(response)

    async def _get_ocr_response(self, img: ImageData) -> vision.AnnotateImageResponse:
        image = vision.Image(content=img.base64)

        request = vision.AnnotateImageRequest(
            image=image, features=self.ANNOTATION_FEATURES
        )

        response = VISION_ANNOTATOR_CLIENT.annotate_image(request=request)

        self._validate_ocr_response(response)

        return response

    async def detect_text(self, img: ImageData) -> Optional[str]:
        """
        Detects all text in the image file and returns it as unstructed data.

        Returns `NONE` if the image is invalid.
        """

        response = await self._get_ocr_response(img=img)
        texts = response.text_annotations

        return texts[0].description
