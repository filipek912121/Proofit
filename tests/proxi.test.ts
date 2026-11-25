import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_LOOK, meetsRule, PROXI_ITEMS, sanitizeLook, SLOTS, stageForLevel } from "@/lib/proxi/config";
import { LINES, pickLine } from "@/lib/proxi/messages";

describe("PROXI evolution", () => {
  it("maps levels to the four stages", () => {
    assert.equal(stageForLevel(1), 1);
    assert.equal(stageForLevel(4), 1);
    assert.equal(stageForLevel(5), 2);
    assert.equal(stageForLevel(9), 2);
    assert.equal(stageForLevel(10), 3);
    assert.equal(stageForLevel(19), 3);
    assert.equal(stageForLevel(20), 4);
    assert.equal(stageForLevel(99), 4);
  });
});

describe("PROXI wardrobe", () => {
  const base = { level: 1, checkins: 0, challengesCompleted: 0, achievements: [] as string[], isPremium: false };
  it("checks unlock rules against real progress", () => {
    assert.equal(meetsRule({ type: "level", value: 5 }, base), false);
    assert.equal(meetsRule({ type: "level", value: 5 }, { ...base, level: 5 }), true);
    assert.equal(meetsRule({ type: "checkins", value: 10 }, { ...base, checkins: 10 }), true);
    assert.equal(meetsRule({ type: "achievement", id: "streak_7" }, { ...base, achievements: ["streak_7"] }), true);
    assert.equal(meetsRule({ type: "premium" }, base), false);
  });
  it("every slot has exactly one default item and unique ids", () => {
    for (const { slot } of SLOTS) assert.equal(PROXI_ITEMS.filter((i) => i.slot === slot && i.rule.type === "default").length, 1, slot);
    assert.equal(new Set(PROXI_ITEMS.map((i) => i.id)).size, PROXI_ITEMS.length);
  });
  it("rejects unknown or wrong-slot items in a stored look", () => {
    assert.deepEqual(sanitizeLook(null), DEFAULT_LOOK);
    const look = sanitizeLook({ head: "head-crown", face: "head-cap", eyes: "hack" });
    assert.equal(look.head, "head-crown");
    assert.equal(look.face, DEFAULT_LOOK.face);
    assert.equal(look.eyes, DEFAULT_LOOK.eyes);
  });
});

describe("PROXI lines", () => {
  it("never repeats the previous line when alternatives exist", () => {
    for (let i = 0; i < 50; i++) {
      const prev = LINES.greeting[0];
      assert.notEqual(pickLine("greeting", prev), prev);
    }
  });
});
