import { useState } from 'react';
import { View, Text } from 'react-native';
import { useGreetings }   from '../hooks/useGreetings';
import { GreetingsTable } from '../components/GreetingsTable';
import { ImportButton }   from '../components/ImportButton';
import { GreetingForm }   from '../components/GreetingForm';

export function HomePage() {
  const { greetings, loading, error, importDatabase, addGreeting, editGreeting, removeGreeting } = useGreetings();
  // formMode: null | 'new' | { id, name, message, fecha }
  const [formMode, setFormMode] = useState(null);

  const handleSave = ({ name, message, fecha }) => {
    if (formMode === 'new') {
      addGreeting(name, message, fecha);
    } else {
      editGreeting(formMode.id, name, message, fecha);
    }
    setFormMode(null);
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
        MiApp
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <ImportButton onImport={importDatabase} />
        <ImportButton label="+ Agregar" onImport={() => setFormMode('new')} color="#107c10" />
      </View>

      {formMode !== null && (
        <GreetingForm
          initial={formMode === 'new' ? null : formMode}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {loading && <Text>Cargando...</Text>}
      {error   && <Text style={{ color: 'orange' }}>{error}</Text>}
      {!loading && !error && (
        <GreetingsTable
          greetings={greetings}
          onEdit={(g) => setFormMode(g)}
          onDelete={removeGreeting}
        />
      )}
    </View>
  );
}
