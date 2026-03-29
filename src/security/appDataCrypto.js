window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.security = window.Unterrichtsassistent.security || {};

(function () {
  const SNAPSHOT_RECORD_VERSION = 1;
  const SNAPSHOT_ALGORITHM = "AES-GCM";
  const SNAPSHOT_IV_BYTES = 12;
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  function createRandomBytes(length) {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  function encodeBase64(bytes) {
    let binary = "";
    let index = 0;

    for (index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }

    return window.btoa(binary);
  }

  function decodeBase64(value) {
    const binary = window.atob(String(value || ""));
    const bytes = new Uint8Array(binary.length);
    let index = 0;

    for (index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  function isEncryptedSnapshotRecord(record) {
    return Boolean(
      record
      && typeof record === "object"
      && record.algorithm === SNAPSHOT_ALGORITHM
      && typeof record.iv === "string"
      && typeof record.ciphertext === "string"
    );
  }

  async function importMasterKey(masterKeyBytes, usages) {
    return window.crypto.subtle.importKey(
      "raw",
      masterKeyBytes,
      { name: SNAPSHOT_ALGORITHM },
      false,
      usages
    );
  }

  async function encryptSnapshot(snapshot, masterKeyBytes) {
    const ivBytes = createRandomBytes(SNAPSHOT_IV_BYTES);
    const plaintextBytes = textEncoder.encode(JSON.stringify(snapshot || {}));
    const cryptoKey = await importMasterKey(masterKeyBytes, ["encrypt"]);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: SNAPSHOT_ALGORITHM,
        iv: ivBytes
      },
      cryptoKey,
      plaintextBytes
    );

    return {
      version: SNAPSHOT_RECORD_VERSION,
      algorithm: SNAPSHOT_ALGORITHM,
      iv: encodeBase64(ivBytes),
      ciphertext: encodeBase64(new Uint8Array(ciphertext)),
      encryptedAt: new Date().toISOString()
    };
  }

  async function decryptSnapshot(record, masterKeyBytes) {
    const cryptoKey = await importMasterKey(masterKeyBytes, ["decrypt"]);
    const plaintextBuffer = await window.crypto.subtle.decrypt(
      {
        name: SNAPSHOT_ALGORITHM,
        iv: decodeBase64(record.iv)
      },
      cryptoKey,
      decodeBase64(record.ciphertext)
    );

    return JSON.parse(textDecoder.decode(plaintextBuffer) || "{}");
  }

  window.Unterrichtsassistent.security.appDataCrypto = {
    isEncryptedSnapshotRecord: isEncryptedSnapshotRecord,
    encryptSnapshot: encryptSnapshot,
    decryptSnapshot: decryptSnapshot
  };
}());
