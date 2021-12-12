interface DEC {
  signature: string;
  hash: string;
  algoName1: string;
  algoName2: string;
  algoLength: number;
  itr: number;
  salt: Uint8Array;
  perms1: KeyUsage[];
  perms2: KeyUsage[];
}

const str2ab = (str: string) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const importSecretKey = (
  password: string,
  DEC: DEC,
  window: Window & typeof globalThis
) => {
  const rawPassword = str2ab(password);

  return window.crypto.subtle.importKey(
    'raw',
    rawPassword,
    {
      name: DEC.algoName1
    },
    false,
    DEC.perms1
  );
};

const deriveEncryptionSecretKey = async (
  password: string,
  DEC: DEC,
  window: Window & typeof globalThis
) => {
  const secretKey = await importSecretKey(password, DEC, window);

  return window.crypto.subtle.deriveKey(
    {
      name: DEC.algoName1,
      salt: DEC.salt,
      iterations: DEC.itr,
      hash: {
        name: DEC.hash
      }
    },
    secretKey,
    {
      name: DEC.algoName2,
      length: DEC.algoLength
    },
    false,
    DEC.perms2
  );
};

const deriveDecryptionSecretKey = async (
  password: string,
  salt: Uint8Array,
  DEC: DEC,
  window: Window & typeof globalThis
) => {
  const secretKey = await importSecretKey(password, DEC, window);

  return window.crypto.subtle.deriveKey(
    {
      name: DEC.algoName1,
      salt,
      iterations: DEC.itr,
      hash: {
        name: DEC.hash
      }
    },
    secretKey,
    {
      name: DEC.algoName2,
      length: DEC.algoLength
    },
    false,
    DEC.perms2
  );
};

const encrypt = async (
  file: File,
  password: string,
  window: Window & typeof globalThis
) => {
  const DEC = {
    signature: 'Q3JlYXRlZCBieSBhIGJvcmVkIHN0dWRlbnQgaW4gYSBjbGFzc3Jvb20u',
    hash: 'SHA-512',
    algoName1: 'PBKDF2',
    algoName2: 'AES-GCM',
    algoLength: 256,
    itr: 80000,
    salt: window.crypto.getRandomValues(new Uint8Array(16)),
    perms1: ['deriveKey'] as KeyUsage[],
    perms2: ['encrypt', 'decrypt'] as KeyUsage[]
  };

  const key = await deriveEncryptionSecretKey(password, DEC, window);
  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  const buffer = await file.arrayBuffer();
  const content = new Uint8Array(buffer);

  const algorithm = {
    iv,
    name: DEC.algoName2
  };

  const encrypted = new Uint8Array([
    ...DEC.salt,
    ...iv,
    ...new Uint8Array(
      await window.crypto.subtle.encrypt(algorithm, key, content)
    )
  ]).buffer;

  return new File([encrypted], file.name);
};

const decrypt = async (
  file: File,
  password: string,
  window: Window & typeof globalThis
) => {
  const DEC = {
    signature: 'Q3JlYXRlZCBieSBhIGJvcmVkIHN0dWRlbnQgaW4gYSBjbGFzc3Jvb20u',
    hash: 'SHA-512',
    algoName1: 'PBKDF2',
    algoName2: 'AES-GCM',
    algoLength: 256,
    itr: 80000,
    salt: window.crypto.getRandomValues(new Uint8Array(16)),
    perms1: ['deriveKey'] as KeyUsage[],
    perms2: ['encrypt', 'decrypt'] as KeyUsage[]
  };

  const buffer = await file.arrayBuffer();

  const salt = new Uint8Array(buffer.slice(0, 16));

  const key = await deriveDecryptionSecretKey(password, salt, DEC, window);
  const iv = new Uint8Array(buffer.slice(16, 32));

  const content = new Uint8Array(buffer.slice(32));

  const algorithm = {
    iv,
    name: DEC.algoName2
  };

  const decrypted = await window.crypto.subtle.decrypt(algorithm, key, content);

  return new File([decrypted], file.name);
};

export { encrypt, decrypt };
