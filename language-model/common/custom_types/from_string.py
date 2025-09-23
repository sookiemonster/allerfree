from typing import Optional
from logging import getLogger

logger = getLogger(__name__)


def _from_string(cls, json_string: Optional[str], failure_handler: function) -> dict:
    logger.debug("RECEIVED JSON STRING: \n %s", json_string)
    print(json_string)

    if not json_string:
        null_obj_received_message = "Received None for JSON string. Likely the structuring LLM errored during execution."
        logger.error(null_obj_received_message)
        return failure_handler(null_obj_received_message)

    if not (json_dict := json.loads(json_string)):
        invalid_json_msg = "Did not receive a valid JSON format the structurer. Hallucination possibly?"
        logger.error(invalid_json_msg)
        return failure_handler(invalid_json_msg)

    return json_dict
