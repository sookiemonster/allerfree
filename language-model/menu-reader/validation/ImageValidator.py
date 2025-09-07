import requests
import logging

logger = logging.getLogger(__name__)


def url_exists(url: str):
    """
    Checks if a given URL exists by sending a HEAD request.

    Args:
        url (str): The URL to check.

    Returns:
        bool: True if the URL exists (status code 200), False otherwise.
    """
    try:
        response = requests.head(url, timeout=5)  # Use HEAD request for efficiency

        if response.status_code != 200:
            logger.error("Failed to fetch URL: ", url, response)
            return False

        return True
    except requests.exceptions.RequestException as e:
        logger.error(e)
        return False


def image_is_valid(img_url: str) -> bool:
    if not img_url:
        logger.error("Received `None` URL")
        return False

    if not url_exists(img_url):
        return False

    return True
