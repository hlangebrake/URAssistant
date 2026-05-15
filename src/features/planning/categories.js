(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.planning = window.Unterrichtsassistent.features.planning || {};

  function getCollections(snapshot) {
    const source = snapshot && typeof snapshot === "object" ? snapshot : {};

    return {
      categories: Array.isArray(source.planningCategories) ? source.planningCategories : [],
      events: Array.isArray(source.planningEvents) ? source.planningEvents : []
    };
  }

  function getClassDisplayName(schoolClass) {
    return [String(schoolClass && schoolClass.name || "").trim(), String(schoolClass && schoolClass.subject || "").trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  function normalizeFilterLabels(value) {
    const rawEntries = Array.isArray(value)
      ? value
      : String(value || "").split(",");

    return rawEntries.map(function (entry) {
      return String(entry || "").trim();
    }).filter(Boolean).filter(function (entry, index, array) {
      return array.findIndex(function (candidate) {
        return String(candidate || "").trim().toLowerCase() === entry.toLowerCase();
      }) === index;
    });
  }

  function getDefaultNames(snapshot) {
    const classes = snapshot && Array.isArray(snapshot.classes) ? snapshot.classes : [];

    return ["Unterrichtsfrei", "Sonstiges"].concat(classes.map(getClassDisplayName).filter(Boolean));
  }

  function normalizeColor(value) {
    const trimmed = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed : "";
  }

  function getStoredEntry(snapshot, name) {
    const collections = getCollections(snapshot);
    const normalizedName = String(name || "").trim().toLowerCase();

    if (!normalizedName) {
      return null;
    }

    return collections.categories.find(function (entry) {
      return String(entry && entry.name || "").trim().toLowerCase() === normalizedName;
    }) || null;
  }

  function getDefaultDefinition(snapshot, name, options) {
    const classes = snapshot && Array.isArray(snapshot.classes) ? snapshot.classes : [];
    const normalizedName = String(name || "").trim().toLowerCase();
    const getClassColor = options && typeof options.getClassColor === "function"
      ? options.getClassColor
      : null;
    let schoolClass = null;

    if (normalizedName === "unterrichtsfrei") {
      return {
        name: "Unterrichtsfrei",
        color: "#a9cf8f",
        isClassCategory: false,
        isSystemCategory: true
      };
    }

    if (normalizedName === "sonstiges") {
      return {
        name: "Sonstiges",
        color: "#b8bec7",
        isClassCategory: false,
        isSystemCategory: true
      };
    }

    schoolClass = classes.find(function (entry) {
      return getClassDisplayName(entry).toLowerCase() === normalizedName;
    }) || null;

    if (!schoolClass) {
      return null;
    }

    return {
      name: getClassDisplayName(schoolClass),
      color: getClassColor ? getClassColor(schoolClass) : "#d9d4cb",
      isClassCategory: true
    };
  }

  function getColor(snapshot, name, options) {
    const defaultCategory = getDefaultDefinition(snapshot, name, options);
    const storedCategory = getStoredEntry(snapshot, name);
    const storedColor = normalizeColor(storedCategory && storedCategory.color);
    const createPastelColor = options && typeof options.createPastelColor === "function"
      ? options.createPastelColor
      : null;

    if (defaultCategory) {
      return defaultCategory.color;
    }

    if (storedColor) {
      return storedColor;
    }

    if (createPastelColor) {
      return createPastelColor(String(name || "").trim() || "planung");
    }

    return "#d9d4cb";
  }

  function getDefinitions(snapshot, options) {
    const sourceSnapshot = snapshot || {};
    const definitionsByKey = {};
    const collections = getCollections(sourceSnapshot);

    getDefaultNames(sourceSnapshot).forEach(function (name) {
      const trimmedName = String(name || "").trim();
      const normalizedName = trimmedName.toLowerCase();
      const defaultDefinition = getDefaultDefinition(sourceSnapshot, trimmedName, options);
      const storedCategoryEntry = getStoredEntry(sourceSnapshot, trimmedName);

      if (!trimmedName || definitionsByKey[normalizedName]) {
        return;
      }

      definitionsByKey[normalizedName] = {
        name: defaultDefinition && defaultDefinition.name ? defaultDefinition.name : trimmedName,
        color: getColor(sourceSnapshot, trimmedName, options),
        isClassCategory: Boolean(defaultDefinition && defaultDefinition.isClassCategory),
        isSystemCategory: Boolean(defaultDefinition && defaultDefinition.isSystemCategory),
        filterLabels: normalizeFilterLabels(storedCategoryEntry && storedCategoryEntry.filterLabels)
      };
    });

    collections.categories.forEach(function (entry) {
      const trimmedName = String(entry && entry.name || "").trim();
      const normalizedName = trimmedName.toLowerCase();

      if (!trimmedName || definitionsByKey[normalizedName]) {
        return;
      }

      definitionsByKey[normalizedName] = {
        name: trimmedName,
        color: getColor(sourceSnapshot, trimmedName, options),
        isClassCategory: false,
        isSystemCategory: false,
        filterLabels: normalizeFilterLabels(entry && entry.filterLabels)
      };
    });

    collections.events.forEach(function (entry) {
      const trimmedName = String(entry && entry.category || "").trim();
      const normalizedName = trimmedName.toLowerCase();

      if (!trimmedName || definitionsByKey[normalizedName]) {
        return;
      }

      definitionsByKey[normalizedName] = {
        name: trimmedName,
        color: getColor(sourceSnapshot, trimmedName, options),
        isClassCategory: false,
        isSystemCategory: false,
        filterLabels: []
      };
    });

    return Object.keys(definitionsByKey).map(function (key) {
      return definitionsByKey[key];
    }).sort(function (left, right) {
      if (left.isClassCategory !== right.isClassCategory) {
        return left.isClassCategory ? -1 : 1;
      }

      return String(left.name || "").localeCompare(String(right.name || ""), "de", { sensitivity: "base" });
    });
  }

  function getDefaultSidebarFilters(snapshot, options) {
    return getDefinitions(snapshot, options)
      .filter(function (entry) {
        return String(entry && entry.name || "").trim().toLowerCase() !== "unterrichtsfrei";
      })
      .map(function (entry) {
        return String(entry && entry.name || "").trim();
      })
      .filter(Boolean);
  }

  function getDefaultTodoFilters(snapshot, options) {
    return getDefinitions(snapshot, options)
      .map(function (entry) {
        return String(entry && entry.name || "").trim();
      })
      .filter(Boolean);
  }

  window.Unterrichtsassistent.features.planning.categories = {
    normalizeFilterLabels: normalizeFilterLabels,
    getDefaultNames: getDefaultNames,
    normalizeColor: normalizeColor,
    getStoredEntry: getStoredEntry,
    getDefaultDefinition: getDefaultDefinition,
    getColor: getColor,
    getDefinitions: getDefinitions,
    getDefaultSidebarFilters: getDefaultSidebarFilters,
    getDefaultTodoFilters: getDefaultTodoFilters
  };
}());
