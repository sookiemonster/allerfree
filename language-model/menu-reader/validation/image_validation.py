import logging
from url_exists import url_exists

logger = logging.getLogger(__name__)


def image_is_valid(img_url: str) -> bool:
    if not img_url:
        logger.error("Received `None` URL")
        return False

    if not url_exists(img_url):
        return False

    return True
