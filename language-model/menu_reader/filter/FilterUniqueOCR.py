import re
import typing
import logging
import common.custom_types
from thefuzz import fuzz

logger = logging.getLogger(__name__)


class FilterUniqueOCR:
    def __init__(self, similarity_threshold=50):
        """
        :param similarity_threshold: int 0-100. How similar two strings must be
                                     to be considered the "same content".
        """
        self.threshold = similarity_threshold

    def _clean_text(self, text):
        """
        Helper to normalize text for comparison purposes only (removes noise).
        """
        if not text:
            return ""
        # Lowercase and remove non-alphanumeric char to focus on content
        return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()

    def _is_similar(self, a: str, b: str):
        """
        Returns True if strings are similar enough to be considered duplicates.
        """
        clean_a = self._clean_text(a)
        clean_b = self._clean_text(b)

        # Optimization: If one is empty and the other isn't, they aren't similar
        if not clean_a or not clean_b:
            return False

        score = fuzz.token_sort_ratio(clean_a, clean_b)
        logger.debug(
            f"Similarity of score: {score} || Is Similar: {score >= self.threshold} between:\nA: {a}, B:{b}"
        )
        return score >= self.threshold

    def _get_longest_distinct_mask(self, ocr_texts: typing.List[str]):
        """
        Accepts an ordered list of strings.
        Returns a list of booleans.
        True = This is the longest/best version of this content.
        False = This is a duplicate or shorter version of another string.
        """
        n = len(ocr_texts)
        if n == 0:
            return []

        # 1. Initialize clusters.
        # structure: [ [index_1, index_2], [index_3], ... ]
        clusters = []
        processed_indices = set()

        for i in range(n):
            if i in processed_indices:
                continue

            # Start a new cluster with the current item
            current_cluster = [i]
            processed_indices.add(i)

            # Look ahead for duplicates/similar items
            for j in range(i + 1, n):
                if j in processed_indices:
                    continue

                # If distinct texts are similar, group them
                if self._is_similar(ocr_texts[i], ocr_texts[j]):
                    current_cluster.append(j)
                    processed_indices.add(j)

            clusters.append(current_cluster)

        logger.debug(f"Found menu OCR clusters: \n{clusters}")
        # 2. Determine winners (Longest string in each cluster)
        # Initialize result mask as all False
        result_mask = [False] * n

        for cluster in clusters:
            # Find index in this cluster that points to the longest string
            # We use a tuple sort key: (length, -index)
            # This ensures if lengths are tied, we pick the EARLIEST index (stable choice)
            best_idx = max(cluster, key=lambda idx: (len(ocr_texts[idx]), -idx))

            result_mask[best_idx] = True

        return result_mask

    def _run_filter(
        self,
        image_text_pairs: typing.List[typing.Tuple[common.custom_types.ImageData, str]],
    ) -> typing.List[typing.Tuple[common.custom_types.ImageData, str]]:
        """
        Filters out images if they contain duplicate information as
        other images.
        """
        texts = [pair[1] for pair in image_text_pairs]
        logger.debug(f"Filtering texts: {texts}")
        mask = self._get_longest_distinct_mask(texts)

        filtered = [image_text_pairs[i] for i in range(len(mask)) if mask[i]]

        logger.info(
            f"Filtered {len(texts)} images down to {len(filtered)} unique images. Using mask: {mask}"
        )
        logger.debug(f"Identified unique OCR: \n{[pair[1] for pair in filtered]}")

        return filtered


def filter_unique_images(
    image_text_pairs: typing.List[typing.Tuple[common.custom_types.ImageData, str]],
) -> typing.List[typing.Tuple[common.custom_types.ImageData, str]]:
    filterer = FilterUniqueOCR()
    return filterer._run_filter(image_text_pairs)
