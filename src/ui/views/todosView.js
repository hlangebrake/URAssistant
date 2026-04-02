window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.todos = {
  id: "todos",
  title: "TODOs",
  render: function (service) {
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const todoDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveTodoDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveTodoDraft()
      : null;
    const expandedTodoIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getExpandedTodoIds === "function"
      ? window.UnterrichtsassistentApp.getExpandedTodoIds().map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean)
      : [];
    const todoStatusFilter = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getTodoStatusFilter === "function"
      ? String(window.UnterrichtsassistentApp.getTodoStatusFilter() || "offen").trim().toLowerCase()
      : "offen";
    const todoViewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getTodoViewMode === "function"
      ? String(window.UnterrichtsassistentApp.getTodoViewMode() || "liste").trim().toLowerCase()
      : "liste";
    const todoSortMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getTodoSortMode === "function"
      ? String(window.UnterrichtsassistentApp.getTodoSortMode() || "dringlichkeit").trim().toLowerCase()
      : "dringlichkeit";
    const todoCategoryFilterOpen = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isTodoCategoryFilterOpen === "function"
      ? window.UnterrichtsassistentApp.isTodoCategoryFilterOpen()
      : false;
    const todoCategoryFilters = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getTodoCategoryFilters === "function"
      ? window.UnterrichtsassistentApp.getTodoCategoryFilters().map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean)
      : [];
    const todoCategoryFilterAllOff = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isTodoCategoryFilterAllOff === "function"
      ? window.UnterrichtsassistentApp.isTodoCategoryFilterAllOff()
      : false;
    const todoStudentAssignmentOpen = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isTodoStudentAssignmentOpen === "function"
      ? window.UnterrichtsassistentApp.isTodoStudentAssignmentOpen()
      : false;
    const todos = Array.isArray(snapshot.todos) ? snapshot.todos.slice() : [];
    const categoryDefinitions = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryDefinitions === "function"
      ? window.UnterrichtsassistentApp.getPlanningCategoryDefinitions()
      : [];
    const activeDateTimeParts = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveDateTimeParts === "function"
      ? window.UnterrichtsassistentApp.getActiveDateTimeParts()
      : { date: "", time: "00:00" };

    function escapeValue(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/\\/g, "&#92;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/`/g, "&#96;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r/g, "&#13;")
        .replace(/\n/g, "&#10;");
    }

    function formatDateLabel(dateValue) {
      const normalizedValue = String(dateValue || "").slice(0, 10);
      const parts = normalizedValue.split("-");

      if (parts.length !== 3) {
        return "";
      }

      return [parts[2], parts[1], parts[0]].join(".");
    }

    function getStudentDisplayName(student) {
      return [String(student && student.firstName || "").trim(), String(student && student.lastName || "").trim()]
        .filter(Boolean)
        .join(" ")
        .trim() || "Unbekannt";
    }

    function getStudentFirstNameSortValue(student) {
      return String(student && student.firstName || "").trim().toLowerCase();
    }

    function getStudentLastNameSortValue(student) {
      return String(student && student.lastName || "").trim().toLowerCase();
    }

    function getStudentCompactDisplayName(student, classStudents) {
      const firstName = String(student && student.firstName || "").trim();
      const lastName = String(student && student.lastName || "").trim();
      const normalizedFirstName = firstName.toLowerCase();
      const studentsInClass = Array.isArray(classStudents) ? classStudents : [];
      const hasDuplicateFirstName = Boolean(normalizedFirstName) && studentsInClass.some(function (entry) {
        return entry !== student
          && String(entry && entry.firstName || "").trim().toLowerCase() === normalizedFirstName;
      });

      if (firstName) {
        return hasDuplicateFirstName && lastName
          ? firstName + " " + lastName.charAt(0).toUpperCase() + "."
          : firstName;
      }

      return lastName || "Unbekannt";
    }

    function getTodoCategoryClassInfo(categoryValue) {
      const normalizedCategory = String(categoryValue || "").trim().toLowerCase();
      const classEntry = (Array.isArray(snapshot.classes) ? snapshot.classes : []).find(function (entry) {
        return [String(entry && entry.name || "").trim(), String(entry && entry.subject || "").trim()]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toLowerCase() === normalizedCategory;
      }) || null;
      const studentIds = classEntry && Array.isArray(classEntry.studentIds) ? classEntry.studentIds : [];
        const students = studentIds.map(function (studentId) {
          return (Array.isArray(snapshot.students) ? snapshot.students : []).find(function (student) {
            return String(student && student.id || "").trim() === String(studentId || "").trim();
          }) || null;
        }).filter(Boolean).sort(function (left, right) {
          const firstNameComparison = getStudentFirstNameSortValue(left).localeCompare(getStudentFirstNameSortValue(right), "de", { sensitivity: "base" });

          if (firstNameComparison !== 0) {
            return firstNameComparison;
          }

          return getStudentLastNameSortValue(left).localeCompare(getStudentLastNameSortValue(right), "de", { sensitivity: "base" });
        });

      return {
        isClassCategory: Boolean(classEntry),
        students: students
      };
    }

    function getPriorityRank(priorityValue) {
      const normalizedValue = String(priorityValue || "").trim().toLowerCase();

      if (normalizedValue === "hoch") {
        return 0;
      }

      if (normalizedValue === "standard") {
        return 1;
      }

      return 2;
    }

    function getDeadlineSortValue(todoItem) {
      return String(todoItem && todoItem.dueDate || "").slice(0, 10);
    }

    function getReferenceDateValue() {
      return String(activeDateTimeParts && activeDateTimeParts.date || "").slice(0, 10);
    }

    function getDaysUntilDeadline(todoItem) {
      const deadlineValue = getDeadlineSortValue(todoItem);
      const referenceValue = getReferenceDateValue();
      const deadlineDate = deadlineValue ? new Date(deadlineValue + "T00:00:00") : null;
      const referenceDate = referenceValue ? new Date(referenceValue + "T00:00:00") : null;

      if (!deadlineDate || Number.isNaN(deadlineDate.getTime()) || !referenceDate || Number.isNaN(referenceDate.getTime())) {
        return null;
      }

      return Math.round((deadlineDate.getTime() - referenceDate.getTime()) / 86400000);
    }

    function getUrgencyScore(todoItem) {
      const daysUntilDeadline = getDaysUntilDeadline(todoItem);
      const priorityRank = getPriorityRank(todoItem && todoItem.priority);
      const priorityWeight = [28, 18, 10][priorityRank] || 10;

      if (daysUntilDeadline === null) {
        return priorityWeight;
      }

      if (daysUntilDeadline <= 1) {
        return 220 + priorityWeight + Math.max(0, 1 - daysUntilDeadline) * 12;
      }

      return priorityWeight + (140 / (daysUntilDeadline + 1));
    }

    function isEspeciallyUrgent(todoItem) {
      const daysUntilDeadline = getDaysUntilDeadline(todoItem);
      const priorityValue = String(todoItem && todoItem.priority || "niedrig").trim().toLowerCase();

      if (Boolean(todoItem && todoItem.done) || daysUntilDeadline === null) {
        return false;
      }

      if (priorityValue === "hoch") {
        return daysUntilDeadline <= 4;
      }

      if (priorityValue === "standard") {
        return daysUntilDeadline <= 2;
      }

      return daysUntilDeadline <= 1;
    }

    function compareTodoTitles(leftItem, rightItem) {
      return String(leftItem && leftItem.title || "").localeCompare(String(rightItem && rightItem.title || ""), "de", { sensitivity: "base" });
    }

    function compareByDeadlineThenPriority(leftItem, rightItem) {
      const leftDeadline = getDeadlineSortValue(leftItem);
      const rightDeadline = getDeadlineSortValue(rightItem);
      const priorityDifference = getPriorityRank(leftItem && leftItem.priority) - getPriorityRank(rightItem && rightItem.priority);

      if (leftDeadline && rightDeadline && leftDeadline !== rightDeadline) {
        return leftDeadline.localeCompare(rightDeadline, "de");
      }

      if (leftDeadline && !rightDeadline) {
        return -1;
      }

      if (!leftDeadline && rightDeadline) {
        return 1;
      }

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return compareTodoTitles(leftItem, rightItem);
    }

    function compareByPriorityThenDeadline(leftItem, rightItem) {
      const priorityDifference = getPriorityRank(leftItem && leftItem.priority) - getPriorityRank(rightItem && rightItem.priority);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return compareByDeadlineThenPriority(leftItem, rightItem);
    }

    function compareByUrgency(leftItem, rightItem) {
      const urgencyDifference = getUrgencyScore(rightItem) - getUrgencyScore(leftItem);

      if (Math.abs(urgencyDifference) > 0.0001) {
        return urgencyDifference;
      }

      return compareByDeadlineThenPriority(leftItem, rightItem);
    }

    function sortTodoItems(items) {
      return items.slice().sort(function (leftItem, rightItem) {
        const doneDifference = (Boolean(leftItem && leftItem.done) ? 1 : 0) - (Boolean(rightItem && rightItem.done) ? 1 : 0);

        if (doneDifference !== 0) {
          return doneDifference;
        }

        if (todoSortMode === "deadline") {
          return compareByDeadlineThenPriority(leftItem, rightItem);
        }

        if (todoSortMode === "prioritaet") {
          return compareByPriorityThenDeadline(leftItem, rightItem);
        }

        return compareByUrgency(leftItem, rightItem);
      });
    }

    function getHighestOpenUrgencyScore(items) {
      const openItems = (items || []).filter(function (todoItem) {
        return !Boolean(todoItem && todoItem.done);
      });

      if (!openItems.length) {
        return -Infinity;
      }

      return Math.max.apply(null, openItems.map(function (todoItem) {
        return getUrgencyScore(todoItem);
      }));
    }

    function buildTodoMeta(todoItem) {
      const categoryLabel = String(todoItem && todoItem.category || "").trim();
      const deadlineLabel = formatDateLabel(todoItem && todoItem.dueDate);
      const priorityLabel = String(todoItem && todoItem.priority || "niedrig").trim().toLowerCase();
      const metaParts = [];

      if (categoryLabel) {
        metaParts.push("Kategorie: " + categoryLabel);
      }

      if (deadlineLabel) {
        metaParts.push("Deadline: " + deadlineLabel);
      }

      if (priorityLabel && priorityLabel !== "niedrig") {
        metaParts.push("Prioritaet: " + priorityLabel);
      }

      if (Boolean(todoItem && todoItem.done)) {
        metaParts.push("Status: erledigt");
      }

      return metaParts;
    }

    function doesTodoMatchFilters(todoItem) {
      const categoryName = String(todoItem && todoItem.category || "Sonstiges").trim() || "Sonstiges";
      const normalizedCategory = categoryName.toLowerCase();
      const normalizedSelectedCategories = todoCategoryFilters.map(function (entry) {
        return String(entry || "").trim().toLowerCase();
      });

      if (todoStatusFilter === "offen" && Boolean(todoItem && todoItem.done)) {
        return false;
      }

      if (todoStatusFilter === "erledigt" && !Boolean(todoItem && todoItem.done)) {
        return false;
      }

      if (!normalizedSelectedCategories.length && !todoCategoryFilterAllOff) {
        return true;
      }

      return normalizedSelectedCategories.indexOf(normalizedCategory) >= 0;
    }

    function buildFilterBar() {
      const availableCategories = categoryDefinitions.map(function (entry) {
        return {
          name: String(entry && entry.name || "").trim(),
          isClassCategory: Boolean(entry && entry.isClassCategory),
          color: String(entry && entry.color || "").trim()
        };
      }).filter(function (entry) {
        return Boolean(entry.name);
      });
      const normalizedSelectedCategories = todoCategoryFilters.map(function (entry) {
        return String(entry || "").trim().toLowerCase();
      });
      const classCategories = availableCategories.filter(function (entry) {
        return entry.isClassCategory;
      }).map(function (entry) {
        return entry.name;
      });
      const normalizedClassCategories = classCategories.map(function (entry) {
        return String(entry || "").trim().toLowerCase();
      });
      const isClassSelection = !todoCategoryFilterAllOff
        && normalizedSelectedCategories.length > 0
        && normalizedSelectedCategories.length === normalizedClassCategories.length
        && normalizedSelectedCategories.every(function (entry) {
          return normalizedClassCategories.indexOf(entry) >= 0;
        });
      const selectedCategoryLabel = todoCategoryFilterAllOff
        ? "Keine"
        : (!todoCategoryFilters.length
          ? "Alle"
          : (isClassSelection
            ? "Lerngruppen"
            : todoCategoryFilters.join(", ")));
      const compactSelectedCategoryLabel = selectedCategoryLabel.length > 40
        ? selectedCategoryLabel.slice(0, 37).trim() + "..."
        : selectedCategoryLabel;

      return [
        '<div class="todos-view__filters">',
        '<label class="import-modal__field todos-view__setting-field">',
        '<span>Status</span>',
        '<select onchange="return window.UnterrichtsassistentApp.setTodoStatusFilter(this.value)">',
        '<option value="alle"', todoStatusFilter === "alle" ? ' selected' : '', '>Alle</option>',
        '<option value="offen"', todoStatusFilter === "offen" ? ' selected' : '', '>Offen</option>',
        '<option value="erledigt"', todoStatusFilter === "erledigt" ? ' selected' : '', '>Erledigt</option>',
        '</select>',
        '</label>',
        '<div class="planning-sidebar__filters todos-view__category-filters">',
        '<span class="todos-view__setting-title">Filter</span>',
        '<button class="planning-sidebar__filter-toggle', todoCategoryFilterOpen ? ' is-open' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.toggleTodoCategoryFilterOpen()">',
        '<span>', escapeValue(compactSelectedCategoryLabel), '</span>',
        '</button>',
        '</div>',
        '<label class="import-modal__field todos-view__setting-field">',
        '<span>Ansicht</span>',
        '<select onchange="return window.UnterrichtsassistentApp.setTodoViewMode(this.value)">',
        '<option value="liste"', todoViewMode === "liste" ? ' selected' : '', '>Liste</option>',
        '<option value="prioritaet"', todoViewMode === "prioritaet" ? ' selected' : '', '>nach Prioritaet</option>',
        '<option value="kategorie"', todoViewMode === "kategorie" ? ' selected' : '', '>nach Kategorie</option>',
        '</select>',
        '</label>',
        '<label class="import-modal__field todos-view__setting-field">',
        '<span>Sortierung</span>',
        '<select onchange="return window.UnterrichtsassistentApp.setTodoSortMode(this.value)">',
        '<option value="dringlichkeit"', todoSortMode === "dringlichkeit" ? ' selected' : '', '>Dringlichkeit</option>',
        '<option value="prioritaet"', todoSortMode === "prioritaet" ? ' selected' : '', '>Prioritaet</option>',
        '<option value="deadline"', todoSortMode === "deadline" ? ' selected' : '', '>Deadline</option>',
        '</select>',
        '</label>',
        '</div>',
        todoCategoryFilterOpen ? [
          '<div class="planning-sidebar__filter-menu todos-view__filter-menu">',
          '<div class="planning-sidebar__filter-actions todos-view__filter-actions">',
          '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.selectAllTodoCategoryFilters()">Alle</button>',
          '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.clearAllTodoCategoryFilters()">Keine</button>',
          '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.selectTodoClassCategoryFilters()">Lerngruppen</button>',
          '</div>',
          availableCategories.length ? availableCategories.map(function (entry) {
            const isSelected = !todoCategoryFilterAllOff
              && (!todoCategoryFilters.length || normalizedSelectedCategories.indexOf(entry.name.toLowerCase()) >= 0);
            const optionStyle = entry.color
              ? ' style="--todo-category-color:' + escapeValue(entry.color) + ';"'
              : "";
            return [
              '<label class="planning-sidebar__filter-option todos-view__filter-option', entry.isClassCategory ? ' todos-view__filter-option--class' : '', '"', optionStyle, '>',
              '<input type="checkbox" ', isSelected ? 'checked ' : '', 'onchange="return window.UnterrichtsassistentApp.toggleTodoCategoryFilter(\'', escapeValue(entry.name), '\')">',
              '<span class="todos-view__filter-option-label">',
              '<span class="todos-view__filter-color" aria-hidden="true"></span>',
              '<span>', escapeValue(entry.name), '</span>',
              '</span>',
              '</label>'
            ].join("");
          }).join("") : '<p class="empty-message">Keine Kategorien vorhanden.</p>',
          '</div>'
        ].join("") : ''
      ].join("");
    }

    function buildSectionHeader(title, count, options) {
      const sectionOptions = options && typeof options === "object" ? options : {};
      const presetCategory = String(sectionOptions.category || "").trim();
      const presetPriority = String(sectionOptions.priority || "").trim().toLowerCase();
      const openTodoModalArguments = [
        "''",
        "'" + escapeValue(presetCategory) + "'",
        "'" + escapeValue(presetPriority) + "'"
      ].join(", ");

      return [
        '<header class="todos-view__section-header">',
        '<h3>', escapeValue(title), '</h3>',
        '<div class="todos-view__section-header-meta">',
        '<span>', escapeValue(String(count)), '</span>',
        '<button class="todos-view__add-button todos-view__add-button--header" type="button" aria-label="TODO hinzufuegen" onclick="return window.UnterrichtsassistentApp.openTodoModal(', openTodoModalArguments, ')">+</button>',
        '</div>',
        '</header>'
      ].join("");
    }

    function getTodoScrollKey(prefix, value) {
      return String(prefix || "").trim() + ":" + String(value || "").trim().toLowerCase();
    }

    function buildAddRow() {
      return [
        '<div class="todos-view__row todos-view__row--add" role="button" tabindex="0" onclick="return window.UnterrichtsassistentApp.openTodoModal(\'\')" onkeydown="if (event.key === \'Enter\' || event.key === \' \') { event.preventDefault(); return window.UnterrichtsassistentApp.openTodoModal(\'\'); }">',
        '<div class="todos-view__content">',
        '<div class="todos-view__header"><span class="todos-view__title todos-view__title--placeholder">Neues TODO</span></div>',
        '</div>',
        '<div class="todos-view__actions">',
        '<button class="todos-view__add-button" type="button" aria-label="TODO hinzufuegen" onclick="event.stopPropagation(); return window.UnterrichtsassistentApp.openTodoModal(\'\')">+</button>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildTodoRow(todoItem) {
      function getAssignedStudentEntries(todoEntry) {
        const classInfo = getTodoCategoryClassInfo(todoEntry && todoEntry.category);
        const classStudents = classInfo.students || [];
        const assignedIds = Array.isArray(todoEntry && todoEntry.assignedStudentIds)
          ? todoEntry.assignedStudentIds.map(function (studentId) {
              return String(studentId || "").trim();
            }).filter(Boolean)
          : [];
        const statusEntries = Array.isArray(todoEntry && todoEntry.assignedStudentStatuses)
          ? todoEntry.assignedStudentStatuses
          : [];

        return assignedIds.map(function (studentId) {
          const student = (Array.isArray(snapshot.students) ? snapshot.students : []).find(function (entry) {
            return String(entry && entry.id || "").trim() === studentId;
          }) || null;
          const statusEntry = statusEntries.find(function (entry) {
            return String(entry && entry.studentId || "").trim() === studentId;
          }) || null;

            return student ? {
              id: studentId,
              label: getStudentCompactDisplayName(student, classStudents),
              sortFirstName: getStudentFirstNameSortValue(student),
              sortLastName: getStudentLastNameSortValue(student),
              done: Boolean(statusEntry && statusEntry.done)
            } : null;
          }).filter(Boolean).sort(function (left, right) {
            const firstNameComparison = String(left && left.sortFirstName || "").localeCompare(String(right && right.sortFirstName || ""), "de", { sensitivity: "base" });

            if (firstNameComparison !== 0) {
              return firstNameComparison;
            }

            return String(left && left.sortLastName || "").localeCompare(String(right && right.sortLastName || ""), "de", { sensitivity: "base" });
          });
        }

      function getDerivedAssignedStudentsDone(todoEntry) {
        const assignedStudents = getAssignedStudentEntries(todoEntry);

        return assignedStudents.length > 0 && assignedStudents.every(function (entry) {
          return Boolean(entry && entry.done);
        });
      }

      function buildAssignedStudentsSection(todoEntry) {
        const assignedStudents = getAssignedStudentEntries(todoEntry);
        const normalizedTodoId = String(todoEntry && todoEntry.id || "").trim();

        if (String(todoEntry && todoEntry.type || "").trim().toLowerCase() !== "standard" || !assignedStudents.length) {
          return "";
        }

        return [
          '<div class="todos-view__assigned-students">',
          '<div class="todos-view__assigned-students-title">Zuordnung</div>',
          '<div class="todos-view__assigned-students-list">',
          assignedStudents.map(function (entry) {
            return [
              '<label class="todos-view__assigned-student">',
              '<span class="todos-view__checkbox todos-view__checkbox--compact" aria-label="Schueler-Status umschalten"><input type="checkbox"', entry.done ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.toggleTodoAssignedStudentDone(\'', escapeValue(normalizedTodoId), '\', \'', escapeValue(entry.id), '\', this.checked)"><span></span></span>',
              '<span class="todos-view__assigned-student-text', entry.done ? ' is-done' : '', '">', escapeValue(entry.label), '</span>',
              '</label>'
            ].join("");
          }).join(""),
          '</div>',
          '</div>'
        ].join("");
      }

      function getChecklistChildItems(items, parentId) {
        return (items || []).filter(function (entry) {
          return String(entry && entry.parentId || "").trim() === String(parentId || "").trim();
        });
      }

      function getChecklistNodeById(items, nodeId) {
        const normalizedNodeId = String(nodeId || "").trim();

        if (!normalizedNodeId) {
          return null;
        }

        return (items || []).reduce(function (foundEntry, entry) {
          if (foundEntry) {
            return foundEntry;
          }

          if (String(entry && entry.id || "").trim() === normalizedNodeId) {
            return {
              kind: "item",
              entry: entry,
              ownerItem: entry
            };
          }

          if (Array.isArray(entry && entry.followUpSteps)) {
            const foundStep = entry.followUpSteps.find(function (step) {
              return String(step && step.id || "").trim() === normalizedNodeId;
            }) || null;

            if (foundStep) {
              return {
                kind: "step",
                entry: foundStep,
                ownerItem: entry
              };
            }
          }

          return null;
        }, null);
      }

      function getChecklistFollowUpSteps(items, itemId) {
        const selectedNode = getChecklistNodeById(items, itemId);

        if (!selectedNode || selectedNode.kind !== "item" || !Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)) {
          return [];
        }

        return selectedNode.entry.followUpSteps;
      }

      function getDerivedChecklistItemDone(items, itemId) {
        const selectedNode = getChecklistNodeById(items, itemId);
        const childItems = getChecklistChildItems(items, itemId);

        if (!selectedNode) {
          return false;
        }

        if (childItems.length > 0) {
          return childItems.every(function (childItem) {
            return getAggregatedChecklistItemDone(items, childItem && childItem.id);
          });
        }

        return Boolean(selectedNode.entry.done);
      }

      function getAggregatedChecklistItemDone(items, itemId) {
        const selectedNode = getChecklistNodeById(items, itemId);
        const followUpSteps = selectedNode && selectedNode.kind === "item"
          ? getChecklistFollowUpSteps(items, itemId)
          : [];

        if (!selectedNode) {
          return false;
        }

        return getDerivedChecklistItemDone(items, itemId) && followUpSteps.every(function (step) {
          return getAggregatedChecklistItemDone(items, step && step.id);
        });
      }

      function getChecklistNodeSelfDone(items, itemId) {
        const selectedNode = getChecklistNodeById(items, itemId);

        return Boolean(selectedNode && selectedNode.entry && selectedNode.entry.done);
      }

      function isChecklistNodeReadyForFollowUp(items, nodeId) {
        return isChecklistItemManuallyToggleable(items, nodeId)
          ? getChecklistNodeSelfDone(items, nodeId)
          : getDerivedChecklistItemDone(items, nodeId);
      }

      function getDerivedChecklistTodoDone(items) {
        const topLevelItems = getChecklistChildItems(items, "");

        return topLevelItems.length > 0 && topLevelItems.every(function (item) {
          return getAggregatedChecklistItemDone(items, item && item.id);
        });
      }

      function isChecklistItemManuallyToggleable(items, itemId) {
        const selectedNode = getChecklistNodeById(items, itemId);
        const childItems = getChecklistChildItems(items, itemId);

        return Boolean(selectedNode) && childItems.length === 0;
      }

      function isChecklistNodeUnlocked(items, nodeId) {
        const selectedNode = getChecklistNodeById(items, nodeId);
        const previousNodeId = selectedNode && selectedNode.kind === "step"
          ? String(selectedNode.entry.previousStepId || selectedNode.ownerItem && selectedNode.ownerItem.id || "").trim()
          : "";
        const parentNodeId = selectedNode && selectedNode.kind === "item"
          ? String(selectedNode.entry && selectedNode.entry.parentId || "").trim()
          : "";

        if (!selectedNode) {
          return false;
        }

        if (selectedNode.kind === "step") {
          return previousNodeId ? isChecklistNodeReadyForFollowUp(items, previousNodeId) : true;
        }

        if (parentNodeId) {
          return isChecklistNodeUnlocked(items, parentNodeId);
        }

        return true;
      }

      function buildChecklistTree(items, parentId, depth, studentId) {
        return getChecklistChildItems(items, parentId).map(function (entry) {
          const itemId = String(entry && entry.id || "").trim();
          const itemTitle = String(entry && entry.title || "").trim();
          const followUpSteps = getChecklistFollowUpSteps(items, itemId);
          const isItemToggleable = isChecklistItemManuallyToggleable(items, itemId);
          const isItemDone = isItemToggleable
            ? getChecklistNodeSelfDone(items, itemId)
            : getDerivedChecklistItemDone(items, itemId);
          const isItemUnlocked = isChecklistNodeUnlocked(items, itemId);
          const hasFollowUpSequence = followUpSteps.length > 0;
          const childItemsMarkup = buildChecklistTree(items, itemId, depth + 1, studentId);
          const followUpMarkup = followUpSteps.map(function (step, index) {
            const stepObject = step && typeof step === "object"
              ? step
              : { id: "", title: String(step || "").trim(), done: false, previousStepId: "" };
            const stepId = String(stepObject.id || "").trim();
            const stepTitle = String(stepObject.title || "").trim();
            const stepToggleable = isChecklistItemManuallyToggleable(items, stepId);
            const stepDone = stepToggleable
              ? getChecklistNodeSelfDone(items, stepId)
              : getDerivedChecklistItemDone(items, stepId);
            const stepUnlocked = isChecklistNodeUnlocked(items, stepId);
            const stepChildMarkup = buildChecklistTree(items, stepId, depth + 1, studentId);

            if (!stepTitle) {
              return "";
            }

            return [
              '<div class="todos-view__checklist-group">',
              '<label class="todos-view__checklist-entry todos-view__checklist-entry--follow-up', stepUnlocked ? '' : ' is-locked', '" style="--todo-checklist-depth:', escapeValue(String(depth)), ';">',
              '<span class="todos-view__checkbox todos-view__checkbox--compact todos-view__checkbox--sequence', stepToggleable && stepUnlocked ? '' : ' is-readonly', '" aria-label="Folgeschritt-Status umschalten"><input type="checkbox"', stepDone ? ' checked' : '', stepToggleable && stepUnlocked ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.toggleTodoChecklistFollowUpDone(\'', escapeValue(normalizedTodoId), '\', \'', escapeValue(itemId), '\', ', escapeValue(String(index)), ', this.checked, \'', escapeValue(studentId || ""), '\')"><span>', escapeValue(String(index + 2)), '</span></span>',
              '<span class="todos-view__checklist-text', stepDone ? ' is-done' : '', '">', escapeValue(stepTitle), '</span>',
              '</label>',
              stepChildMarkup,
              '</div>'
            ].join("");
          }).join("");

          if (!itemTitle) {
            return "";
          }

          return [
            '<div class="todos-view__checklist-group">',
            '<label class="todos-view__checklist-entry', isItemUnlocked ? '' : ' is-locked', '" style="--todo-checklist-depth:', escapeValue(String(depth)), ';">',
            '<span class="todos-view__checkbox todos-view__checkbox--compact', hasFollowUpSequence ? ' todos-view__checkbox--sequence' : '', isItemToggleable && isItemUnlocked ? '' : ' is-readonly', '" aria-label="Listenpunkt-Status umschalten"><input type="checkbox"', isItemDone ? ' checked' : '', isItemToggleable && isItemUnlocked ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.toggleTodoChecklistItemDone(\'', escapeValue(normalizedTodoId), '\', \'', escapeValue(itemId), '\', this.checked, \'', escapeValue(studentId || ""), '\')"><span>', hasFollowUpSequence ? '1' : '', '</span></span>',
            '<span class="todos-view__checklist-text', isItemDone ? ' is-done' : '', '">', escapeValue(itemTitle), '</span>',
            '</label>',
            childItemsMarkup,
            followUpMarkup,
            '</div>'
          ].join("");
        }).join("");
      }

      function buildChecklistSection(todoEntry, options) {
        const config = options && typeof options === "object" ? options : {};
        const checklistItems = Array.isArray(config.checklistItems)
          ? config.checklistItems
          : (Array.isArray(todoEntry && todoEntry.checklistItems) ? todoEntry.checklistItems : []);
        const normalizedStudentId = String(config.studentId || "").trim();
        const checklistMarkup = buildChecklistTree(checklistItems, "", 0, normalizedStudentId);

        if (String(todoEntry && todoEntry.type || "").trim().toLowerCase() !== "checkliste" || !checklistMarkup) {
          return "";
        }

        return [
          '<div class="todos-view__checklist">',
          config.hideTitle ? '' : '<div class="todos-view__checklist-title">Checkliste</div>',
          '<div class="todos-view__checklist-tree">',
          checklistMarkup,
          '</div>',
          '</div>'
        ].join("");
      }

      function buildAssignedStudentChecklistSections(todoEntry) {
        const assignedStudents = getAssignedStudentEntries(todoEntry);
        const statusEntries = Array.isArray(todoEntry && todoEntry.assignedStudentStatuses)
          ? todoEntry.assignedStudentStatuses
          : [];

        if (String(todoEntry && todoEntry.type || "").trim().toLowerCase() !== "checkliste" || !assignedStudents.length) {
          return "";
        }

        return [
          '<div class="todos-view__assigned-checklists">',
          assignedStudents.map(function (entry) {
            const statusEntry = statusEntries.find(function (statusItem) {
              return String(statusItem && statusItem.studentId || "").trim() === String(entry && entry.id || "").trim();
            }) || null;
            const checklistMarkup = buildChecklistSection(todoEntry, {
              studentId: entry.id,
              checklistItems: statusEntry && Array.isArray(statusEntry.checklistItems) ? statusEntry.checklistItems : [],
              hideTitle: true
            });

            return [
              '<div class="todos-view__assigned-checklist">',
              '<div class="todos-view__assigned-checklist-header">',
              '<span class="todos-view__checkbox todos-view__checkbox--compact is-readonly"><input type="checkbox"', entry.done ? ' checked' : '', ' disabled><span></span></span>',
              '<span class="todos-view__assigned-checklist-name', entry.done ? ' is-done' : '', '">', escapeValue(entry.label), '</span>',
              '</div>',
              checklistMarkup,
              '</div>'
            ].join("");
          }).join(""),
          '</div>'
        ].join("");
      }

      const title = String(todoItem && todoItem.title || "").trim() || "Ohne Titel";
      const normalizedTodoId = String(todoItem && todoItem.id || "").trim();
      const description = String(todoItem && todoItem.description || "").trim();
      const categoryLabel = String(todoItem && todoItem.category || "").trim();
      const metaParts = buildTodoMeta(todoItem);
      const checklistItems = Array.isArray(todoItem && todoItem.checklistItems) ? todoItem.checklistItems : [];
      const assignedStudentsSectionMarkup = buildAssignedStudentsSection(todoItem);
      const assignedStudentChecklistMarkup = buildAssignedStudentChecklistSections(todoItem);
      const hasAssignedStudents = String(todoItem && todoItem.type || "").trim().toLowerCase() === "standard"
        && Array.isArray(todoItem && todoItem.assignedStudentIds)
        && todoItem.assignedStudentIds.length > 0;
      const hasAssignedStudentChecklists = String(todoItem && todoItem.type || "").trim().toLowerCase() === "checkliste"
        && Array.isArray(todoItem && todoItem.assignedStudentIds)
        && todoItem.assignedStudentIds.length > 0;
      const hasAssignedTodoState = hasAssignedStudents || hasAssignedStudentChecklists;
      const isEspeciallyUrgentTodo = isEspeciallyUrgent(todoItem);
      const isChecklistTodo = String(todoItem && todoItem.type || "").trim().toLowerCase() === "checkliste";
      const isDone = hasAssignedTodoState
        ? getDerivedAssignedStudentsDone(todoItem)
        : (isChecklistTodo ? getDerivedChecklistTodoDone(checklistItems) : Boolean(todoItem && todoItem.done));
      const isExpanded = expandedTodoIds.indexOf(normalizedTodoId) >= 0;
      const categoryColor = categoryLabel && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryColor === "function"
        ? String(window.UnterrichtsassistentApp.getPlanningCategoryColor(categoryLabel) || "").trim()
        : "";
      const checklistSectionMarkup = hasAssignedStudentChecklists ? "" : buildChecklistSection(todoItem);
      const rowStyle = categoryColor
        ? ' style="--todo-category-color:' + escapeValue(categoryColor) + ';"'
        : "";

      return [
        '<div class="todos-view__row', isDone ? ' is-done' : '', isExpanded ? ' is-expanded' : '', isEspeciallyUrgentTodo ? ' is-especially-urgent' : '', '"', rowStyle, '>',
        '<div class="todos-view__content">',
        '<div class="todos-view__header">',
        '<label class="todos-view__checkbox', (isChecklistTodo || hasAssignedTodoState) ? ' is-readonly' : '', '" aria-label="TODO-Status umschalten"><input type="checkbox"', isDone ? ' checked' : '', (isChecklistTodo || hasAssignedTodoState) ? ' disabled' : '', ' onchange="return window.UnterrichtsassistentApp.toggleTodoDone(\'', escapeValue(normalizedTodoId), '\', this.checked)"><span></span></label>',
        '<button class="todos-view__summary" type="button" aria-expanded="', isExpanded ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.toggleTodoExpanded(\'', escapeValue(normalizedTodoId), '\')">',
        '<span class="todos-view__title-wrap">',
        categoryColor ? '<span class="todos-view__category-marker" aria-hidden="true"></span>' : '',
        '<span class="todos-view__title">', escapeValue(title), '</span>',
        isEspeciallyUrgentTodo ? '<span class="todos-view__urgency-badge">Dringend</span>' : '',
        '</span>',
        '<span class="todos-view__indicator" aria-hidden="true">', isExpanded ? '&#9662;' : '&#9656;', '</span>',
        '</button>',
        '</div>',
        isExpanded ? [
          '<div class="todos-view__details">',
          metaParts.length ? '<div class="todos-view__meta">' + escapeValue(metaParts.join(" | ")) + '</div>' : '',
          description ? '<div class="todos-view__description">' + escapeValue(description).replace(/&#10;/g, "<br>") + '</div>' : '',
          assignedStudentsSectionMarkup,
          assignedStudentChecklistMarkup,
          checklistSectionMarkup,
          (!metaParts.length && !description && !assignedStudentsSectionMarkup && !assignedStudentChecklistMarkup && !checklistSectionMarkup) ? '<div class="todos-view__meta">Keine weiteren Informationen hinterlegt.</div>' : '',
          '<div class="todos-view__actions todos-view__actions--details">',
          '<button class="planning-sidebar__edit" type="button" aria-label="TODO bearbeiten" onclick="return window.UnterrichtsassistentApp.openTodoModal(\'', escapeValue(String(todoItem && todoItem.id || "")), '\')">&#9998;</button>',
          '<button class="planning-sidebar__delete" type="button" aria-label="TODO loeschen" onclick="return window.UnterrichtsassistentApp.deleteTodo(\'', escapeValue(String(todoItem && todoItem.id || "")), '\')">&#10005;</button>',
          '</div>',
          '</div>'
        ].join("") : '',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildPrioritySections(items) {
      const groups = [
        { key: "hoch", title: "Hoch" },
        { key: "standard", title: "Standard" },
        { key: "niedrig", title: "Niedrig" }
      ].map(function (group) {
        return Object.assign({}, group, {
          items: sortTodoItems(items.filter(function (todoItem) {
            return String(todoItem && todoItem.priority || "niedrig").trim().toLowerCase() === group.key;
          }))
        });
      }).filter(function (group) {
        return group.items.length > 0;
      });

      if (!groups.length) {
        return '<p class="empty-message todos-view__empty">Keine TODOs passend zu den aktuellen Filtern.</p>';
      }

      return [
        groups.map(function (group) {
          const isScrollable = group.items.length > 5;
          return [
            '<section class="todos-view__section-panel todos-view__section">',
            buildSectionHeader(group.title, group.items.length, { priority: group.key }),
            '<div class="todos-view__section-body todos-view__section-body--scroll', isScrollable ? ' is-scrollable' : '', '" data-todo-scroll-key="', escapeValue(getTodoScrollKey("prioritaet", group.key)), '">',
            group.items.map(buildTodoRow).join(""),
            '</div>',
            isScrollable ? '<div class="todos-view__scroll-indicator">Weitere TODOs per Scrollen</div>' : '',
            '</section>'
          ].join("");
        }).join(""),
      ].join("");
    }

    function getCategorySectionSizeUnits(group) {
      const visibleTodoCount = Math.min(Array.isArray(group && group.items) ? group.items.length : 0, 5);

      return visibleTodoCount + 2;
    }

    function getCategoryColumnSizeLimit() {
      return 14;
    }

    function getCategoryColumnCount() {
      const viewportWidth = typeof window !== "undefined" && window && typeof window.innerWidth === "number"
        ? window.innerWidth
        : 1440;
      const estimatedAvailableWidth = Math.max(320, viewportWidth - 260);

      return Math.max(1, Math.floor((estimatedAvailableWidth + 16) / 276));
    }

    function buildCategorySections(items) {
      const groups = {};
      const categoryOrder = [];

      items.forEach(function (todoItem) {
        const categoryName = String(todoItem && todoItem.category || "Sonstiges").trim() || "Sonstiges";
        const normalizedCategory = categoryName.toLowerCase();

        if (!Object.prototype.hasOwnProperty.call(groups, normalizedCategory)) {
          groups[normalizedCategory] = {
            name: categoryName,
            color: window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryColor === "function"
              ? String(window.UnterrichtsassistentApp.getPlanningCategoryColor(categoryName) || "").trim()
              : "",
            items: []
          };
          categoryOrder.push(normalizedCategory);
        }

        groups[normalizedCategory].items.push(todoItem);
      });

      if (!categoryOrder.length) {
        return '<p class="empty-message todos-view__empty">Keine TODOs passend zu den aktuellen Filtern.</p>';
      }

      categoryOrder.sort(function (leftKey, rightKey) {
        const leftGroup = groups[leftKey] || { items: [], name: "" };
        const rightGroup = groups[rightKey] || { items: [], name: "" };
        const leftTopScore = getHighestOpenUrgencyScore(leftGroup.items);
        const rightTopScore = getHighestOpenUrgencyScore(rightGroup.items);

        if (rightTopScore !== leftTopScore) {
          return rightTopScore - leftTopScore;
        }

        return String(leftGroup.name || "").localeCompare(String(rightGroup.name || ""), "de", { sensitivity: "base" });
      });

      const orderedGroups = categoryOrder.map(function (groupKey) {
        const group = groups[groupKey];

        return {
          name: group.name,
          color: group.color,
          items: sortTodoItems(group.items),
          sizeUnits: getCategorySectionSizeUnits(group)
        };
      });
      const rows = [];
      const columnSizeLimit = getCategoryColumnSizeLimit();
      const maxColumns = getCategoryColumnCount();
      const preferredTopRowColumns = Math.max(1, Math.min(3, maxColumns, orderedGroups.length));
      const topRow = {
        columns: []
      };

      orderedGroups.slice(0, preferredTopRowColumns).forEach(function (group) {
        topRow.columns.push({
          sizeUnits: group.sizeUnits,
          groups: [group]
        });
      });

      rows.push(topRow);

      orderedGroups.slice(preferredTopRowColumns).forEach(function (group) {
        const currentRow = rows.length ? rows[rows.length - 1] : null;
        let targetColumn = null;
        let targetRow = currentRow;

        if (currentRow) {
          currentRow.columns.forEach(function (column) {
            if ((column.sizeUnits + group.sizeUnits) > columnSizeLimit) {
              return;
            }

            if (!targetColumn || column.sizeUnits < targetColumn.sizeUnits) {
              targetColumn = column;
            }
          });
        }

        if (!targetColumn) {
          if (currentRow && currentRow.columns.length < maxColumns) {
            targetRow = currentRow;
          } else {
            targetRow = {
              columns: []
            };
            rows.push(targetRow);
          }

          targetColumn = {
            sizeUnits: 0,
            groups: []
          };
          targetRow.columns.push(targetColumn);
        }

        targetColumn.groups.push(group);
        targetColumn.sizeUnits += group.sizeUnits;
      });

      return [
        '<div class="todos-view__section-rows">',
        rows.map(function (row) {
          return [
            '<div class="todos-view__section-columns todos-view__section-columns--category" style="--todo-category-column-count:', escapeValue(String(Math.max(1, row.columns.length))), ';">',
            row.columns.map(function (column) {
              return [
                '<div class="todos-view__section-column">',
                column.groups.map(function (group) {
                  const isScrollable = group.items.length > 5;
                  const sectionStyle = group.color
                    ? ' style="--todo-category-color:' + escapeValue(group.color) + ';"'
                    : '';

                  return [
                    '<section class="todos-view__section-panel todos-view__section todos-view__section--category"', sectionStyle, '>',
                    buildSectionHeader(group.name, group.items.length, { category: group.name }),
                    '<div class="todos-view__section-body todos-view__section-body--scroll', isScrollable ? ' is-scrollable' : '', '" data-todo-scroll-key="', escapeValue(getTodoScrollKey("kategorie", group.name)), '">',
                    group.items.map(buildTodoRow).join(""),
                    '</div>',
                    isScrollable ? '<div class="todos-view__scroll-indicator">Weitere TODOs per Scrollen</div>' : '',
                    '</section>'
                  ].join("");
                }).join(""),
                '</div>'
              ].join("");
            }).join(""),
            '</div>'
          ].join("");
        }).join(""),
        '</div>'
      ].join("");
    }

    function buildTodoModal() {
      const draft = todoDraft || null;
      const priorityValue = ["niedrig", "standard", "hoch"].indexOf(String(draft && draft.priority || "").trim().toLowerCase()) >= 0
        ? String(draft && draft.priority || "").trim().toLowerCase()
        : "niedrig";
      const typeValue = ["standard", "checkliste", "step-checkliste"].indexOf(String(draft && draft.type || "").trim().toLowerCase()) >= 0
        ? String(draft && draft.type || "").trim().toLowerCase()
        : "standard";
      const checklistTextValue = String(draft && draft.checklistText || "").trim();
      const assignmentClassInfo = getTodoCategoryClassInfo(draft && draft.category);
      const assignedStudentIds = Array.isArray(draft && draft.assignedStudentIds)
        ? draft.assignedStudentIds.map(function (studentId) {
            return String(studentId || "").trim();
          }).filter(Boolean)
        : [];
      const selectedStudentCount = assignedStudentIds.length;
      const hasAssignedStandardStudents = typeValue === "standard" && selectedStudentCount > 0;

      if (!draft) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="todoModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeTodoModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--planning import-modal__dialog--todo" role="dialog" aria-modal="true" aria-labelledby="todoModalTitle">',
        '<div class="import-modal__header">',
        '<div><h3 id="todoModalTitle">', draft.id ? 'TODO bearbeiten' : 'TODO anlegen', '</h3></div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="todoForm" aria-label="TODO uebernehmen">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closeTodoModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form todo-form" id="todoForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitTodoModal(event)">',
        '<div class="todo-form__layout">',
        '<div class="todo-form__sidebar">',
        '<label class="import-modal__field todo-form__field"><span>Titel</span><input id="todoTitleInput" type="text" value="', escapeValue(draft.title || ""), '" placeholder="Titel des TODOs"></label>',
        '<label class="import-modal__field import-modal__field--knowledge-gap todo-form__field"><span>Kategorie</span><input id="todoCategoryInput" type="text" value="', escapeValue(draft.category || ""), '" placeholder="Kategorie" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handlePlanningCategoryInputFocus(\'todoCategoryInput\', \'todoCategorySuggestions\')" oninput="window.UnterrichtsassistentApp.updateTodoDraftCategory(this.value, false); return window.UnterrichtsassistentApp.handlePlanningCategoryInput(event, \'todoCategorySuggestions\')" onchange="return window.UnterrichtsassistentApp.updateTodoDraftCategory(this.value)" onblur="window.UnterrichtsassistentApp.updateTodoDraftCategory(this.value); return window.UnterrichtsassistentApp.handlePlanningCategoryInputBlur(\'todoCategorySuggestions\')"><div class="knowledge-gap-suggestions knowledge-gap-suggestions--planning" id="todoCategorySuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerDown(event, \'todoCategorySuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerMove(event, \'todoCategorySuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'todoCategorySuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'todoCategorySuggestions\')"></div></label>',
        '<label class="import-modal__field todo-form__field"><span>Prioritaet</span><select id="todoPriorityInput"><option value="niedrig"', priorityValue === "niedrig" ? ' selected' : '', '>niedrig</option><option value="standard"', priorityValue === "standard" ? ' selected' : '', '>standard</option><option value="hoch"', priorityValue === "hoch" ? ' selected' : '', '>hoch</option></select></label>',
        '<label class="import-modal__field todo-form__field"><span>Deadline</span><input id="todoDueDateInput" type="date" value="', escapeValue(draft.dueDate || ""), '"></label>',
        '<label class="planning-event-form__toggle planning-event-form__toggle--inline todo-form__toggle', (typeValue === "checkliste" || hasAssignedStandardStudents) ? ' is-readonly' : '', '"><input id="todoDoneInput" type="checkbox"', draft.done ? ' checked' : '', (typeValue === "checkliste" || hasAssignedStandardStudents) ? ' disabled' : '', '><span>Erledigt</span></label>',
        '<label class="import-modal__field todo-form__description"><span>Beschreibung</span><textarea id="todoDescriptionInput" rows="6" placeholder="Beschreibung des TODOs">', escapeValue(draft.description || ""), '</textarea></label>',
        '</div>',
        '<div class="todo-form__detail">',
        '<label class="import-modal__field todo-form__field todo-form__field--type"><span>Typ</span><select id="todoTypeInput" onchange="return window.UnterrichtsassistentApp.setTodoDraftType(this.value)"><option value="standard"', typeValue === "standard" ? ' selected' : '', '>Standard</option><option value="checkliste"', typeValue === "checkliste" ? ' selected' : '', '>Checkliste</option><option value="step-checkliste"', typeValue === "step-checkliste" ? ' selected' : '', '>Step Checkliste</option></select></label>',
        assignmentClassInfo.isClassCategory ? [
          '<div class="todo-form__assignment">',
          '<span class="todo-form__assignment-title">Zuordnung</span>',
          '<button class="planning-sidebar__filter-toggle todo-form__assignment-toggle', todoStudentAssignmentOpen ? ' is-open' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.toggleTodoStudentAssignmentOpen()">',
          '<span>Zuordnung</span>',
          '<span class="todo-form__assignment-count">', selectedStudentCount > 0 ? escapeValue(String(selectedStudentCount) + " gewaehlt") : 'keine Auswahl', '</span>',
          '</button>',
          todoStudentAssignmentOpen ? [
            '<div class="planning-sidebar__filter-menu todo-form__assignment-menu">',
            '<div class="planning-sidebar__filter-actions todo-form__assignment-actions">',
            '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.selectAllTodoAssignedStudents()">Alle</button>',
            '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.clearAllTodoAssignedStudents()">Keine</button>',
            '</div>',
            assignmentClassInfo.students.map(function (student) {
              const studentId = String(student && student.id || "").trim();
              return [
                  '<label class="planning-sidebar__filter-option todo-form__assignment-option">',
                  '<input type="checkbox" ', assignedStudentIds.indexOf(studentId) >= 0 ? 'checked ' : '', 'onchange="return window.UnterrichtsassistentApp.toggleTodoAssignedStudent(\'', escapeValue(studentId), '\')">',
                  '<span>', escapeValue(getStudentCompactDisplayName(student, assignmentClassInfo.students)), '</span>',
                  '</label>'
                ].join("");
              }).join(""),
            '</div>'
          ].join("") : '',
          '</div>'
        ].join("") : '',
        typeValue === "checkliste" ? [
          '<label class="import-modal__field todo-form__field todo-form__field--checklist">',
          '<span>Checkliste</span>',
          '<textarea id="todoChecklistInput" rows="10" placeholder="# Punkt&#10;#> Folgeschritt&#10;(#>) Erledigter Schritt&#10;## Unterpunkt&#10;(##) Erledigter Unterpunkt&#10;##> Folgeschritt zu ##" oninput="return window.UnterrichtsassistentApp.updateTodoChecklistText(this.value)">', escapeValue(checklistTextValue), '</textarea>',
          '<small class="todo-form__hint">Syntax: <code>#</code>/<code>##</code> fuer Ebenen, <code>#&gt;</code>/<code>##&gt;</code> fuer Folgeschritte dieser Ebene, Klammern markieren erledigt.</small>',
          '</label>'
        ].join("") : '',
        '</div>',
        '</div>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    const filteredTodos = sortTodoItems(todos.filter(doesTodoMatchFilters));
    const listPanelContent = [
      '<article class="panel panel--full">',
      '<div class="todos-view">',
      '<div class="todos-view__table" data-todo-scroll-key="liste:haupt">',
      buildAddRow(),
      filteredTodos.length
        ? filteredTodos.map(buildTodoRow).join("")
        : '<p class="empty-message todos-view__empty">Keine TODOs passend zu den aktuellen Filtern.</p>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
    const groupedPanels = todoViewMode === "prioritaet"
      ? buildPrioritySections(filteredTodos)
      : (todoViewMode === "kategorie"
        ? buildCategorySections(filteredTodos)
        : "");

    return [
      '<div class="panel-grid panel-grid--todos">',
      '<article class="panel panel--full panel--todos-settings">',
      '<div class="todos-view__settings-bar">',
      buildFilterBar(),
      '</div>',
      '</article>',
      todoViewMode === "liste" ? listPanelContent : groupedPanels,
      buildTodoModal(),
      '</div>'
    ].join("");
  }
};
