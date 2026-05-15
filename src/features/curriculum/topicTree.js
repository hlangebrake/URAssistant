(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.curriculum = window.Unterrichtsassistent.features.curriculum || {};

  const plans = [
    {
      id: "kc-mathematik-sek-1-sek-2",
      label: "KC Mathematik Sek 1/Sek 2",
      url: "src/data/kc-mathematik-sek-1-sek-2.json"
    },
    {
      id: "kc-informatik-sek-2",
      label: "KC Informatik Sek 2",
      url: "src/data/kc-informatik-sek-2.json"
    }
  ];

  const gradeFilters = ["", "5/6", "7/8", "9/10", "Einfuehrungsphase", "Qualifikationsphase eA", "Qualifikationsphase gA"];

  function normalizeTopicNodeIds(nodeIds) {
    const sourceItems = Array.isArray(nodeIds)
      ? nodeIds
      : String(nodeIds || "").split("|");
    const seen = {};

    return sourceItems.map(function (nodeId) {
      return String(nodeId || "").trim();
    }).filter(function (nodeId) {
      if (!nodeId || seen[nodeId]) {
        return false;
      }

      seen[nodeId] = true;
      return true;
    });
  }

  function normalizePlanId(planId) {
    const normalizedPlanId = String(planId || "").trim();
    const matchingPlan = plans.find(function (plan) {
      return String(plan && plan.id || "").trim() === normalizedPlanId;
    }) || plans[0];

    return String(matchingPlan && matchingPlan.id || "").trim();
  }

  function normalizeGradeFilter(filterValue) {
    const normalizedFilter = String(filterValue || "").trim();
    return gradeFilters.indexOf(normalizedFilter) >= 0 ? normalizedFilter : "";
  }

  function getPlanOptions() {
    return plans.map(function (plan) {
      return {
        id: String(plan && plan.id || "").trim(),
        label: String(plan && plan.label || "").trim()
      };
    });
  }

  function getPlanById(planId) {
    const normalizedPlanId = normalizePlanId(planId);
    return plans.find(function (plan) {
      return String(plan && plan.id || "").trim() === normalizedPlanId;
    }) || plans[0];
  }

  window.Unterrichtsassistent.features.curriculum.topicTree = {
    plans: plans,
    gradeFilters: gradeFilters.slice(),
    normalizeTopicNodeIds: normalizeTopicNodeIds,
    normalizePlanId: normalizePlanId,
    normalizeGradeFilter: normalizeGradeFilter,
    getPlanOptions: getPlanOptions,
    getPlanById: getPlanById
  };
}());
