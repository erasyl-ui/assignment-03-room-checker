"""booking_v1.py - first implementation of can_book (saved before any fixes)."""


def can_book(start, end, now, blocked, existing):
    if blocked:
        return False
    if start < 0 or end > 1440 or start >= end:
        return False
    if start <= now:
        return False
    if end - start > 120:
        return False
    for s, e in existing:
        if start < e and s < end:
            return False
    return True
