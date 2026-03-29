window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

const SNAPSHOT_KEY = "domainSnapshot";
const PASSWORD_AUTH_KEY = "passwordAuth";

function isLegacySeedSnapshot(snapshot) {
  if (!snapshot || !snapshot.students || !snapshot.classes) {
    return false;
  }

  return snapshot.students.length === 3
    && snapshot.classes.length === 1
    && snapshot.classes[0].id === "c1"
    && snapshot.students[0]
    && snapshot.students[0].id === "s1";
}

class AppRepository {
  async loadSnapshot() {
    const { demoData, readState } = window.Unterrichtsassistent.data;
    const storedSnapshot = await readState(SNAPSHOT_KEY);

    if (!storedSnapshot) {
      return null;
    }

    if (isLegacySeedSnapshot(storedSnapshot)) {
      return demoData;
    }

    return storedSnapshot;
  }

  async saveSnapshot(snapshot) {
    const { writeState } = window.Unterrichtsassistent.data;
    await writeState(SNAPSHOT_KEY, snapshot);
  }

  async loadPasswordAuthRecord() {
    const { readState } = window.Unterrichtsassistent.data;
    return readState(PASSWORD_AUTH_KEY);
  }

  async savePasswordAuthRecord(record) {
    const { writeState } = window.Unterrichtsassistent.data;
    await writeState(PASSWORD_AUTH_KEY, record);
  }

  async saveProtectedState(snapshotRecord, passwordAuthRecord) {
    const { writeState, writeStates } = window.Unterrichtsassistent.data;

    if (typeof writeStates === "function") {
      await writeStates({
        [SNAPSHOT_KEY]: snapshotRecord,
        [PASSWORD_AUTH_KEY]: passwordAuthRecord
      });
      return;
    }

    await writeState(SNAPSHOT_KEY, snapshotRecord);
    await writeState(PASSWORD_AUTH_KEY, passwordAuthRecord);
  }
}

window.Unterrichtsassistent.data.AppRepository = AppRepository;
