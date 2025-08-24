import { inject, Injectable } from "@angular/core";
import { IPersistenceService } from "./IPersistenceService";
import {StorageMap} from '@ngx-pwa/local-storage';
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LocalService implements IPersistenceService {
  private readonly storage = inject(StorageMap);
  saveData<T = unknown>(key: string, data: T): Promise<void> {
    return firstValueFrom(this.storage.set(key, data));
  }
  getData<T = unknown>(key: string): Promise<T> {
    return firstValueFrom(this.storage.get(key)) as Promise<T>;
  }
  deleteData(key: string): Promise<void> {
    return firstValueFrom(this.storage.delete(key));
  }
}
