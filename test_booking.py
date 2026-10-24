"""test_booking.py - acceptance tests for can_book (run: python -m unittest -v)."""
import copy
import importlib
import os
import unittest

can_book = importlib.import_module(os.environ.get("BOOKING_MODULE", "booking")).can_book

NOW = 540
EXISTING = [(600, 660)]


class AcceptanceTests(unittest.TestCase):
    def check(self, start, end, expected, blocked=False, existing=None, now=NOW):
        existing = EXISTING if existing is None else existing
        self.assertIs(can_book(start, end, now, blocked, existing), expected)

    # AC4
    def test_touching_end_is_available(self):
        self.check(660, 720, True)

    def test_touching_start_is_available(self):
        self.check(540 + 30, 600, True)

    def test_overlap_is_unavailable(self):
        self.check(630, 690, False)

    def test_contained_in_existing_is_unavailable(self):
        self.check(610, 650, False)

    def test_contains_existing_is_unavailable(self):
        self.check(590, 670, False)

    def test_identical_to_existing_is_unavailable(self):
        self.check(600, 660, False)

    def test_multiple_bookings(self):
        ex = [(600, 660), (700, 760), (800, 860)]
        self.check(660, 700, True, existing=ex)
        self.check(750, 790, False, existing=ex)
        self.check(760, 800, True, existing=ex)

    def test_no_existing_bookings(self):
        self.check(660, 720, True, existing=[])

    # AC3
    def test_blocked_room_rejects(self):
        self.check(660, 720, False, blocked=True)

    # AC2
    def test_exactly_120_minutes_allowed(self):
        self.check(720, 840, True)

    def test_121_minutes_rejected(self):
        self.check(720, 841, False)

    # AC1
    def test_starts_now_rejected(self):
        self.check(540, 570, False)

    def test_starts_before_now_rejected(self):
        self.check(500, 530, False)

    def test_starts_one_minute_after_now_allowed(self):
        self.check(541, 570, True)

    def test_reversed_times_rejected(self):
        self.check(720, 660, False)

    def test_zero_length_rejected(self):
        self.check(720, 720, False)

    def test_end_of_day_allowed(self):
        self.check(1380, 1440, True)

    def test_past_end_of_day_rejected(self):
        self.check(1400, 1441, False)

    def test_negative_start_rejected(self):
        self.check(-10, 30, False, now=0)

    def test_start_zero_never_after_now(self):
        self.check(0, 30, False, now=0)

    def test_now_boundaries(self):
        self.assertTrue(can_book(1, 31, 0, False, []))
        self.assertTrue(can_book(1439, 1440, 1438, False, []))
        self.assertFalse(can_book(1439, 1440, 1439, False, []))

    # input safety
    def test_inputs_unchanged(self):
        ex = [(600, 660), (700, 760)]
        before = copy.deepcopy(ex)
        can_book(630, 690, NOW, False, ex)
        can_book(660, 700, NOW, False, ex)
        self.assertEqual(ex, before)

    def test_returns_real_bool(self):
        self.assertIsInstance(can_book(660, 720, NOW, False, EXISTING), bool)
        self.assertIsInstance(can_book(630, 690, NOW, False, EXISTING), bool)

    def test_non_integer_inputs_rejected(self):
        self.assertFalse(can_book(660.5, 700, NOW, False, EXISTING))
        self.assertFalse(can_book("660", 700, NOW, False, EXISTING))
        self.assertFalse(can_book(True, 700, NOW, False, EXISTING))
        self.assertFalse(can_book(660, None, NOW, False, EXISTING))


if __name__ == "__main__":
    unittest.main(verbosity=2)
