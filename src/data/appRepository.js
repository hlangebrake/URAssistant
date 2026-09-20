window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

const SNAPSHOT_KEY = "domainSnapshot";
const PASSWORD_AUTH_KEY = "passwordAuth";
const RECOVERY_POINT_KEY = "encryptedRecoveryPoint";
const STORAGE_META_KEY = "storageMetadata";

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

  async saveSnapshot(snapshot, expectedAuthRecord) {
    const { writeState, writeStatesWithAuthCheck } = window.Unterrichtsassistent.data;
    if (expectedAuthRecord && writeStatesWithAuthCheck) {
      return writeStatesWithAuthCheck({ [SNAPSHOT_KEY]: snapshot }, expectedAuthRecord);
    }
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

  async loadStorageMetadata() {
    return (await window.Unterrichtsassistent.data.readState(STORAGE_META_KEY)) || {};
  }

  async saveStorageMetadata(metadata) {
    await window.Unterrichtsassistent.data.writeState(STORAGE_META_KEY, metadata || {});
  }

  async loadRecoveryPoint() {
    return window.Unterrichtsassistent.data.readState(RECOVERY_POINT_KEY);
  }

  async saveRecoveryPoint(snapshotRecord, passwordAuthRecord, reason) {
    // A recovery point is an ordinary encrypted export, including its own wrapped key.
    // In particular, never write a decrypted clone of the user's school data here.
    if (!snapshotRecord || snapshotRecord.algorithm !== "AES-GCM"
      || typeof snapshotRecord.ciphertext !== "string" || typeof snapshotRecord.iv !== "string"
      || !passwordAuthRecord || !passwordAuthRecord.encryptedMasterKey) {
      throw new Error("Der Wiederherstellungspunkt muss verschluesselt sein.");
    }
    const recovery = {
      format: "unterrichtsassistent-encrypted-export",
      version: 1,
      exportedAt: new Date().toISOString(),
      reason: String(reason || "Vor Änderung"),
      passwordAuth: passwordAuthRecord,
      appState: snapshotRecord
    };
    const data = window.Unterrichtsassistent.data;
    if (data.writeStatesWithAuthCheck) {
      await data.writeStatesWithAuthCheck({ [RECOVERY_POINT_KEY]: recovery }, passwordAuthRecord);
    } else {
      await data.writeState(RECOVERY_POINT_KEY, recovery);
    }
    return recovery;
  }

  async saveProtectedState(snapshotRecord, passwordAuthRecord, expectedAuthRecord) {
    const { writeState, writeStates, writeStatesWithAuthCheck } = window.Unterrichtsassistent.data;
    if (expectedAuthRecord && writeStatesWithAuthCheck) {
      return writeStatesWithAuthCheck({ [SNAPSHOT_KEY]: snapshotRecord, [PASSWORD_AUTH_KEY]: passwordAuthRecord }, expectedAuthRecord);
    }

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
