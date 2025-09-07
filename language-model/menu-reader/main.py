from google.cloud import vision
import requests


def check_url_exists(url: str):
    """
    Checks if a given URL exists by sending a HEAD request.

    Args:
        url (str): The URL to check.

    Returns:
        bool: True if the URL exists (status code 200), False otherwise.
    """
    if not url:
        return False

    try:
        response = requests.head(url, timeout=5)  # Use HEAD request for efficiency
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error checking URL {url}: {e}")
        return False


def detect_text(client: vision.ImageAnnotatorClient, image_uri: str):
    """Detects text in the file."""

    check_url_exists(image_uri)

    image = vision.Image()
    image.source.image_uri = image_uri
    features = [
        {"type_": vision.Feature.Type.TEXT_DETECTION},
    ]

    request = vision.AnnotateImageRequest(image=image, features=features)
    response = client.annotate_image(request=request)

    texts = response.text_annotations
    print("Texts:")

    for text in texts:
        print(f'\n"{text.description}"')

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(response.error.message)
        )

    return texts


if __name__ == "__main__":
    dummy_uri = "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nolu0ktuCp6Iv2xYf862rZitPbloquBOiu53uSwa16PBf8QvFpHicv9KG9oLv1ToCzh7EnQcIQoL7RCYwkx2El97LO3V_TQ8qa4LMz7UtVUU-Tk1qW2lHB8G6bl0yULK2QruLX-hw=w1080"
    client = vision.ImageAnnotatorClient()
    detect_text(client, dummy_uri)
