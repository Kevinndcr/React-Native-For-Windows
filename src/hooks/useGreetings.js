import { useEffect, useState } from 'react';
import { getGreetings, dbExists, pickAndImport, insertGreeting, updateGreeting, deleteGreeting } from '../services/db';

export function useGreetings() {
  const [greetings, setGreetings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    try {
      const exists = dbExists();
      if (!exists) {
        setError('No hay base de datos. Usá el botón "Importar" para cargar una.');
        setGreetings([]);
      } else {
        const data = getGreetings();
        setGreetings(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const importDatabase = async () => {
    const imported = await pickAndImport();
    if (imported) load();
  };

  const addGreeting = (name, message, fecha) => {
    insertGreeting(name, message, fecha);
    load();
  };

  const editGreeting = (id, name, message, fecha) => {
    updateGreeting(id, name, message, fecha);
    load();
  };

  const removeGreeting = (id) => {
    deleteGreeting(id);
    load();
  };

  return { greetings, loading, error, importDatabase, addGreeting, editGreeting, removeGreeting };
}
