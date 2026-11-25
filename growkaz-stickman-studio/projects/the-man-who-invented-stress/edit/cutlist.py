"""Shot list for the edit. Each cut starts on the first word of its anchor phrase (searched forward
through build/words.json), so pictures change on the words. Options:
  m=  motion: in | out | left | right | up | down | shake | rush   (default: alternates in/out)
  draw=True   ink draw-on from blank paper (scene openers, cards)
  tint="cold" blue-grey grade
  CARD:<text> a hand-lettered card;  SPLIT:<a>|<b> a two-panel split screen
  at=<seconds> absolute start instead of an anchor"""
import json, re
CUTS = [
 # ── COLD OPEN ─────────────────────────────────────────────
 ("01_you_bed", "It's two", dict(draw=True, m="in")),
 ("02_you_chest", "Why is my heart", dict(m="in")),
 ("03_you_knees", "I have the meeting", dict(m="shake")),
 ("04_you_window", "Hey. Hey.", dict(m="out")),
 ("02_you_chest", "Tight chest", dict(m="in")),
 ("04_you_window", "That low hum", dict(m="left")),
 ("CARD:stress", "Stress.", dict(draw=True, m="in")),
 ("52_you_think", "Here's the strange part", dict(m="up")),
 ("05_bridge", "bridge", dict(m="out")),
 ("06_truss", "Stress was an engineering", dict(m="up")),
 ("07_selye_door", "Then one clumsy", dict(m="in")),
 ("39_smoke", "And somebody paid", dict(m="up")),
 ("04_you_window", "This is the story", dict(m="in")),
 ("CARD:The Man Who\nInvented Stress", "Montreal", dict(draw=True, m="in", lead=3.45)),
 # ── ACT ONE ───────────────────────────────────────────────
 ("08_mcgill", "Montreal", dict(draw=True, m="right")),
 ("09_selye_desk", "If I inject", dict(m="in")),
 ("10_selye_inject", "Every day he injects", dict(m="in")),
 ("11_rat_run", "No, no, no", dict(m="rush")),
 ("12_selye_chase", "Come back", dict(m="shake")),
 ("13_selye_floor", "A broom?", dict(m="in")),
 ("14_selye_asleep", "For months", dict(m="out")),
 ("15_selye_micro", "Then he opens", dict(m="in")),
 ("16_selye_thrilled", "It worked", dict(m="in")),
 ("17_cages", "Because he also had", dict(m="left")),
 ("18_selye_shock", "And they had the exact", dict(m="in")),
 ("19_selye_cradle", "It wasn't the extract", dict(m="out")),
 ("10_selye_inject", "The needles", dict(m="in")),
 ("11_rat_run", "the dropping", dict(m="rush")),
 ("12_selye_chase", "the chasing", dict(m="shake")),
 ("13_selye_floor", "the broom", dict(m="in")),
 ("17_cages", "Their bodies weren't", dict(m="in", tint="cold")),
 ("15_selye_micro", "So he tested", dict(m="in")),
 ("20_rat_snow", "Cold", dict(m="down")),
 ("11_rat_run", "Exhaustion", dict(m="rush", tint="cold")),
 ("17_cages", "Injury", dict(m="in", tint="cold")),
 ("19_selye_cradle", "Different ordeals", dict(m="out")),
 ("22_selye_typewriter", "In 1936", dict(m="in")),
 ("06_truss", "But when it came", dict(m="up")),
 ("23_oldselye_lecture", "And he spent the rest", dict(m="out")),
 # ── ACT TWO ───────────────────────────────────────────────
 ("24_newspapers", "By the 1950s", dict(draw=True, m="right")),
 ("25_kitchen", "kitchen tables", dict(m="in")),
 ("26_you_dry", "So this is his fault", dict(m="in")),
 ("27_heart_anatomy", "Your body really", dict(m="in")),
 ("39_smoke", "But a word that powerful", dict(m="up")),
 # ── ACT THREE ─────────────────────────────────────────────
 ("28_sf_street", "San Francisco", dict(draw=True, m="up")),
 ("30_doctors", "Two heart doctors", dict(m="in")),
 ("29_waiting_room", "Their chairs need", dict(m="left")),
 ("31_uph_arrive", "So they call", dict(m="in")),
 ("32_uph_kneel", "Huh", dict(m="in")),
 ("34_friedman_watch", "Heart patients", dict(m="in")),
 ("33_worn_edge", "they only wear", dict(m="in")),
 ("26_you_dry", "That's me in every", dict(m="in")),
 ("35_perched", "Nobody sat back", dict(m="shake")),
 ("29_waiting_room", "Ready to spring", dict(m="in")),
 ("36_friedman_think", "As Friedman later", dict(m="in")),
 ("37_rush", "common", dict(m="rush", end_off=-0.3)),
 ("35_perched", "Always on the edge", dict(m="shake")),
 ("36_friedman_think", "They gave it a name", dict(m="in")),
 ("38_friedman_point", "Type A", dict(m="in")),
 ("29_waiting_room", "And for a while", dict(m="out")),
 # ── ACT FOUR ──────────────────────────────────────────────
 ("39_smoke", "Now. Think", dict(draw=True, m="up", tint="cold")),
 ("46_cig_hand", "And not from", dict(m="in")),
 ("40_ad_man", "Tense?", dict(m="in")),
 ("41_archive", "Decades later", dict(m="up")),
 ("42_oldselye_letter", "In 1958", dict(m="in")),
 ("23_oldselye_lecture", "Over the years", dict(m="out")),
 ("44_courtroom", "in court", dict(m="in")),
 ("42_oldselye_letter", "He didn't publicly", dict(m="in", tint="cold")),
 ("38_friedman_point", "And Type A?", dict(m="out")),
 ("46_cig_hand", "major funder", dict(m="up")),
 ("45_you_stunned", "So the cigarette", dict(m="in")),
 ("40_ad_man", "Light up. Relax. They", dict(m="out", tint="cold")),
 ("39_smoke", "They helped sell", dict(m="up")),
 ("46_cig_hand", "And that you need", dict(m="in")),
 ("03_you_knees", "And that story", dict(m="in", tint="cold")),
 # ── ACT FIVE ──────────────────────────────────────────────
 ("47_survey", "In 2012", dict(draw=True, m="in")),
 ("26_you_dry", "A lot", dict(m="in")),
 ("47_survey", "And do you believe", dict(m="in")),
 ("26_you_dry", "Yes?", dict(m="in")),
 ("49_bench", "Then the researchers", dict(m="right")),
 ("48_crowd", "People with a lot", dict(m="out")),
 ("50_you_whisper", "That's me", dict(m="in")),
 ("52_you_think", "But here's what", dict(m="up")),
 ("48_crowd", "People with just", dict(m="in")),
 ("50_you_whisper", "What?", dict(m="in")),
 ("SPLIT:03_you_knees|56_you_dawn", "Same pressure", dict(m="in")),
 ("49_bench", "Now, it's one study", dict(m="left")),
 ("04_you_window", "What if part", dict(m="in")),
 # ── ENDING ────────────────────────────────────────────────
 ("19_selye_cradle", "rats got sick", dict(draw=True, m="out", lead=0.75)),
 ("06_truss", "Pressure is real", dict(m="up")),
 ("53_heart_glow", "But think about", dict(m="in")),
 ("54_you_breathe", "breathing quickens", dict(m="up")),
 ("55_runner", "Your focus", dict(m="in")),
 ("55_runner", "That's a body getting", dict(m="rush")),
 ("01_you_bed", "It's two", dict(m="in")),
 ("57_you_stand", "Okay", dict(m="up")),
 ("56_you_dawn", "The word was invented", dict(m="out")),
]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower().replace("2 a.m.", "two").replace("1936", "1936"))
def resolve(words, total):
    NUM = {"2": "two"}
    toks = [NUM.get(norm(w["w"]), norm(w["w"])) for w in words]
    out, cur = [], 0
    for shot, anchor, o in CUTS:
        if "at" in o: start = o["at"]
        else:
            want = [norm(x) for x in anchor.replace("'", "").split() if norm(x)]
            want = [w.replace("2", "two") if w == "2" else w for w in want]
            for i in range(cur, len(toks)):
                if all(i + k < len(toks) and toks[i + k].replace("'", "") == want[k] for k in range(len(want))): break
            else:
                ctx = " ".join(w["w"] for w in words[cur:cur + 25])
                raise SystemExit(f"anchor not found: {anchor!r} for {shot}; next words: {ctx}")
            start = words[i]["e"] + o["end_off"] if "end_off" in o else words[i]["s"] - o.get("lead", 0.12)
            cur = i + (0 if "lead" in o else 1)
        out.append({"shot": shot, "start": round(max(0, start), 3), **{k: v for k, v in o.items() if k not in ("lead", "end_off")}})
    out[0]["start"] = 0.0
    for a, b in zip(out, out[1:]): a["end"] = b["start"]
    out[-1]["end"] = total
    return out
if __name__ == "__main__":
    words = json.load(open("build/words.json")); total = json.load(open("build/lines.json"))["duration"]
    cl = resolve(words, total); json.dump(cl, open("build/cutlist.json", "w"), indent=1)
    d = [c["end"] - c["start"] for c in cl]
    print(len(cl), "cuts; shortest %.2fs longest %.2fs" % (min(d), max(d)))
    for c in cl:
        if c["end"] - c["start"] < 0.6 or c["end"] - c["start"] > 13: print("  check:", c["shot"], round(c["start"], 2), round(c["end"] - c["start"], 2))
