#!/usr/bin/env python3
"""Flatten content/raw/*.json (any nested shape) into quiz/flashcard CSVs."""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "content" / "raw"
OUT = ROOT / "content"

SECTIONS = {
    "PostgreSQL",
    "MySQL",
    "B-tree & LSM",
    "Cassandra",
    "DynamoDB",
    "Redis",
    "AWS & S3",
    "Kubernetes",
    "Java",
    "Spring Boot",
    "Python",
    "C++",
    "Data Structures & Algorithms",
    "Gen AI",
    "AI Agents",
}
SECTION_ALIASES = {
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "b-tree & lsm": "B-tree & LSM",
    "btree & lsm": "B-tree & LSM",
    "b-tree and lsm": "B-tree & LSM",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "redis": "Redis",
    "aws & s3": "AWS & S3",
    "aws and s3": "AWS & S3",
    "s3": "AWS & S3",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "java": "Java",
    "spring boot": "Spring Boot",
    "spring": "Spring Boot",
    "python": "Python",
    "c++": "C++",
    "cpp": "C++",
    "data structures & algorithms": "Data Structures & Algorithms",
    "dsa": "Data Structures & Algorithms",
    "gen ai": "Gen AI",
    "genai": "Gen AI",
    "ai agents": "AI Agents",
    "agents": "AI Agents",
}
LEVEL_ALIASES = {
    "junior": "junior",
    "easy": "junior",
    "beginner": "junior",
    "senior": "senior",
    "medium": "senior",
    "intermediate": "senior",
    "production": "senior",
    "staff": "staff",
    "hard": "staff",
    "advanced": "staff",
    "staff+": "staff",
}
TRIVIA_HINTS = re.compile(
    r"(what year|in 19\d{2}|in 20\d{2}|default port|port number|availability sla|\bsla of\b|released in)",
    re.I,
)

QUIZ_FIELDS = [
    "Section",
    "Level",
    "Question",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer",
]
FLASH_FIELDS = ["Section", "Level", "Question", "Correct Answer"]
SHEET_QUIZ_FIELDS = [
    "Section",
    "Question",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer",
]
SHEET_FLASH_FIELDS = ["Section", "Question", "Correct Answer"]

# If a question never names the system, readers are guessing the domain
# (e.g. "What does GAC do?" with no DynamoDB). Prefix those stems.
CONTEXT_LEAD = {
    "PostgreSQL": "In PostgreSQL",
    "MySQL": "In MySQL",
    "B-tree & LSM": "For B-trees and LSM trees",
    "Cassandra": "In Cassandra",
    "DynamoDB": "In DynamoDB",
    "Redis": "In Redis",
    "AWS & S3": "In AWS / S3",
    "Kubernetes": "In Kubernetes",
    "Java": "In Java",
    "Spring Boot": "In Spring Boot",
    "Python": "In Python",
    "C++": "In C++",
    "Data Structures & Algorithms": "In data structures and algorithms",
    "Gen AI": "In generative AI",
    "AI Agents": "For AI agents",
}
CONTEXT_HINTS = {
    "PostgreSQL": ("postgres", "postgresql"),
    "MySQL": ("mysql", "innodb"),
    "B-tree & LSM": ("b-tree", "btree", "lsm tree", "lsm-tree", "lsm engine"),
    "Cassandra": ("cassandra",),
    "DynamoDB": ("dynamodb", "dynamo db", "dynamo"),
    "Redis": ("redis",),
    "AWS & S3": ("aws", "s3", "amazon s3"),
    "Kubernetes": ("kubernetes", "k8s", "kubelet", "kubectl"),
    "Java": ("java", "jvm", "jdk"),
    "Spring Boot": ("spring",),
    "Python": ("python", "cpython"),
    "C++": ("c++", "cpp"),
    "Data Structures & Algorithms": ("data structure", "algorithm", "big-o"),
    "Gen AI": ("generative ai", "llm", "language model"),
    "AI Agents": ("agent",),
}


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def mentions_section(question: str, section: str) -> bool:
    q = question.lower()
    if section.lower() in q:
        return True
    return any(hint in q for hint in CONTEXT_HINTS.get(section, ()))


def with_context(question: str, section: str) -> str:
    if mentions_section(question, section):
        return question
    lead = CONTEXT_LEAD.get(section)
    if not lead:
        return question
    if question.lower().startswith(lead.lower()):
        return question
    rest = question
    two = rest[:2]
    looks_like_acronym = len(two) == 2 and two.isalpha() and two.isupper()
    if rest[:1].isupper() and not looks_like_acronym:
        rest = rest[0].lower() + rest[1:]
    return f"{lead}, {rest}"


def canon_section(value: str) -> str | None:
    raw = (value or "").strip()
    if raw in SECTIONS:
        return raw
    return SECTION_ALIASES.get(raw.lower())


def canon_level(value: str) -> str | None:
    return LEVEL_ALIASES.get((value or "").strip().lower())


def letter_from_answer(value, options: list[str]) -> str | None:
    if isinstance(value, int) and 0 <= value < 4:
        return "ABCD"[value]
    if isinstance(value, str):
        v = value.strip()
        if v.upper() in "ABCD" and len(v) == 1:
            return v.upper()
        # "1" / "2"
        if v.isdigit() and 0 <= int(v) < 4:
            return "ABCD"[int(v)]
        # match option text
        nv = norm(v).lower()
        for i, opt in enumerate(options):
            if norm(opt).lower() == nv:
                return "ABCD"[i]
    return None


def parse_options(item: dict) -> list[str] | None:
    if all(item.get(k) for k in ("optionA", "optionB", "optionC", "optionD")):
        return [norm(item[k]) for k in ("optionA", "optionB", "optionC", "optionD")]
    opts = item.get("options")
    if isinstance(opts, list) and len(opts) >= 4:
        return [norm(str(x)) for x in opts[:4]]
    if isinstance(opts, dict):
        keys = ["A", "B", "C", "D"]
        if all(k in opts or k.lower() in opts for k in keys):
            return [norm(str(opts.get(k) or opts.get(k.lower()) or "")) for k in keys]
    return None


def parse_quiz_item(item: dict, section: str | None, level: str | None) -> dict | None:
    section = canon_section(item.get("section") or section or "")
    level = canon_level(item.get("level") or level or "")
    question = norm(item.get("question") or item.get("prompt") or "")
    options = parse_options(item)
    if not options or not question:
        return None
    correct = letter_from_answer(
        item.get("correct") if item.get("correct") is not None else item.get("answer"),
        options,
    )
    if not section or not level or not correct:
        return None
    return {
        "section": section,
        "level": level,
        "question": question,
        "optionA": options[0],
        "optionB": options[1],
        "optionC": options[2],
        "optionD": options[3],
        "correct": correct,
    }


def parse_flash_item(item: dict, section: str | None, level: str | None) -> dict | None:
    section = canon_section(item.get("section") or section or "")
    level = canon_level(item.get("level") or level or "")
    question = norm(
        item.get("question") or item.get("front") or item.get("prompt") or ""
    )
    answer = norm(
        item.get("answer")
        or item.get("back")
        or item.get("Correct Answer")
        or item.get("explanation")
        or ""
    )
    if not section or not level or not question or not answer:
        return None
    return {
        "section": section,
        "level": level,
        "question": question,
        "answer": answer,
    }


def walk(obj, section=None, level=None):
    """Yield (kind, item_dict, section, level)."""
    if isinstance(obj, dict):
        for candidate in (obj.get("section"), obj.get("title"), obj.get("name")):
            if canon_section(candidate or ""):
                section = candidate
                break
        for candidate in (obj.get("level"), obj.get("name")):
            if canon_level(candidate or ""):
                level = candidate
                break
        if "optionA" in obj or "options" in obj:
            yield "quiz", obj, section, obj.get("level") or level
        elif any(k in obj for k in ("front", "back")) or (
            "question" in obj and ("answer" in obj or "Correct Answer" in obj) and "options" not in obj
        ):
            yield "flash", obj, section, obj.get("level") or level
        for key, val in obj.items():
            next_level = level
            if key in LEVEL_ALIASES:
                next_level = key
            walk_section = section
            if key in ("quiz", "flashcards", "flash", "cards"):
                kind = "quiz" if key == "quiz" else "flash"
                if isinstance(val, list):
                    for item in val:
                        if isinstance(item, dict):
                            yield kind, item, walk_section, next_level
                continue
            yield from walk(val, walk_section, next_level)
    elif isinstance(obj, list):
        for item in obj:
            yield from walk(item, section, level)


def collect() -> tuple[list[dict], list[dict]]:
    quiz: list[dict] = []
    flash: list[dict] = []
    if not RAW.exists():
        return quiz, flash
    for path in sorted(RAW.glob("*.json")):
        data = json.loads(path.read_text())
        for kind, item, section, level in walk(data):
            if kind == "quiz":
                parsed = parse_quiz_item(item, section, level)
                if parsed:
                    quiz.append(parsed)
            else:
                parsed = parse_flash_item(item, section, level)
                if parsed:
                    flash.append(parsed)
    return quiz, flash


def valid_quiz(row: dict, seen: set[str]) -> str | None:
    if row["section"] not in SECTIONS:
        return f"bad section: {row['section']}"
    if row["level"] not in {"junior", "senior", "staff"}:
        return f"bad level: {row['level']}"
    if not row["question"] or any(not row[k] for k in ("optionA", "optionB", "optionC", "optionD")):
        return "missing question/options"
    if row["correct"] not in {"A", "B", "C", "D"}:
        return f"bad correct: {row['correct']}"
    opts = [row["optionA"], row["optionB"], row["optionC"], row["optionD"]]
    if len(set(opts)) < 4:
        return "duplicate options"
    if any(len(o) < 12 for o in opts):
        return "option too short"
    if TRIVIA_HINTS.search(row["question"]):
        return "trivia-like question"
    key = row["question"].lower()
    if key in seen:
        return "duplicate question"
    seen.add(key)
    return None


def valid_flash(row: dict, seen: set[str]) -> str | None:
    if row["section"] not in SECTIONS:
        return f"bad section: {row['section']}"
    if row["level"] not in {"junior", "senior", "staff"}:
        return f"bad level: {row['level']}"
    if not row["question"] or not row["answer"]:
        return "missing question/answer"
    if TRIVIA_HINTS.search(row["question"]):
        return "trivia-like question"
    key = row["question"].lower()
    if key in seen:
        return "duplicate question"
    seen.add(key)
    return None


def to_quiz_csv(row: dict) -> dict:
    return {
        "Section": row["section"],
        "Level": row["level"],
        "Question": row["question"],
        "Option A": row["optionA"],
        "Option B": row["optionB"],
        "Option C": row["optionC"],
        "Option D": row["optionD"],
        "Correct Answer": row["correct"],
    }


def to_flash_csv(row: dict) -> dict:
    return {
        "Section": row["section"],
        "Level": row["level"],
        "Question": row["question"],
        "Correct Answer": row["answer"],
    }


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    quiz_raw, flash_raw = collect()
    quiz_seen: set[str] = set()
    flash_seen: set[str] = set()
    quiz_rows: list[dict] = []
    flash_rows: list[dict] = []
    dropped = 0

    for row in quiz_raw:
        row = {**row, "question": with_context(row["question"], row["section"])}
        err = valid_quiz(row, quiz_seen)
        if err:
            dropped += 1
            continue
        quiz_rows.append(to_quiz_csv(row))

    for row in flash_raw:
        row = {**row, "question": with_context(row["question"], row["section"])}
        err = valid_flash(row, flash_seen)
        if err:
            dropped += 1
            continue
        flash_rows.append(to_flash_csv(row))

    quiz_rows.sort(key=lambda r: (r["Level"], r["Section"], r["Question"]))
    flash_rows.sort(key=lambda r: (r["Level"], r["Section"], r["Question"]))

    write_csv(OUT / "questions-quiz.csv", QUIZ_FIELDS, quiz_rows)
    write_csv(OUT / "questions-flashcards.csv", FLASH_FIELDS, flash_rows)

    sheets = OUT / "sheets"
    public_data = ROOT / "public" / "data"
    for level in ("junior", "senior", "staff"):
        q = [{k: r[k] for k in SHEET_QUIZ_FIELDS} for r in quiz_rows if r["Level"] == level]
        f = [{k: r[k] for k in SHEET_FLASH_FIELDS} for r in flash_rows if r["Level"] == level]
        write_csv(sheets / f"{level}-quiz.csv", SHEET_QUIZ_FIELDS, q)
        write_csv(sheets / f"{level}-flashcards.csv", SHEET_FLASH_FIELDS, f)
        write_csv(public_data / f"{level}-quiz.csv", SHEET_QUIZ_FIELDS, q)
        write_csv(public_data / f"{level}-flashcards.csv", SHEET_FLASH_FIELDS, f)

    print(f"kept {len(quiz_rows)} quiz, {len(flash_rows)} flashcards; dropped {dropped}")
    for level in ("junior", "senior", "staff"):
        qn = sum(1 for r in quiz_rows if r["Level"] == level)
        fn = sum(1 for r in flash_rows if r["Level"] == level)
        print(f"  {level}: {qn} quiz, {fn} flashcards")
    by_sec: dict[str, int] = {}
    for r in quiz_rows:
        by_sec[r["Section"]] = by_sec.get(r["Section"], 0) + 1
    for sec in sorted(by_sec):
        print(f"  quiz/{sec}: {by_sec[sec]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
