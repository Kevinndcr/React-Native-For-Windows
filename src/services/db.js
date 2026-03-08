// src/services/db.js
// Único puente entre React y los Native Modules de Windows.
import { NativeModules } from 'react-native';

const { SQLiteModule, FilePickerModule } = NativeModules;

export const getGreetings  = () => SQLiteModule.getAll();
export const dbExists      = () => SQLiteModule.dbExists();
export const pickAndImport = () => FilePickerModule.pickAndImportDb();
