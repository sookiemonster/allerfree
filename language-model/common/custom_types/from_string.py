from typing import Optional
from logging import getLogger
from dataclasses import dataclass, field
import json

logger = getLogger(__name__)


@dataclass
class JsonParseResult:
    did_succeed: bool
    error: Optional[str] = ""
    json_dict: dict = field(default_factory=dict)


def from_string(json_string: Optional[str]) -> JsonParseResult:
    logger.debug("RECEIVED JSON STRING: \n %s", json_string)
    print(json_string)

    if not json_string:
        null_obj_received_message = "Received None for JSON string. Likely the structuring LLM errored during execution."
        logger.error(null_obj_received_message)
        return JsonParseResult(did_succeed=False, error=null_obj_received_message)

    if not (json_dict := json.loads(json_string)):
        invalid_json_msg = "Did not receive a valid JSON format the structurer. Hallucination possibly?"
        logger.error(invalid_json_msg)
        return JsonParseResult(did_succeed=False, error=invalid_json_msg)

    return JsonParseResult(json_dict=json_dict, did_succeed=True)
