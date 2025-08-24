import { InjectionToken, Provider } from "@angular/core"
import { IPersistenceService } from "./IPersistenceService";
import { LocalService } from "./local.service";
import { ImportExportService } from "./import-export.service";

export const PERSISTENCE = new InjectionToken<IPersistenceService>("PERSISTENCE");

export function provideLocalPersistence(): Provider {
  return { provide: PERSISTENCE, useClass: LocalService };
}

export function provideImportExportPersistence(): Provider {
  return { provide: PERSISTENCE, useClass: ImportExportService };
}
