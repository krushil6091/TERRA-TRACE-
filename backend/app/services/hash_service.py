import hashlib


def compute_sha256(data: bytes) -> str:
    """
    Computes the standard SHA-256 cryptographic hash over raw file bytes.
    """
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()
