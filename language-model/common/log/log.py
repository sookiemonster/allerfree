from dotenv import load_dotenv
import logging
import sys
import os
import warnings
import pathlib

LOGGING_IS_CONFIGURED = False
DEFAULT_LOG_PATH = "./logs"


def setup_logger():
    global LOGGING_IS_CONFIGURED

    if LOGGING_IS_CONFIGURED:
        return

    load_dotenv()

    if os.environ.get("LOG_PATH", False):
        warnings.warn(
            "Logging path was not specified. Using default developer location."
        )

    log_path = pathlib.Path(os.environ.get("LOG_PATH", DEFAULT_LOG_PATH))
    log_path.mkdir(parents=True, exist_ok=True)

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_path / "app.log"),  # Output to file
            logging.StreamHandler(sys.stdout),  # Output to console
        ],
    )

    LOGGING_IS_CONFIGURED = True


def get_logger(name: str, identifier: str = "all"):
    setup_logger()
    return logging.getLogger(f"llm_service_{name}[{identifier}]")
