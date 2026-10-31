#!/usr/bin/env python3
"""犯罪白書の Excel から public/data の cube を書く。"""

from __future__ import annotations

import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
HAKUSYO = ROOT / "data/raw/hakusyo"
OUT = ROOT / "public/data"

ERA_FROM = 1946
ERA_TO = 2024
AGE_FROM = 1971
PROBATION_FROM = 1949

METRICS = [
    ("year_end", "年末収容人員", "規模"),
    ("admitted", "入所受刑者", "規模"),
    ("sentenced_end", "年末の受刑者", "規模"),
    ("occupancy", "収容率", "率"),
    ("per_100k", "人口10万人当たり収容", "率"),
    ("female_share", "女性比（年末収容）", "率"),
    ("reentry_rate", "再入者率", "率"),
    ("parole_rate", "仮釈放率", "率"),
    ("elderly_share", "高齢者比（入所・65歳以上）", "率"),
]

AGE_CODES = [
    ("u20", "20歳未満"),
    ("a20", "20代"),
    ("a30", "30代"),
    ("a40", "40代"),
    ("a50", "50代"),
    ("a60", "60代"),
    ("a70", "70歳以上"),
]

PROBATION_METRICS = [
    ("parole", "仮釈放で保護観察"),
    ("suspended", "執行猶予で保護観察"),
    ("adult", "成人の保護観察開始"),
    ("suspended_rate", "全部執行猶予の保護観察率"),
]

OFFENSES = [
    ("theft", "窃盗"),
    ("stimulant", "覚醒剤取締法"),
    ("fraud", "詐欺"),
    ("traffic", "道路交通法"),
    ("injury", "傷害"),
    ("robbery", "強盗"),
    ("rape", "不同意性交等"),
    ("embezzlement", "横領・背任"),
    ("trespass", "住居侵入"),
    ("murder", "殺人"),
    ("indecent", "不同意わいせつ"),
    ("narcotics", "麻薬取締法"),
]


def years_inclusive(a: int, b: int) -> list[str]:
    return [str(y) for y in range(a, b + 1)]


def round_n(v: float | None, digits: int) -> float | None:
    if v is None or not isinstance(v, (int, float)):
        return None
    if isinstance(v, bool):
        return None
    f = 10**digits
    return round(v * f) / f


def num(v: object | None) -> float | None:
    if isinstance(v, bool) or v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str) and v.strip() in {"…", "...", "－", "-", "—", "―"}:
        return None
    return None


def year_of(v: object | None) -> int | None:
    if isinstance(v, bool) or v is None:
        return None
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, str):
        t = re.sub(r"\s+", "", v)
        if t.endswith("年"):
            t = t[:-1]
        if t.isdigit():
            return int(t)
    return None


class Cube:
    def __init__(self, dims: list[tuple[str, list[str]]], measures: list[str]):
        self.dims = [{"name": n, "codes": codes} for n, codes in dims]
        self.index = [{c: i for i, c in enumerate(codes)} for _, codes in dims]
        self.strides = []
        for i in range(len(dims)):
            s = 1
            for _, codes in dims[i + 1 :]:
                s *= len(codes)
            self.strides.append(s)
        self.size = 1
        for _, codes in dims:
            self.size *= len(codes)
        self.measures = {m: [None] * self.size for m in measures}

    def set(self, measure: str, coords: list[str], value: float | None) -> None:
        offset = 0
        for i, code in enumerate(coords):
            offset += self.index[i][code] * self.strides[i]
        self.measures[measure][offset] = value

    def to_json(self) -> dict:
        return {"dims": self.dims, "measures": self.measures}


def iter_year_rows(ws, min_row: int = 7):
    for row in ws.iter_rows(min_row=min_row, max_row=ws.max_row, values_only=True):
        year = year_of(row[2])
        if year is None:
            continue
        yield year, row


def load_year_end() -> dict[int, dict[str, float | None]]:
    ws = openpyxl.load_workbook(HAKUSYO / "2-4-2-1.xlsx", data_only=True).active
    out: dict[int, dict[str, float | None]] = {}
    for year, row in iter_year_rows(ws):
        total, male, female = num(row[3]), num(row[4]), num(row[5])
        parts = [num(row[i]) for i in (6, 7, 8, 9)]
        sentenced_bits = [x for x in parts if x is not None]
        sentenced = sum(sentenced_bits) if any(x is not None for x in parts[2:]) else None
        share = None if total in (None, 0) or female is None else female / total
        out[year] = {
            "year_end": total,
            "sentenced_end": sentenced,
            "female_share": share,
            "per_100k": num(row[20]),
        }
        _ = male
    return out


def load_admitted() -> dict[int, float | None]:
    ws = openpyxl.load_workbook(HAKUSYO / "2-4-2-2.xlsx", data_only=True).active
    return {year: num(row[3]) for year, row in iter_year_rows(ws)}


def load_occupancy() -> dict[int, float | None]:
    ws = openpyxl.load_workbook(HAKUSYO / "shiryo2-5.xlsx", data_only=True)["資料2-5①"]
    out: dict[int, float | None] = {}
    for year, row in iter_year_rows(ws, min_row=6):
        pct = num(row[5])
        out[year] = None if pct is None else pct / 100
    return out


def load_reentry() -> dict[int, float | None]:
    ws = openpyxl.load_workbook(HAKUSYO / "5-3-1.xlsx", data_only=True)["5-3-1図①"]
    out: dict[int, float | None] = {}
    for year, row in iter_year_rows(ws):
        pct = num(row[6])
        out[year] = None if pct is None else pct / 100
    return out


def load_parole_rate() -> dict[int, float | None]:
    wb = openpyxl.load_workbook(HAKUSYO / "2-5-2-1.xlsx", data_only=True)
    out: dict[int, float | None] = {}
    for sheet in ("2-5-2-1図（S24～H27）", "2-5-2-1図（H28～R６）①"):
        for year, row in iter_year_rows(wb[sheet]):
            pct = num(row[7])
            out[year] = None if pct is None else pct / 100
    return out


def load_age_counts() -> dict[int, dict[str, float | None]]:
    wb = openpyxl.load_workbook(HAKUSYO / "2-4-2-4.xlsx", data_only=True)
    male = {year: row for year, row in iter_year_rows(wb["2-4-2-4図①"])}
    female = {year: row for year, row in iter_year_rows(wb["2-4-2-4図②"])}
    out: dict[int, dict[str, float | None]] = {}
    for year in sorted(set(male) | set(female)):
        m, f = male.get(year), female.get(year)

        def add(i: int) -> float | None:
            a = None if m is None else num(m[i])
            b = None if f is None else num(f[i])
            if a is None and b is None:
                return None
            return (a or 0) + (b or 0)

        total = add(3)
        u65 = add(11)
        u70 = add(12)
        elderly = None
        if u65 is not None and u70 is not None and total not in (None, 0):
            elderly = (u65 + u70) / total
        out[year] = {
            "total": total,
            "u20": add(4),
            "a20": add(5),
            "a30": add(6),
            "a40": add(7),
            "a50": add(8),
            "a60": add(9),
            "a70": add(12),
            "elderly_share": elderly,
        }
    return out


def load_offenses() -> list[dict]:
    ws = openpyxl.load_workbook(HAKUSYO / "2-4-2-5.xlsx", data_only=True)["2-4-2-5図（R６）"]
    wanted = {label: code for code, label in OFFENSES}
    found: dict[str, float] = {}
    total = None
    for row in ws.iter_rows(min_row=7, max_row=40, values_only=True):
        label = row[2]
        persons = num(row[3])
        if label == "総数" and row[1] == "刑法犯・過失運転致死傷等・特別法犯":
            total = persons
            continue
        if not isinstance(label, str) or label not in wanted or persons is None:
            continue
        found[wanted[label]] = persons
    if total in (None, 0):
        raise SystemExit("入所罪名の総数が読めない")
    out = []
    for code, label in OFFENSES:
        persons = found.get(code)
        if persons is None:
            continue
        out.append(
            {
                "code": code,
                "label": label,
                "persons": round_n(persons, 0),
                "share": round_n(persons / total, 4),
            }
        )
    out.sort(key=lambda r: r["persons"] or 0, reverse=True)
    return out


def load_probation() -> dict[int, dict[str, float | None]]:
    wb = openpyxl.load_workbook(HAKUSYO / "shiryo2-9.xlsx", data_only=True)
    out: dict[int, dict[str, float | None]] = {}

    def put(year: int, parole: float | None, suspended: float | None, rate_pct: float | None) -> None:
        adult = None if parole is None and suspended is None else (parole or 0) + (suspended or 0)
        out[year] = {
            "parole": parole,
            "suspended": suspended,
            "adult": adult,
            "suspended_rate": None if rate_pct is None else rate_pct / 100,
        }

    for year, row in iter_year_rows(wb["資料2-9（S24～S63）"]):
        put(year, num(row[7]), num(row[8]), num(row[10]))
    for year, row in iter_year_rows(wb["資料2-9（H元～H27） "]):
        put(year, num(row[13]), num(row[16]), num(row[20]))
    for year, row in iter_year_rows(wb["資料2-9（H28～R６）"]):
        put(year, num(row[18]), num(row[23]), num(row[29]))
    return out


def build_era() -> dict:
    years = years_inclusive(ERA_FROM, ERA_TO)
    cube = Cube([("metric", [m[0] for m in METRICS]), ("year", years)], ["persons", "rate"])
    year_end = load_year_end()
    admitted = load_admitted()
    occupancy = load_occupancy()
    reentry = load_reentry()
    parole = load_parole_rate()
    age = load_age_counts()
    for y in range(ERA_FROM, ERA_TO + 1):
        ys = str(y)
        e = year_end.get(y, {})
        cube.set("persons", ["year_end", ys], round_n(e.get("year_end"), 0))
        cube.set("persons", ["admitted", ys], round_n(admitted.get(y), 0))
        cube.set("persons", ["sentenced_end", ys], round_n(e.get("sentenced_end"), 0))
        cube.set("rate", ["occupancy", ys], round_n(occupancy.get(y), 4))
        cube.set("rate", ["per_100k", ys], round_n(e.get("per_100k"), 2))
        cube.set("rate", ["female_share", ys], round_n(e.get("female_share"), 4))
        cube.set("rate", ["reentry_rate", ys], round_n(reentry.get(y), 4))
        cube.set("rate", ["parole_rate", ys], round_n(parole.get(y), 4))
        cube.set("rate", ["elderly_share", ys], round_n(age.get(y, {}).get("elderly_share"), 4))
    metrics = [{"code": c, "label": lab, "level": 1, "parent": g} for c, lab, g in METRICS]
    return {**cube.to_json(), "metrics": metrics}


def build_age() -> dict:
    years = years_inclusive(AGE_FROM, ERA_TO)
    codes = [c for c, _ in AGE_CODES]
    cube = Cube([("code", codes), ("year", years)], ["persons", "share"])
    table = load_age_counts()
    for y in range(AGE_FROM, ERA_TO + 1):
        row = table.get(y, {})
        total = row.get("total")
        for code, _label in AGE_CODES:
            persons = row.get(code)
            share = None if persons is None or total in (None, 0) else persons / total
            cube.set("persons", [code, str(y)], round_n(persons, 0))
            cube.set("share", [code, str(y)], round_n(share, 4))
    return {
        **cube.to_json(),
        "codes": [{"code": c, "label": lab, "level": 1} for c, lab in AGE_CODES],
        "offenses": load_offenses(),
    }


def build_probation() -> dict:
    years = years_inclusive(PROBATION_FROM, ERA_TO)
    cube = Cube(
        [("metric", [m[0] for m in PROBATION_METRICS]), ("year", years)],
        ["persons", "rate"],
    )
    table = load_probation()
    for y in range(PROBATION_FROM, ERA_TO + 1):
        ys = str(y)
        row = table.get(y, {})
        cube.set("persons", ["parole", ys], round_n(row.get("parole"), 0))
        cube.set("persons", ["suspended", ys], round_n(row.get("suspended"), 0))
        cube.set("persons", ["adult", ys], round_n(row.get("adult"), 0))
        cube.set("rate", ["suspended_rate", ys], round_n(row.get("suspended_rate"), 4))
    metrics = [{"code": c, "label": lab, "level": 1} for c, lab in PROBATION_METRICS]
    return {**cube.to_json(), "metrics": metrics}


def write_json(name: str, data: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.json"
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    path.write_text(text)
    print(f"  {name}.json  {path.stat().st_size / 1024:.1f} KB")


def main() -> None:
    print("building cubes")
    write_json("era", build_era())
    write_json("age", build_age())
    write_json("probation", build_probation())
    print("done")


if __name__ == "__main__":
    main()
