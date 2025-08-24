import { Injectable } from "@angular/core";
import { IPersistenceService } from "./IPersistenceService";

@Injectable({
  providedIn: "root"
})
export class ImportExportService implements IPersistenceService {
  saveData<T = unknown>(key: string, data: T): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getData<T = unknown>(key: string): Promise<T> {
    throw new Error("Method not implemented.");
  }
  deleteData(key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

}
