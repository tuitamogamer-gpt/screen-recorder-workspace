const DATABASE_NAME = "screen-studio-workspace";
const DATABASE_VERSION = 1;
const WORKSPACE_STORE = "workspace";
const MEDIA_STORE = "media";
const WORKSPACE_KEY = "current";

let connection: Promise<IDBDatabase> | null = null;

class StorageError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "StorageError";
  }
}

function storageError(cause: unknown): StorageError {
  if (cause instanceof StorageError) return cause;
  const name = cause instanceof Error ? cause.name : "";
  if (name === "QuotaExceededError") {
    return new StorageError(
      "Browser storage is full. Export your recording as a backup, then delete unused projects to free up space.",
      cause,
    );
  }
  if (name === "SecurityError" || name === "NotAllowedError") {
    return new StorageError(
      "Your browser is blocking project storage. Allow site storage or use another browser, and export your recording as a backup.",
      cause,
    );
  }
  if (name === "AbortError") {
    return new StorageError(
      "Saving was interrupted. Try again, and export your recording as a backup before closing this tab.",
      cause,
    );
  }
  if (name === "VersionError") {
    return new StorageError(
      "This workspace was saved by a newer version of the app. Refresh to load the latest version.",
      cause,
    );
  }
  return new StorageError(
    "Project storage is unavailable. Try again, and export your recording as a backup before closing this tab.",
    cause,
  );
}

function openDatabase(): Promise<IDBDatabase> {
  if (connection) return connection;

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(
        new StorageError(
          "This browser does not support project storage. Use a supported browser and export your recording before closing this tab.",
        ),
      );
      return;
    }

    let failed = false;
    let request: IDBOpenDBRequest;
    const fail = (error: unknown) => {
      failed = true;
      reject(storageError(error));
    };

    try {
      request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    } catch (error) {
      fail(error);
      return;
    }

    request.onupgradeneeded = () => {
      if (failed) {
        request.transaction?.abort();
        return;
      }
      const database = request.result;
      if (!database.objectStoreNames.contains(WORKSPACE_STORE)) {
        database.createObjectStore(WORKSPACE_STORE);
      }
      if (!database.objectStoreNames.contains(MEDIA_STORE)) {
        database.createObjectStore(MEDIA_STORE);
      }
    };
    request.onblocked = () =>
      fail(
        new StorageError(
          "Another tab is blocking project storage. Close other Screen Studio tabs, then try again.",
        ),
      );
    request.onerror = () => fail(request.error);
    request.onsuccess = () => {
      const database = request.result;
      if (failed) {
        database.close();
        return;
      }
      const invalidate = () => {
        if (connection === opening) connection = null;
      };
      database.onversionchange = () => {
        database.close();
        invalidate();
      };
      database.onclose = invalidate;
      resolve(database);
    };
  });

  connection = opening;
  // Failed opens can be retried after storage permissions or other tabs change.
  void opening.catch(() => {
    if (connection === opening) connection = null;
  });
  return opening;
}

async function withTransaction<T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    let transaction: IDBTransaction | undefined;
    let request: IDBRequest<T>;
    let requestError: DOMException | null = null;

    try {
      transaction = database.transaction(storeNames, mode);
      // A successful request can still be rolled back by a failed commit.
      // Only transaction completion means the data has actually been saved.
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () =>
        reject(
          storageError(
            requestError ??
              transaction?.error ??
              new DOMException("Transaction aborted", "AbortError"),
          ),
        );
      transaction.onerror = () => {
        requestError ??= transaction?.error ?? null;
      };
      request = operation(transaction);
      request.onerror = () => {
        requestError = request.error;
      };
    } catch (error) {
      try {
        transaction?.abort();
      } catch {
        // Already-inactive transactions need no further cleanup.
      }
      reject(storageError(error));
    }
  });
}

function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return withTransaction([storeName], mode, (transaction) =>
    operation(transaction.objectStore(storeName)),
  );
}

/** Workspace metadata should reference media IDs, never temporary blob URLs. */
export async function loadWorkspace<T>(): Promise<T | null> {
  const data = await withStore<T | undefined>(
    WORKSPACE_STORE,
    "readonly",
    (store) => store.get(WORKSPACE_KEY),
  );
  return data ?? null;
}

/** Store serializable project metadata; store the original video with storeMedia. */
export async function saveWorkspace<T>(data: T): Promise<void> {
  await withStore(WORKSPACE_STORE, "readwrite", (store) =>
    store.put(data, WORKSPACE_KEY),
  );
}

/** Remove a project's last media reference and its video in one atomic commit. */
export async function saveWorkspaceAndDeleteMedia<T>(
  data: T,
  mediaId?: string,
): Promise<void> {
  await withTransaction(
    [WORKSPACE_STORE, MEDIA_STORE],
    "readwrite",
    (transaction) => {
      const saved = transaction
        .objectStore(WORKSPACE_STORE)
        .put(data, WORKSPACE_KEY);
      if (mediaId !== undefined)
        transaction.objectStore(MEDIA_STORE).delete(mediaId);
      return saved;
    },
  );
}

export async function storeMedia(
  blob: Blob,
  id: string = crypto.randomUUID(),
): Promise<string> {
  if (!(blob instanceof Blob)) {
    throw new StorageError(
      "The recording could not be saved because its video data is missing.",
    );
  }
  await withStore(MEDIA_STORE, "readwrite", (store) => store.put(blob, id));
  return id;
}

export async function loadMedia(id: string): Promise<Blob | null> {
  const blob = await withStore<Blob | undefined>(
    MEDIA_STORE,
    "readonly",
    (store) => store.get(id),
  );
  if (blob === undefined) return null;
  if (!(blob instanceof Blob)) {
    throw new StorageError(
      "This project's saved video could not be read. Import the original recording to restore it.",
    );
  }
  return blob;
}

export async function deleteMedia(id: string): Promise<void> {
  await withStore(MEDIA_STORE, "readwrite", (store) => store.delete(id));
}
