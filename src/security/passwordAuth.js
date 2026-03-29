window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.security = window.Unterrichtsassistent.security || {};

(function () {
  const textEncoder = new TextEncoder();
  const AUTH_VERSION = 1;
  const KDF_NAME = "PBKDF2";
  const KDF_HASH = "SHA-256";
  const WRAP_ALGORITHM = "AES-GCM";
  const KDF_ITERATIONS = 250000;
  const SALT_BYTES = 16;
  const WRAP_IV_BYTES = 12;
  const MASTER_KEY_BYTES = 32;
  const SESSION_STORAGE_KEY = "unterrichtsassistent-auth-session";
  const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

  function ensureCryptoSupport() {
    return Boolean(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
  }

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

  async function deriveWrappingKey(password, saltBytes, usages) {
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      textEncoder.encode(String(password || "")),
      { name: KDF_NAME },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: KDF_NAME,
        hash: KDF_HASH,
        salt: saltBytes,
        iterations: KDF_ITERATIONS
      },
      baseKey,
      {
        name: WRAP_ALGORITHM,
        length: 256
      },
      false,
      usages
    );
  }

  async function createPasswordAuthRecord(password) {
    const normalizedPassword = String(password || "");
    const saltBytes = createRandomBytes(SALT_BYTES);
    const wrapIvBytes = createRandomBytes(WRAP_IV_BYTES);
    const masterKeyBytes = createRandomBytes(MASTER_KEY_BYTES);
    const wrappingKey = await deriveWrappingKey(normalizedPassword, saltBytes, ["encrypt"]);
    const encryptedMasterKey = await window.crypto.subtle.encrypt(
      {
        name: WRAP_ALGORITHM,
        iv: wrapIvBytes
      },
      wrappingKey,
      masterKeyBytes
    );

    return {
      version: AUTH_VERSION,
      kdf: KDF_NAME,
      hash: KDF_HASH,
      iterations: KDF_ITERATIONS,
      wrapAlgorithm: WRAP_ALGORITHM,
      salt: encodeBase64(saltBytes),
      wrapIv: encodeBase64(wrapIvBytes),
      encryptedMasterKey: encodeBase64(new Uint8Array(encryptedMasterKey)),
      createdAt: new Date().toISOString()
    };
  }

  async function unlockPasswordAuthRecord(password, authRecord) {
    const record = authRecord || {};
    const wrappingKey = await deriveWrappingKey(
      password,
      decodeBase64(record.salt),
      ["decrypt"]
    );
    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: WRAP_ALGORITHM,
        iv: decodeBase64(record.wrapIv)
      },
      wrappingKey,
      decodeBase64(record.encryptedMasterKey)
    );

    return new Uint8Array(decryptedBytes);
  }

  function createUnlockSession() {
    const now = Date.now();
    const session = {
      unlockedAt: now,
      expiresAt: now + IDLE_TIMEOUT_MS
    };

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function getUnlockSession() {
    try {
      return JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function touchUnlockSession() {
    const currentSession = getUnlockSession();
    const now = Date.now();

    if (!currentSession) {
      return null;
    }

    currentSession.expiresAt = now + IDLE_TIMEOUT_MS;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
    return currentSession;
  }

  function hasValidUnlockSession() {
    const session = getUnlockSession();

    return Boolean(session && Number(session.expiresAt) > Date.now());
  }

  function clearUnlockSession() {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  window.Unterrichtsassistent.security.passwordAuth = {
    idleTimeoutMs: IDLE_TIMEOUT_MS,
    ensureCryptoSupport: ensureCryptoSupport,
    createPasswordAuthRecord: createPasswordAuthRecord,
    unlockPasswordAuthRecord: unlockPasswordAuthRecord,
    createUnlockSession: createUnlockSession,
    getUnlockSession: getUnlockSession,
    touchUnlockSession: touchUnlockSession,
    hasValidUnlockSession: hasValidUnlockSession,
    clearUnlockSession: clearUnlockSession
  };
}());
