import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeWorkingWeight, saveProfile } from "../src/profile.js";

function createRepositories({ exerciseIds = [1, 2], profile = null, stats = [] } = {}) {
  const savedProfiles = [];
  const savedStats = [];
  const state = {
    profile,
    stats: [...stats]
  };

  return {
    savedProfiles,
    savedStats,
    repositories: {
      exercises: {
        async findByIds(ids) {
          return ids.filter((id) => exerciseIds.includes(id)).map((id) => ({ id }));
        }
      },
      profiles: {
        async findOrCreate(defaults) {
          if (!state.profile) {
            state.profile = { ...defaults };
          }

          return state.profile;
        },
        async save(profileToSave) {
          savedProfiles.push({ ...profileToSave });
        }
      },
      stats: {
        async findOrCreate(defaults) {
          let stat = state.stats.find((item) => item.exercise_id === defaults.exercise_id);

          if (!stat) {
            stat = { ...defaults };
            state.stats.push(stat);
          }

          return stat;
        },
        async save(stat) {
          savedStats.push({ ...stat });
        },
        async findByUser(userId) {
          return state.stats.filter((item) => item.user_id === userId);
        }
      }
    }
  };
}

describe("profile helpers", () => {
  it("normalizes valid working weight item", () => {
    assert.deepEqual(normalizeWorkingWeight({ exercise_id: 1, weight: "42.5" }), {
      exercise_id: 1,
      weight: 42.5
    });
  });

  it("rejects invalid working weight item", () => {
    assert.equal(normalizeWorkingWeight({ exercise_id: 0, weight: -1 }), null);
  });

  it("returns 400 when body weight or level is invalid", async () => {
    const { repositories } = createRepositories();

    const result = await saveProfile({
      userId: 7,
      body: { weight: 0, level: "master" },
      repositories
    });

    assert.equal(result.status, 400);
    assert.match(result.body.message, /body weight/);
  });

  it("returns 400 when working weights are not an array", async () => {
    const { repositories } = createRepositories();

    const result = await saveProfile({
      userId: 7,
      body: { weight: 80, level: "beginner", working_weights: "bad" },
      repositories
    });

    assert.equal(result.status, 400);
    assert.match(result.body.message, /array/);
  });

  it("returns 400 when exercise does not exist", async () => {
    const { repositories } = createRepositories({ exerciseIds: [1] });

    const result = await saveProfile({
      userId: 7,
      body: {
        weight: 80,
        level: "intermediate",
        working_weights: [{ exercise_id: 2, weight: 50 }]
      },
      repositories
    });

    assert.equal(result.status, 400);
    assert.equal(result.body.message, "Unknown exercise");
  });

  it("creates profile and working weights with repository stubs", async () => {
    const { repositories } = createRepositories();
    const fixedDate = new Date("2026-05-20T10:00:00.000Z");

    const result = await saveProfile({
      userId: 7,
      body: {
        weight: 80,
        level: "intermediate",
        working_weights: [{ exercise_id: 1, weight: 50 }]
      },
      repositories,
      clock: () => fixedDate
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.profile.level, "intermediate");
    assert.deepEqual(result.body.working_weights, [{
      user_id: 7,
      exercise_id: 1,
      weight: 50,
      updated_at: fixedDate
    }]);
  });

  it("updates existing profile and stat when values changed", async () => {
    const { repositories, savedProfiles, savedStats } = createRepositories({
      profile: { user_id: 7, weight: 75, level: "beginner" },
      stats: [{ user_id: 7, exercise_id: 1, weight: 45, updated_at: new Date("2026-01-01") }]
    });

    const result = await saveProfile({
      userId: 7,
      body: {
        weight: 80,
        level: "advanced",
        working_weights: [{ exercise_id: 1, weight: 50 }]
      },
      repositories,
      clock: () => new Date("2026-05-20T10:00:00.000Z")
    });

    assert.equal(result.status, 200);
    assert.equal(savedProfiles.length, 1);
    assert.equal(savedStats.length, 1);
    assert.equal(result.body.profile.level, "advanced");
    assert.equal(result.body.working_weights[0].weight, 50);
  });
});
