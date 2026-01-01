const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Get last commit date for a directory
 */
function getLastCommitDate(dir) {
  try {
    const result = execSync(
      `git log -1 --format=%ct -- ${dir}`,
      { stdio: ["pipe", "pipe", "ignore"] }
    ).toString().trim();

    return result ? new Date(Number(result) * 1000) : null;
  } catch {
    return null;
  }
}

/**
 * Days since a given date
 */
function daysSince(date) {
  if (!date) return "unknown";
  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check file existence safely
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Determine plugin health status
 */
function getHealthStatus(daysInactive) {
  if (daysInactive === "unknown") return "unknown";
  if (daysInactive > 365) return "at-risk";
  return "active";
}

module.exports = {
  getLastCommitDate,
  daysSince,
  fileExists,
  getHealthStatus,
};
