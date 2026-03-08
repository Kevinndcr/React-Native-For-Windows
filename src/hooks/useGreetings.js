import { useEffect, useState } from 'react';
import { getGreetings, dbExists, pickAndImport } from '../services/db';

export function useGreetings() {
  const [greetings, setGreetings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = async () => {
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

  return { greetings, loading, error, importDatabase };
}
