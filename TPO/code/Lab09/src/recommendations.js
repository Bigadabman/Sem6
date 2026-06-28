export const incrementByLevel = {
  beginner: 5,
  intermediate: 2.5,
  advanced: 1.25
};

export function getRecentEntries(history, exerciseId) {
  return history
    .flatMap((entry) => (entry.WorkoutHistoryExercises || []).map((item) => ({
      date: entry.date,
      exercise_id: item.exercise_id,
      weight: Number(item.weight),
      sets: item.sets,
      reps: item.reps
    })))
    .filter((item) => item.exercise_id === exerciseId)
    .slice(0, 3);
}

export function buildRecommendation(stat, profile, history) {
  const currentWeight = Number(stat.weight);
  const recentEntries = getRecentEntries(history, stat.exercise_id);
  const increment = incrementByLevel[profile?.level] || incrementByLevel.intermediate;
  const exerciseName = stat.Exercise?.name || "Exercise";

  if (!recentEntries.length) {
    return {
      exercise: stat.Exercise,
      current_weight: currentWeight,
      recommendation: "log_workout",
      suggested_weight: currentWeight,
      suggested_sets: null,
      suggested_reps: null,
      program_adjustment: "collect_data",
      message: `Log a few ${exerciseName} workouts before increasing load.`
    };
  }

  const bestRecentWeight = Math.max(...recentEntries.map((entry) => entry.weight));
  const latestEntry = recentEntries[0];
  const oldestEntry = recentEntries[recentEntries.length - 1];
  const stableRecentWork = recentEntries.length >= 2
    && recentEntries.every((entry) => entry.weight >= currentWeight);
  const repeatedMisses = recentEntries.length >= 3
    && recentEntries.every((entry) => entry.weight < currentWeight);
  const downwardTrend = recentEntries.length >= 3
    && latestEntry.weight < oldestEntry.weight;

  if (repeatedMisses && downwardTrend) {
    return {
      exercise: stat.Exercise,
      current_weight: currentWeight,
      recommendation: "deload",
      suggested_weight: Math.max(0, currentWeight - increment),
      suggested_sets: Math.max(1, latestEntry.sets - 1),
      suggested_reps: latestEntry.reps,
      program_adjustment: "reduce_load_and_volume",
      message: `Recent ${exerciseName} results are falling. Use a deload session before pushing again.`
    };
  }

  if (stableRecentWork) {
    return {
      exercise: stat.Exercise,
      current_weight: currentWeight,
      recommendation: "increase",
      suggested_weight: currentWeight + increment,
      suggested_sets: latestEntry.sets,
      suggested_reps: latestEntry.reps,
      program_adjustment: "increase_load",
      message: `Recent ${exerciseName} work is stable. Try ${currentWeight + increment} kg next.`
    };
  }

  if (bestRecentWeight > currentWeight) {
    return {
      exercise: stat.Exercise,
      current_weight: currentWeight,
      recommendation: "update_working_weight",
      suggested_weight: bestRecentWeight,
      suggested_sets: latestEntry.sets,
      suggested_reps: latestEntry.reps,
      program_adjustment: "update_profile",
      message: `You have already lifted ${bestRecentWeight} kg. Update working weight for ${exerciseName}.`
    };
  }

  return {
    exercise: stat.Exercise,
    current_weight: currentWeight,
    recommendation: "maintain",
    suggested_weight: currentWeight,
    suggested_sets: latestEntry.sets,
    suggested_reps: latestEntry.reps,
    program_adjustment: "hold_program",
    message: `Keep ${exerciseName} at ${currentWeight} kg until recent workouts are consistent.`
  };
}

export async function getRecommendations({ userId, repositories }) {
  const [profile, stats, history] = await Promise.all([
    repositories.profiles.findByUser(userId),
    repositories.stats.findByUser(userId),
    repositories.history.findByUser(userId)
  ]);

  if (!profile) {
    return {
      summary: "Fill in your profile to receive load recommendations.",
      recommendations: []
    };
  }

  if (!stats.length) {
    return {
      summary: "Add working weights in Profile or save workouts in History to receive recommendations.",
      recommendations: []
    };
  }

  const recommendations = stats.map((stat) => buildRecommendation(stat, profile, history));
  const increases = recommendations.filter((item) => item.recommendation === "increase").length;
  const deloads = recommendations.filter((item) => item.recommendation === "deload").length;
  const updates = recommendations.filter(
    (item) => item.recommendation === "update_working_weight"
  ).length;

  let summary = "Keep building consistent workout history before increasing loads.";
  let programSummary = "Hold the current program structure.";

  if (deloads) {
    summary = `${deloads} exercise(s) need a temporary deload before the next progression block.`;
    programSummary = "Reduce load and one work set on affected exercises for the next session.";
  } else if (increases) {
    summary = `${increases} exercise(s) are ready for a cautious load increase.`;
    programSummary = "Keep the current plan and progress only the ready exercises.";
  } else if (updates) {
    summary = `${updates} exercise(s) already exceed the saved working weight.`;
    programSummary = "Update working weights before changing the program.";
  }

  return {
    summary,
    program_summary: programSummary,
    recommendations
  };
}
