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

ERA_FROM = 1949
ERA_TO = 2024
AGE_FROM = 1968
DISPOSITION_FROM = 1975

METRICS = [
    ("admitted", "少年院入院", "規模"),
    ("daily_avg", "一日平均在院", "規模"),
    ("detention", "鑑別所の被収容者", "規模"),
    ("to_training", "鑑別所から少年院へ", "規模"),
    ("female_share", "女子比（入院）", "率"),
]

AGE_CODES = [
    ("u16", "16歳未満"),
    ("a16", "16・17歳"),
    ("a18", "18歳以上"),
]

DISPOSITION_CODES = [
    ("probation", "保護観察", 4),
    ("training", "少年院送致", 6),
    ("test", "試験観察", 11),
    ("cancel", "観護措置の取消し", 10),
    ("prosecutor", "検察官送致", 8),
    ("child", "児童自立・養護施設", 5),
    ("nonstart", "審判不開始・不処分", 9),
    ("other", "その他", 12),
]

OFFENSES = [
    ("theft", "窃盗"),
    ("injury", "傷害"),
    ("fraud", "詐欺"),
    ("robbery", "強盗"),
    ("extortion", "恐喝"),
    ("rape", "不同意性交等"),
    ("indecent", "不同意わいせつ"),
    ("traffic", "道路交通法"),
    ("narcotics", "麻薬取締法"),
    ("stimulant", "覚醒剤取締法"),
    ("guhan", "ぐ犯"),
]


def years_inclusive(a: int, b: int) -> list[str]:
    return [str(y) for y in range(a, b + 1)]


def round_n(v: float | None, digits: int) -> float | None:
    if v is None or not isinstance(v, (int, float)) or isinstance(v, bool):
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


def load_admitted() -> dict[int, dict[str, float | None]]:
    wb = openpyxl.load_workbook(HAKUSYO / "3-2-4-1.xlsx", data_only=True)
    out: dict[int, dict[str, float | None]] = {}
    for name in wb.sheetnames:
        for year, row in iter_year_rows(wb[name]):
            total, daily, female = num(row[3]), num(row[4]), num(row[6])
            share = None if total in (None, 0) or female is None else female / total
            out[year] = {"admitted": total, "daily_avg": daily, "female_share": share}
    return out


def load_detention() -> dict[int, float | None]:
    wb = openpyxl.load_workbook(HAKUSYO / "3-2-3-2.xlsx", data_only=True)
    male = {year: num(row[3]) for year, row in iter_year_rows(wb["3-2-3-2図（男子）"])}
    female = {year: num(row[3]) for year, row in iter_year_rows(wb["3-2-3-2図（女子）"])}
    out: dict[int, float | None] = {}
    for year in set(male) | set(female):
        a, b = male.get(year), female.get(year)
        out[year] = None if a is None and b is None else (a or 0) + (b or 0)
    return out


def load_disposition_raw() -> dict[int, dict[str, float | None]]:
    ws = openpyxl.load_workbook(HAKUSYO / "3-2-3-4.xlsx", data_only=True).active
    out: dict[int, dict[str, float | None]] = {}
    for year, row in iter_year_rows(ws):
        total = num(row[3])
        rec: dict[str, float | None] = {"total": total}
        for code, _label, col in DISPOSITION_CODES:
            rec[code] = num(row[col])
        out[year] = rec
    return out


def load_age() -> dict[int, dict[str, float | None]]:
    ws = openpyxl.load_workbook(HAKUSYO / "3-2-4-2.xlsx", data_only=True).active
    out: dict[int, dict[str, float | None]] = {}
    for year, row in iter_year_rows(ws, min_row=8):
        total = num(row[3])
        u16, a16, a18 = num(row[4]), num(row[6]), num(row[8])
        out[year] = {"total": total, "u16": u16, "a16": a16, "a18": a18}
    return out


def load_offenses() -> list[dict]:
    ws = openpyxl.load_workbook(HAKUSYO / "3-2-4-3.xlsx", data_only=True)["3-2-4-3図（R６）"]
    wanted = {label: code for code, label in OFFENSES}
    found: dict[str, float] = {}
    total = None
    for row in ws.iter_rows(min_row=8, max_row=40, values_only=True):
        label = row[2]
        persons = num(row[3])
        if label == "総数" and row[1] == "刑法犯・過失運転致死傷等・特別法犯・ぐ犯":
            total = persons
            continue
        if label == "ぐ犯" or (isinstance(row[1], str) and row[1] == "ぐ犯" and label == "総数"):
            found["guhan"] = persons or 0
            continue
        if not isinstance(label, str) or label not in wanted or persons is None:
            continue
        found[wanted[label]] = persons
    if total in (None, 0):
        raise SystemExit("入院非行名の総数が読めない")
    out = []
    for code, label in OFFENSES:
        persons = found.get(code)
        if persons is None:
            continue
        out.append(
            {
                "code": code,
                "label": label if code != "guhan" else "ぐ犯",
                "persons": round_n(persons, 0),
                "share": round_n(persons / total, 4),
            }
        )
    out.sort(key=lambda r: r["persons"] or 0, reverse=True)
    return out


def build_era() -> dict:
    years = years_inclusive(ERA_FROM, ERA_TO)
    cube = Cube([("metric", [m[0] for m in METRICS]), ("year", years)], ["persons", "rate"])
    admitted = load_admitted()
    detention = load_detention()
    disp = load_disposition_raw()
    for y in range(ERA_FROM, ERA_TO + 1):
        ys = str(y)
        a = admitted.get(y, {})
        cube.set("persons", ["admitted", ys], round_n(a.get("admitted"), 0))
        cube.set("persons", ["daily_avg", ys], round_n(a.get("daily_avg"), 0))
        cube.set("persons", ["detention", ys], round_n(detention.get(y), 0))
        cube.set("persons", ["to_training", ys], round_n(disp.get(y, {}).get("training"), 0))
        cube.set("rate", ["female_share", ys], round_n(a.get("female_share"), 4))
    metrics = [{"code": c, "label": lab, "level": 1, "parent": g} for c, lab, g in METRICS]
    return {**cube.to_json(), "metrics": metrics}


def build_age() -> dict:
    years = years_inclusive(AGE_FROM, ERA_TO)
    codes = [c for c, _ in AGE_CODES]
    cube = Cube([("code", codes), ("year", years)], ["persons", "share"])
    table = load_age()
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


def build_disposition() -> dict:
    years = years_inclusive(DISPOSITION_FROM, ERA_TO)
    codes = [c for c, _, _ in DISPOSITION_CODES]
    cube = Cube([("code", codes), ("year", years)], ["persons", "share"])
    table = load_disposition_raw()
    for y in range(DISPOSITION_FROM, ERA_TO + 1):
        row = table.get(y, {})
        total = row.get("total")
        for code, _label, _col in DISPOSITION_CODES:
            persons = row.get(code)
            share = None if persons is None or total in (None, 0) else persons / total
            cube.set("persons", [code, str(y)], round_n(persons, 0))
            cube.set("share", [code, str(y)], round_n(share, 4))
    return {
        **cube.to_json(),
        "codes": [{"code": c, "label": lab, "level": 1} for c, lab, _ in DISPOSITION_CODES],
    }


def write_json(name: str, data: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(f"  {name}.json  {path.stat().st_size / 1024:.1f} KB")


def main() -> None:
    print("building cubes")
    write_json("era", build_era())
    write_json("age", build_age())
    write_json("disposition", build_disposition())
    print("done")


if __name__ == "__main__":
    main()
