const allowedLevels = new Set(["beginner", "intermediate", "advanced"]);

export function parsePositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function parseNonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function normalizeWorkingWeight(item) {
  const exerciseId = parsePositiveInteger(item?.exercise_id);
  const weight = parseNonNegativeNumber(item?.weight);

  if (!exerciseId || weight === null) {
    return null;
  }

  return {
    exercise_id: exerciseId,
    weight
  };
}

export async function saveProfile({ userId, body, repositories, clock = () => new Date() }) {
  const weight = parsePositiveNumber(body?.weight);
  const level = body?.level;
  const workingWeights = body?.working_weights || [];

  if (!weight || !allowedLevels.has(level)) {
    return {
      status: 400,
      body: { message: "Valid body weight and training level are required" }
    };
  }

  if (!Array.isArray(workingWeights)) {
    return {
      status: 400,
      body: { message: "Working weights must be an array" }
    };
  }

  const normalizedWeights = workingWeights.map(normalizeWorkingWeight);

  if (normalizedWeights.some((item) => !item)) {
    return {
      status: 400,
      body: { message: "Each working weight must include a valid exercise and weight" }
    };
  }

  const uniqueExerciseIds = [...new Set(normalizedWeights.map((item) => item.exercise_id))];
  const existingExercises = await repositories.exercises.findByIds(uniqueExerciseIds);

  if (existingExercises.length !== uniqueExerciseIds.length) {
    return {
      status: 400,
      body: { message: "Unknown exercise" }
    };
  }

  const profile = await repositories.profiles.findOrCreate({ user_id: userId, weight, level });

  if (profile.weight !== weight || profile.level !== level) {
    profile.weight = weight;
    profile.level = level;
    await repositories.profiles.save(profile);
  }

  for (const item of normalizedWeights) {
    const stat = await repositories.stats.findOrCreate({
      user_id: userId,
      exercise_id: item.exercise_id,
      weight: item.weight,
      updated_at: clock()
    });

    if (Number(stat.weight) !== item.weight) {
      stat.weight = item.weight;
      stat.updated_at = clock();
      await repositories.stats.save(stat);
    }
  }

  return {
    status: 200,
    body: {
      profile,
      working_weights: await repositories.stats.findByUser(userId)
    }
  };
}
