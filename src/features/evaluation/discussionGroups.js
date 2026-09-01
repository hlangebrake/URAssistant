(function (root) {
  function clampRatio(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  }

  function createSeededRandom(seedValue) {
    let seed = Math.max(1, Math.round(Number(seedValue) || 1)) % 2147483647;

    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function shuffleItems(items, random) {
    const result = (Array.isArray(items) ? items : []).slice();
    let index = result.length - 1;

    while (index > 0) {
      const swapIndex = Math.floor(random() * (index + 1));
      const tmp = result[index];

      result[index] = result[swapIndex];
      result[swapIndex] = tmp;
      index -= 1;
    }

    return result;
  }

  function getBalancedGroupSizes(studentCount, groupCount) {
    const sizes = [];
    const normalizedStudentCount = Math.max(0, Math.round(Number(studentCount) || 0));
    const normalizedGroupCount = normalizedStudentCount
      ? Math.max(1, Math.min(normalizedStudentCount, Math.round(Number(groupCount) || 1)))
      : 0;
    const baseSize = normalizedGroupCount ? Math.floor(normalizedStudentCount / normalizedGroupCount) : 0;
    const remainder = normalizedGroupCount ? normalizedStudentCount % normalizedGroupCount : 0;
    let index;

    for (index = 0; index < normalizedGroupCount; index += 1) {
      sizes.push(baseSize + (index < remainder ? 1 : 0));
    }

    return sizes;
  }

  function getProfileRatios(profile) {
    return Array.isArray(profile && profile.scoreRatios)
      ? profile.scoreRatios.map(clampRatio)
      : [];
  }

  function getProfileTotalRatio(profile) {
    if (Number.isFinite(Number(profile && profile.scoreRatio))) {
      return clampRatio(profile.scoreRatio);
    }

    return Math.max(0, Number(profile && profile.score) || 0);
  }

  function getProfileDistance(leftProfile, rightProfile) {
    const leftValues = getProfileRatios(leftProfile);
    const rightValues = getProfileRatios(rightProfile);
    const length = Math.max(leftValues.length, rightValues.length);
    let sum = 0;
    let index;

    if (!length) {
      return 0;
    }

    for (index = 0; index < length; index += 1) {
      sum += Math.abs((Number(leftValues[index]) || 0) - (Number(rightValues[index]) || 0));
    }

    return sum / length;
  }

  function getComplementScore(leftProfile, rightProfile) {
    const leftValues = getProfileRatios(leftProfile);
    const rightValues = getProfileRatios(rightProfile);
    const length = Math.max(leftValues.length, rightValues.length);
    let positiveDifference = 0;
    let negativeDifference = 0;
    let index;

    if (length < 2) {
      return getProfileDistance(leftProfile, rightProfile);
    }

    for (index = 0; index < length; index += 1) {
      const difference = (Number(leftValues[index]) || 0) - (Number(rightValues[index]) || 0);

      if (difference > 0) {
        positiveDifference += difference;
      } else if (difference < 0) {
        negativeDifference += Math.abs(difference);
      }
    }

    return Math.min(positiveDifference, negativeDifference) / length;
  }

  function getAveragePairMetric(members, metric) {
    let sum = 0;
    let count = 0;
    let leftIndex;
    let rightIndex;

    for (leftIndex = 0; leftIndex < members.length; leftIndex += 1) {
      for (rightIndex = leftIndex + 1; rightIndex < members.length; rightIndex += 1) {
        sum += metric(members[leftIndex], members[rightIndex]);
        count += 1;
      }
    }

    return count ? sum / count : 0;
  }

  function getGroupTotalSpread(members) {
    const values = members.map(getProfileTotalRatio);

    return values.length > 1 ? Math.max.apply(Math, values) - Math.min.apply(Math, values) : 0;
  }

  function getGroupExpertiseMetrics(members) {
    const taskCount = members.reduce(function (maxTaskCount, member) {
      return Math.max(maxTaskCount, getProfileRatios(member).length);
    }, 0);
    const expertAssignments = members.map(function () { return 0; });
    let claritySum = 0;
    let clearTaskCount = 0;
    let taskIndex;

    if (members.length < 2 || !taskCount) {
      return {
        clarity: 0,
        expertCoverage: 0,
        taskCoverage: 0,
        concentration: 0
      };
    }

    for (taskIndex = 0; taskIndex < taskCount; taskIndex += 1) {
      const ranked = members.map(function (member, memberIndex) {
        return {
          memberIndex: memberIndex,
          value: getProfileRatios(member)[taskIndex] || 0
        };
      }).sort(function (left, right) {
        return right.value - left.value;
      });
      const best = ranked[0];
      const otherAverage = ranked.slice(1).reduce(function (sum, entry) {
        return sum + entry.value;
      }, 0) / Math.max(1, ranked.length - 1);
      const gap = Math.max(0, best.value - otherAverage);

      claritySum += gap * (0.4 + (best.value * 0.6));

      if (best.value >= 0.35 && gap >= 0.08) {
        expertAssignments[best.memberIndex] += 1;
        clearTaskCount += 1;
      }
    }

    {
      const uniqueExperts = expertAssignments.filter(function (count) {
        return count > 0;
      }).length;
      const targetExperts = Math.min(members.length, taskCount);
      const excessAssignments = expertAssignments.reduce(function (sum, count) {
        return sum + Math.max(0, count - 1);
      }, 0);

      return {
        clarity: claritySum / taskCount,
        expertCoverage: targetExperts ? uniqueExperts / targetExperts : 0,
        taskCoverage: clearTaskCount / taskCount,
        concentration: taskCount > 1 ? excessAssignments / (taskCount - 1) : 0
      };
    }
  }

  function scoreGroup(group, options, mode) {
    const members = Array.isArray(group && group.members) ? group.members : [];
    const totalSpread = getGroupTotalSpread(members);
    const totalDistance = getAveragePairMetric(members, function (left, right) {
      return Math.abs(getProfileTotalRatio(left) - getProfileTotalRatio(right));
    });
    let score = 0;
    let leftIndex;
    let rightIndex;

    if (members.length < 2) {
      return 0;
    }

    if (mode === "homogen") {
      score -= (totalSpread * totalSpread * 220) + (totalDistance * 150);
    } else if (mode === "ergaenzend") {
      const profileDistance = getAveragePairMetric(members, getProfileDistance);
      const complementScore = getAveragePairMetric(members, getComplementScore);
      const expertise = getGroupExpertiseMetrics(members);

      score += complementScore * 240;
      score += profileDistance * 45;
      score += expertise.clarity * 170;
      score += expertise.expertCoverage * 130;
      score += expertise.taskCoverage * 55;
      score -= expertise.concentration * 45;
    } else {
      score += totalSpread * totalSpread * 220;
      score += totalDistance * 150;
    }

    for (leftIndex = 0; leftIndex < members.length; leftIndex += 1) {
      for (rightIndex = leftIndex + 1; rightIndex < members.length; rightIndex += 1) {
        if (options && options.includeWarnings && members[leftIndex].warned && members[rightIndex].warned) {
          score -= 18;
        }
      }
    }

    if (options && options.includeGender) {
      const genderCounts = members.reduce(function (counts, member) {
        const gender = String(member && member.gender || "").trim();

        if (gender === "m" || gender === "w") {
          counts[gender] += 1;
        }

        return counts;
      }, { m: 0, w: 0 });

      score -= Math.abs(genderCounts.m - genderCounts.w) * 3;
    }

    return score;
  }

  function scoreGroups(groups, options, mode) {
    return (Array.isArray(groups) ? groups : []).reduce(function (sum, group) {
      return sum + scoreGroup(group, options, mode);
    }, 0);
  }

  function createRandomGroups(profiles, groupSizes, random) {
    const shuffledProfiles = shuffleItems(profiles, random);
    let offset = 0;

    return groupSizes.map(function (size) {
      const group = {
        maxSize: size,
        members: shuffledProfiles.slice(offset, offset + size)
      };

      offset += size;
      return group;
    });
  }

  function createInformedGroups(profiles, groupSizes, mode, random) {
    const shuffledProfiles = shuffleItems(profiles, random);
    const groups = groupSizes.map(function (size) {
      return { maxSize: size, members: [] };
    });
    const sortedProfiles = shuffledProfiles.sort(function (left, right) {
      return getProfileTotalRatio(left) - getProfileTotalRatio(right);
    });

    if (mode === "homogen") {
      let offset = 0;

      groups.forEach(function (group) {
        group.members = sortedProfiles.slice(offset, offset + group.maxSize);
        offset += group.maxSize;
      });
      return groups;
    }

    sortedProfiles.reverse();

    {
      let offset = 0;
      let round = 0;

      while (offset < sortedProfiles.length) {
        const indexes = groups.map(function (_, index) { return index; });
        const orderedIndexes = round % 2 === 0 ? indexes : indexes.reverse();

        orderedIndexes.forEach(function (groupIndex) {
          if (offset < sortedProfiles.length && groups[groupIndex].members.length < groups[groupIndex].maxSize) {
            groups[groupIndex].members.push(sortedProfiles[offset]);
            offset += 1;
          }
        });
        round += 1;
      }
    }

    return groups;
  }

  function cloneGroups(groups) {
    return groups.map(function (group) {
      return {
        maxSize: Number(group && group.maxSize) || 0,
        members: Array.isArray(group && group.members) ? group.members.slice() : []
      };
    });
  }

  function optimizeGroups(profiles, groupSizes, options, mode, random) {
    const iterations = Math.max(0, Math.min(5000, Math.round(Number(options && options.optimizationIterations) || 0)));
    const restarts = Math.max(1, Math.min(50, Math.round(Number(options && options.optimizationRestarts) || 1)));
    let bestGroups = [];
    let bestScore = -Infinity;
    let restartIndex;

    for (restartIndex = 0; restartIndex < restarts; restartIndex += 1) {
      let groups = restartIndex === 0
        ? createInformedGroups(profiles, groupSizes, mode, random)
        : createRandomGroups(profiles, groupSizes, random);
      let currentScore = scoreGroups(groups, options, mode);
      let iterationIndex;

      for (iterationIndex = 0; iterationIndex < iterations; iterationIndex += 1) {
        const nonEmptyGroups = groups.filter(function (group) {
          return group.members.length > 0;
        });
        const leftGroup = nonEmptyGroups[Math.floor(random() * nonEmptyGroups.length)] || null;
        let rightGroup = nonEmptyGroups[Math.floor(random() * nonEmptyGroups.length)] || null;
        let leftMemberIndex;
        let rightMemberIndex;
        let nextScore;
        let tmp;

        if (!leftGroup || !rightGroup || nonEmptyGroups.length < 2) {
          break;
        }

        while (rightGroup === leftGroup && nonEmptyGroups.length > 1) {
          rightGroup = nonEmptyGroups[Math.floor(random() * nonEmptyGroups.length)] || null;
        }

        if (!rightGroup || rightGroup === leftGroup) {
          continue;
        }

        leftMemberIndex = Math.floor(random() * leftGroup.members.length);
        rightMemberIndex = Math.floor(random() * rightGroup.members.length);
        tmp = leftGroup.members[leftMemberIndex];
        leftGroup.members[leftMemberIndex] = rightGroup.members[rightMemberIndex];
        rightGroup.members[rightMemberIndex] = tmp;
        nextScore = scoreGroups(groups, options, mode);

        if (nextScore >= currentScore) {
          currentScore = nextScore;
        } else {
          tmp = leftGroup.members[leftMemberIndex];
          leftGroup.members[leftMemberIndex] = rightGroup.members[rightMemberIndex];
          rightGroup.members[rightMemberIndex] = tmp;
        }
      }

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestGroups = cloneGroups(groups);
      }
    }

    return bestGroups;
  }

  function generate(profiles, options) {
    const normalizedProfiles = Array.isArray(profiles) ? profiles.filter(Boolean) : [];
    const normalizedMode = ["homogen", "ergaenzend"].indexOf(String(options && options.mode || "heterogen").trim().toLowerCase()) >= 0
      ? String(options && options.mode || "heterogen").trim().toLowerCase()
      : "heterogen";
    const groupSizes = getBalancedGroupSizes(normalizedProfiles.length, options && options.groupCount);
    const random = createSeededRandom(options && options.seed);

    if (!normalizedProfiles.length || !groupSizes.length) {
      return [];
    }

    return optimizeGroups(normalizedProfiles, groupSizes, options || {}, normalizedMode, random).map(function (group) {
      return group.members;
    });
  }

  const api = {
    generate: generate,
    scoreGroup: scoreGroup,
    getGroupExpertiseMetrics: getGroupExpertiseMetrics
  };

  if (root) {
    root.Unterrichtsassistent = root.Unterrichtsassistent || {};
    root.Unterrichtsassistent.features = root.Unterrichtsassistent.features || {};
    root.Unterrichtsassistent.features.evaluation = root.Unterrichtsassistent.features.evaluation || {};
    root.Unterrichtsassistent.features.evaluation.discussionGroups = api;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof window !== "undefined" ? window : null));
