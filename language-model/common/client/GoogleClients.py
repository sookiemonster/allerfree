from google.genai import Client
from google.cloud.vision import ImageAnnotatorClient
from dotenv import load_dotenv

# These are (supposed to be) thread-safe
load_dotenv()

VISION_ANNOTATOR_CLIENT = ImageAnnotatorClient()
GEMINI_API_CLIENT = Client()
