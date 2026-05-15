(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.todos = window.Unterrichtsassistent.features.todos || {};

  function getTimestamp(options, fallbackValue) {
    const trimmedFallback = String(fallbackValue || "").trim();
    const getNow = options && typeof options.getTimestamp === "function"
      ? options.getTimestamp
      : null;

    return trimmedFallback || (getNow ? String(getNow() || "").trim() : "");
  }

  function cloneChecklistItems(items) {
    return Array.isArray(items)
      ? items.map(function (entry) {
          return entry && typeof entry === "object"
            ? Object.assign({}, entry, {
                followUpSteps: Array.isArray(entry.followUpSteps)
                  ? entry.followUpSteps.map(function (step) {
                      return step && typeof step === "object" ? Object.assign({}, step) : step;
                    })
                  : []
              })
            : entry;
        })
      : [];
  }

  function getChildItems(items, parentId) {
    return (items || []).filter(function (entry) {
      return String(entry && entry.parentId || "").trim() === String(parentId || "").trim();
    });
  }

  function getNodeById(items, nodeId) {
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
          type: "item",
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
            type: "step",
            entry: foundStep,
            ownerItem: entry
          };
        }
      }

      return null;
    }, null);
  }

  function isItemManuallyToggleable(items, itemId) {
    const selectedNode = getNodeById(items, itemId);
    const childItems = getChildItems(items, itemId);

    return Boolean(selectedNode) && childItems.length === 0;
  }

  function isNodeDisplayDone(items, nodeId) {
    const selectedNode = getNodeById(items, nodeId);
    const childItems = getChildItems(items, nodeId);

    if (!selectedNode) {
      return false;
    }

    if (childItems.length > 0) {
      return childItems.every(function (childItem) {
        return isNodeAggregateDone(items, childItem && childItem.id);
      });
    }

    return Boolean(selectedNode.entry && selectedNode.entry.done);
  }

  function isNodeAggregateDone(items, nodeId) {
    const selectedNode = getNodeById(items, nodeId);
    const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
      ? selectedNode.entry.followUpSteps
      : [];

    if (!selectedNode) {
      return false;
    }

    return isNodeDisplayDone(items, nodeId) && followUpSteps.every(function (step) {
      return isNodeAggregateDone(items, step && step.id);
    });
  }

  function getFollowUpSteps(items, itemId) {
    const selectedNode = getNodeById(items, itemId);

    if (!selectedNode || selectedNode.type !== "item" || !Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)) {
      return [];
    }

    return selectedNode.entry.followUpSteps;
  }

  function isNodeSelfDone(items, nodeId) {
    const selectedNode = getNodeById(items, nodeId);

    return Boolean(selectedNode && selectedNode.entry && selectedNode.entry.done);
  }

  function isNodeReadyForFollowUp(items, nodeId) {
    return isItemManuallyToggleable(items, nodeId)
      ? isNodeSelfDone(items, nodeId)
      : isNodeDisplayDone(items, nodeId);
  }

  function isNodeUnlocked(items, nodeId) {
    const selectedNode = getNodeById(items, nodeId);
    const previousNodeId = selectedNode && selectedNode.type === "step"
      ? String(selectedNode.entry.previousStepId || selectedNode.ownerItem && selectedNode.ownerItem.id || "").trim()
      : "";
    const parentNodeId = selectedNode && selectedNode.type === "item"
      ? String(selectedNode.entry && selectedNode.entry.parentId || "").trim()
      : "";

    if (!selectedNode) {
      return false;
    }

    if (selectedNode.type === "step") {
      return previousNodeId ? isNodeReadyForFollowUp(items, previousNodeId) : true;
    }

    if (parentNodeId) {
      return isNodeUnlocked(items, parentNodeId);
    }

    return true;
  }

  function isChecklistDone(items) {
    const topLevelItems = getChildItems(items, "");

    return topLevelItems.length > 0 && topLevelItems.every(function (item) {
      return isNodeAggregateDone(items, item && item.id);
    });
  }

  function hasCompletedFollowUpSuccessor(items, nodeId) {
    const selectedNode = getNodeById(items, nodeId);
    const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
      ? selectedNode.entry.followUpSteps
      : [];

    if (!selectedNode || !followUpSteps.length) {
      return false;
    }

    return followUpSteps.some(function (step) {
      return isNodeAggregateDone(items, step && step.id)
        || hasCompletedFollowUpSuccessor(items, step && step.id);
    });
  }

  function syncChecklistCompletionForItems(checklistItems, completedAtTimestamp, options) {
    const completionTimestamp = getTimestamp(options, completedAtTimestamp);

    function syncNode(nodeId) {
      const selectedNode = getNodeById(checklistItems, nodeId);
      const childItems = getChildItems(checklistItems, nodeId);
      const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
        ? selectedNode.entry.followUpSteps
        : [];
      let childItemsDone = true;

      if (!selectedNode) {
        return false;
      }

      childItemsDone = childItems.every(function (childItem) {
        return syncNode(childItem && childItem.id);
      });
      followUpSteps.forEach(function (step) {
        syncNode(step && step.id);
      });

      if (childItems.length > 0) {
        selectedNode.entry.done = childItemsDone;
      } else {
        selectedNode.entry.done = Boolean(selectedNode.entry.done);
      }

      selectedNode.entry.completedAt = selectedNode.entry.done
        ? (String(selectedNode.entry.completedAt || "").trim() || completionTimestamp)
        : "";

      return isNodeAggregateDone(checklistItems, nodeId);
    }

    const topLevelItems = getChildItems(checklistItems, "");

    return topLevelItems.length > 0
      ? topLevelItems.every(function (item) {
          return syncNode(item && item.id);
        })
      : false;
  }

  function syncAssignedStudentStatuses(todo, completedAtTimestamp, options) {
    const completionTimestamp = getTimestamp(options, completedAtTimestamp);
    const assignedStudentIds = Array.isArray(todo && todo.assignedStudentIds)
      ? todo.assignedStudentIds.map(function (studentId) {
          return String(studentId || "").trim();
        }).filter(Boolean)
      : [];
    const existingStatuses = Array.isArray(todo && todo.assignedStudentStatuses) ? todo.assignedStudentStatuses : [];
    const nextStatuses = assignedStudentIds.map(function (studentId) {
      const existingEntry = existingStatuses.find(function (entry) {
        return String(entry && entry.studentId || "").trim() === studentId;
      }) || null;

      return {
        studentId: studentId,
        done: Boolean(existingEntry && existingEntry.done),
        completedAt: Boolean(existingEntry && existingEntry.done)
          ? (String(existingEntry && existingEntry.completedAt || "").trim() || completionTimestamp)
          : "",
        checklistItems: cloneChecklistItems(existingEntry && existingEntry.checklistItems)
      };
    });
    const isDone = assignedStudentIds.length > 0
      ? nextStatuses.every(function (entry) {
          return Boolean(entry && entry.done);
        })
      : Boolean(todo && todo.done);

    if (!todo) {
      return false;
    }

    todo.assignedStudentStatuses = nextStatuses;
    todo.done = isDone;
    todo.completedAt = isDone
      ? (String(todo.completedAt || "").trim() || completionTimestamp)
      : "";

    return isDone;
  }

  function syncChecklistTodoCompletion(todo, completedAtTimestamp, options) {
    const checklistItems = Array.isArray(todo && todo.checklistItems) ? todo.checklistItems : [];
    const completionTimestamp = getTimestamp(options, completedAtTimestamp);
    const assignedStudentIds = Array.isArray(todo && todo.assignedStudentIds)
      ? todo.assignedStudentIds.map(function (studentId) {
          return String(studentId || "").trim();
        }).filter(Boolean)
      : [];

    if (!todo || String(todo.type || "").trim().toLowerCase() !== "checkliste") {
      return false;
    }

    if (assignedStudentIds.length > 0) {
      const existingStatuses = Array.isArray(todo.assignedStudentStatuses) ? todo.assignedStudentStatuses : [];
      const nextStatuses = assignedStudentIds.map(function (studentId) {
        const existingEntry = existingStatuses.find(function (entry) {
          return String(entry && entry.studentId || "").trim() === studentId;
        }) || null;
        const studentChecklistItems = cloneChecklistItems(existingEntry && existingEntry.checklistItems);
        const studentDone = syncChecklistCompletionForItems(studentChecklistItems, completionTimestamp, options);

        return {
          studentId: studentId,
          done: studentDone,
          completedAt: studentDone
            ? (String(existingEntry && existingEntry.completedAt || "").trim() || completionTimestamp)
            : "",
          checklistItems: studentChecklistItems
        };
      });
      const isTodoDone = nextStatuses.length > 0 && nextStatuses.every(function (entry) {
        return Boolean(entry && entry.done);
      });

      todo.assignedStudentStatuses = nextStatuses;
      todo.done = isTodoDone;
      todo.completedAt = isTodoDone
        ? (String(todo.completedAt || "").trim() || completionTimestamp)
        : "";

      return isTodoDone;
    }

    const isTodoDone = syncChecklistCompletionForItems(checklistItems, completionTimestamp, options);

    todo.done = isTodoDone;
    todo.completedAt = isTodoDone
      ? (String(todo.completedAt || "").trim() || completionTimestamp)
      : "";

    return isTodoDone;
  }

  window.Unterrichtsassistent.features.todos.checklist = {
    cloneChecklistItems: cloneChecklistItems,
    getChildItems: getChildItems,
    getNodeById: getNodeById,
    getFollowUpSteps: getFollowUpSteps,
    isItemManuallyToggleable: isItemManuallyToggleable,
    isNodeDisplayDone: isNodeDisplayDone,
    isNodeAggregateDone: isNodeAggregateDone,
    isNodeSelfDone: isNodeSelfDone,
    isNodeReadyForFollowUp: isNodeReadyForFollowUp,
    isNodeUnlocked: isNodeUnlocked,
    isChecklistDone: isChecklistDone,
    hasCompletedFollowUpSuccessor: hasCompletedFollowUpSuccessor,
    syncChecklistCompletionForItems: syncChecklistCompletionForItems,
    syncAssignedStudentStatuses: syncAssignedStudentStatuses,
    syncChecklistTodoCompletion: syncChecklistTodoCompletion
  };
}());
