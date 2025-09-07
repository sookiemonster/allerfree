import logging
from google.cloud import vision
from validation.image_validation import image_is_valid
from typing import Optional


class ImageToTextParser(object):

    logger = logging.getLogger(__name__)
    ANNOTATION_FEATURES = ({"type_": vision.Feature.Type.TEXT_DETECTION},)

    def __init__(self) -> None:
        self.client_ = vision.ImageAnnotatorClient()

    def get_ocr_response(self, image_uri: str) -> vision.AnnotateImageResponse:
        image = vision.Image()
        image.source.image_uri = image_uri

        request = vision.AnnotateImageRequest(
            image=image, features=self.ANNOTATION_FEATURES
        )

        response: vision.AnnotateImageResponse = self.client_.annotate_image(
            request=request
        )
        if response.error.message:
            self.logger.error("Failed to OCR url: ", image_uri, response.error.message)
            raise Exception(
                "{}\nFor more info on error messages, check: "
                "https://cloud.google.com/apis/design/errors".format(
                    response.error.message
                )
            )

        return response

    def detect_text(self, image_uri: str) -> Optional[str]:
        """Detects text in the file."""

        if not image_is_valid(image_uri):
            return None

        response = self.get_ocr_response(image_uri=image_uri)
        texts = response.text_annotations

        return texts[0].description
