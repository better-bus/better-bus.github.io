import { inject, Injectable } from "@angular/core";
import { IDB_DB_NAME } from '@ngx-pwa/local-storage';

@Injectable({ providedIn: 'root' })
export class ImportExportDataService {
  readonly dbName = inject(IDB_DB_NAME)

  async export(fileName: string): Promise<File> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(db.objectStoreNames, 'readonly');
        const exportData: Record<string, { key: any; value: any }[]> = {};
        let completedStores = 0;

        for (const storeName of db.objectStoreNames) {
          const store = tx.objectStore(storeName);
          const cursorRequest = store.openCursor();
          exportData[storeName] = [];

          cursorRequest.onerror = () => reject(cursorRequest.error);
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (cursor) {
              exportData[storeName].push({ key: cursor.key, value: cursor.value });
              cursor.continue();
            } else {
              completedStores++;
              if (completedStores === db.objectStoreNames.length) {
                const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
                const file = new File([blob], fileName, { type: 'application/json' });
                resolve(file);
              }
            }
          };
        }
      };
    });
  }

  async import(file: File): Promise<void> {
    const text = await file.text();
    const importData: Record<string, { key: any; value: any }[]> = JSON.parse(text);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(db.objectStoreNames, 'readwrite');

        for (const storeName of Object.keys(importData)) {
          if (!db.objectStoreNames.contains(storeName)) {
            console.warn(`Skipping unknown store: ${storeName}`);
            continue;
          }

          const store = tx.objectStore(storeName);
          for (const { key, value } of importData[storeName]) {
            store.put(value, key);
          }
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  }
}
