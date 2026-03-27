window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

const SNAPSHOT_KEY = "domainSnapshot";

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
      await this.saveSnapshot(demoData);
      return demoData;
    }

    if (isLegacySeedSnapshot(storedSnapshot)) {
      await this.saveSnapshot(demoData);
      return demoData;
    }

    return storedSnapshot;
  }

  async saveSnapshot(snapshot) {
    const { writeState } = window.Unterrichtsassistent.data;
    await writeState(SNAPSHOT_KEY, snapshot);
  }
}

window.Unterrichtsassistent.data.AppRepository = AppRepository;
