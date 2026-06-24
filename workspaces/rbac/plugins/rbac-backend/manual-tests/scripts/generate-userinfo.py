#!/usr/bin/env python3
"""Generate userinfo.csv for all 42 manual-test users from hierarchy test expectations."""

from __future__ import annotations

import csv
from pathlib import Path

# Expected catalog.entity.read results — mirrors permission-policy.hierarchy.test.ts
EXPECTED: list[tuple[str, str]] = [
    ("ant_man", "ALLOW"),
    ("hulk", "DENY"),
    ("thor", "ALLOW"),
    ("wasp", "DENY"),
    ("moon_knight", "ALLOW"),
    ("spiderman", "DENY"),
    ("captain_america", "ALLOW"),
    ("hawkeye", "DENY"),
    ("quicksilver", "DENY"),
    ("scarlet_witch", "DENY"),
    ("swordsman", "ALLOW"),
    ("hercules", "DENY"),
    ("black_panther", "DENY"),
    ("vision", "DENY"),
    ("black_knight", "ALLOW"),
    ("black_widow", "DENY"),
    ("mantis", "DENY"),
    ("beast", "DENY"),
    ("moondragon", "ALLOW"),
    ("hellcat", "DENY"),
    ("captain_marvel", "DENY"),
    ("falcon", "DENY"),
    ("wonder_man", "DENY"),
    ("tigra", "DENY"),
    ("she_hulk", "DENY"),
    ("starfox", "DENY"),
    ("mockingbird", "DENY"),
    ("war_machine", "DENY"),
    ("namor", "DENY"),
    ("thing", "DENY"),
    ("doctor_druid", "DENY"),
    ("firebird", "DENY"),
    ("valkyrie", "DENY"),
    ("nova", "DENY"),
    ("storm", "DENY"),
    ("daredevil", "DENY"),
    ("psylocke", "ALLOW"),
    ("penance", "DENY"),
    ("cable", "ALLOW"),
    ("ghost_rider", "DENY"),
    ("admin", "ALLOW"),
    ("super_user", "ALLOW"),
]

PASSWORD = "test"
OUTPUT = Path(__file__).resolve().parent.parent / "userinfo.csv"


def main() -> None:
    if len(EXPECTED) != 42:
        raise SystemExit(f"Expected 42 users, got {len(EXPECTED)}")

    rows = [
        [f"{username}@example.com", PASSWORD, expected, "token"]
        for username, expected in EXPECTED
    ]

    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["email", "password", "expected", "token"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} users to {OUTPUT}")


if __name__ == "__main__":
    main()
