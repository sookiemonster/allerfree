
import requests
import base64
from common.custom_types import ImageData
from typing import Tuple, Optional


def fetch_image_from_url(url: str) -> Optional[Tuple[bytes, str]]:
    """
    Fetches an image from a URL and returns its base64 content and MIME type.

    This function sends a GET request to the provided URL, retrieves the image
    content, and encodes it into a base64 string. It also extracts the
    'Content-Type' header to determine the image's MIME type.

    Args:
        url: The URL of the image to fetch.

    Returns:
        A tuple containing the base64-encoded string of the image and its
        MIME type (e.g., 'image/jpeg').
        Returns None if the request fails, the URL is invalid, or the
        content is not an image.
    """
    # Make the HTTP request to get the image.
    # Set a timeout to avoid hanging indefinitely.
    response = requests.get(url, stream=True, timeout=10)

    # Raise an exception for bad status codes (4xx or 5xx).
    response.raise_for_status()

    # Check the Content-Type header to ensure it's an image.
    mime_type = response.headers.get("Content-Type")
    if not mime_type or not mime_type.startswith("image/"):
        print(f"Warning: URL does not point to an image. MIME type: {mime_type}")
        return None

    # Get the raw binary content of the image.
    image_bytes = response.content

    # Encode the bytes into a base64 string.
    base64_content = base64.b64encode(image_bytes).decode('utf-8')
    return ImageData(base64=base64_content, mime_type=mime_type)
