export interface IPersistenceService {
  saveData<T = unknown>(key: string, data: T): Promise<void>;
  getData<T = unknown>(key: string): Promise<T>;
  deleteData(key: string): Promise<void>;
}
