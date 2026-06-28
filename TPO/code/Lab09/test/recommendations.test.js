import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildRecommendation, getRecommendations } from "../src/recommendations.js";

const benchPress = {
  exercise_id: 1,
  weight: 100,
  Exercise: { id: 1, name: "Bench press" }
};

function history(weights) {
  return weights.map((weight, index) => ({
    date: `2026-05-${20 - index}`,
    WorkoutHistoryExercises: [{
      exercise_id: 1,
      weight,
      sets: 3,
      reps: 5
    }]
  }));
}

function createRepositories({ profile, stats = [], historyEntries = [] }) {
  return {
    profiles: {
      async findByUser() {
        return profile;
      }
    },
    stats: {
      async findByUser() {
        return stats;
      }
    },
    history: {
      async findByUser() {
        return historyEntries;
      }
    }
  };
}

describe("recommendation helpers", () => {
  it("asks user to fill profile when profile is absent", async () => {
    const result = await getRecommendations({
      userId: 7,
      repositories: createRepositories({ profile: null })
    });

    assert.equal(result.recommendations.length, 0);
    assert.match(result.summary, /profile/);
  });

  it("asks user to add working weights when stats are absent", async () => {
    const result = await getRecommendations({
      userId: 7,
      repositories: createRepositories({ profile: { level: "beginner" }, stats: [] })
    });

    assert.equal(result.recommendations.length, 0);
    assert.match(result.summary, /working weights/);
  });

  it("returns log_workout when there is no exercise history", () => {
    const result = buildRecommendation(benchPress, { level: "beginner" }, []);

    assert.equal(result.recommendation, "log_workout");
    assert.equal(result.suggested_weight, 100);
  });

  it("recommends increase after stable recent work", () => {
    const result = buildRecommendation(benchPress, { level: "beginner" }, history([100, 102.5]));

    assert.equal(result.recommendation, "increase");
    assert.equal(result.suggested_weight, 105);
    assert.equal(result.program_adjustment, "increase_load");
  });

  it("recommends deload after repeated misses and downward trend", () => {
    const result = buildRecommendation(benchPress, { level: "intermediate" }, history([90, 95, 97.5]));

    assert.equal(result.recommendation, "deload");
    assert.equal(result.suggested_weight, 97.5);
    assert.equal(result.suggested_sets, 2);
  });

  it("recommends updating working weight when history has a better result", () => {
    const result = buildRecommendation(benchPress, { level: "advanced" }, history([95, 105, 97.5]));

    assert.equal(result.recommendation, "update_working_weight");
    assert.equal(result.suggested_weight, 105);
  });

  it("recommends maintaining load when recent work is not stable enough", () => {
    const result = buildRecommendation(benchPress, { level: "advanced" }, history([95, 100]));

    assert.equal(result.recommendation, "maintain");
    assert.equal(result.suggested_weight, 100);
  });

  it("builds summary for ready increases using repository stubs", async () => {
    const result = await getRecommendations({
      userId: 7,
      repositories: createRepositories({
        profile: { level: "beginner" },
        stats: [benchPress],
        historyEntries: history([100, 100])
      })
    });

    assert.equal(result.recommendations.length, 1);
    assert.equal(result.recommendations[0].recommendation, "increase");
    assert.match(result.summary, /ready/);
  });
});
