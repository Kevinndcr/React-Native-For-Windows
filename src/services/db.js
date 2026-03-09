// src/services/db.js
// Único puente entre React y los Native Modules de Windows.
import { NativeModules } from 'react-native';

const { SQLiteModule, FilePickerModule } = NativeModules;

export const getGreetings  = () => SQLiteModule.getAll();
export const dbExists      = () => SQLiteModule.dbExists();
export const pickAndImport = () => FilePickerModule.pickAndImportDb();

export const insertGreeting = (name, message, fecha) => SQLiteModule.insert(name, message, fecha);
export const updateGreeting = (id, name, message, fecha) => SQLiteModule.update(id, name, message, fecha);
export const deleteGreeting = (id) => SQLiteModule.deleteRow(id);
