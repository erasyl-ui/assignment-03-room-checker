"""booking.py - room availability check for the Smart Campus prototype.

can_book(start, end, now, blocked, existing) -> bool

Times are integer minutes after midnight.
Rules (fixed acceptance criteria):
  AC1  0 <= start < end <= 1440 and start > now (strictly)
  AC2  duration <= 120 minutes (exactly 120 is allowed)
  AC3  a blocked room rejects every request
  AC4  overlap with an existing booking is rejected; touching endpoints
       (e.g. 600-660 and 660-720) do NOT overlap
Inputs are never modified; only the standard library is used.
"""

MINUTES_PER_DAY = 1440
MAX_DURATION = 120


def _is_minute(value):
    """True for a real int (bool is excluded on purpose: True == 1)."""
    return isinstance(value, int) and not isinstance(value, bool)


def can_book(start, end, now, blocked, existing):
    """Return True only if the requested interval [start, end) is valid."""
    # AC3 - blocked room rejects everything.
    if blocked:
        return False

    # Type validation: reject anything that is not a plain integer.
    if not (_is_minute(start) and _is_minute(end) and _is_minute(now)):
        return False

    # AC1 - day bounds, ordering and "strictly after now".
    if not (0 <= start < end <= MINUTES_PER_DAY):
        return False
    if start <= now:
        return False

    # AC2 - maximum duration.
    if end - start > MAX_DURATION:
        return False

    # AC4 - overlap with any existing booking (read-only iteration).
    for booking in existing:
        b_start, b_end = booking
        if start < b_end and b_start < end:
            return False

    return True
