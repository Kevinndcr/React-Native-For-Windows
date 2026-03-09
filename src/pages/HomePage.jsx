import { useState } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { useGreetings }   from '../hooks/useGreetings';
import { GreetingsTable } from '../components/GreetingsTable';
import { ImportButton }   from '../components/ImportButton';
import { GreetingForm }   from '../components/GreetingForm';

const C = {
  bg:        '#0a0f1e',
  surface:   '#111827',
  card:      '#1a2236',
  border:    '#1e3a5f',
  accent:    '#2563eb',
  accentHov: '#1d4ed8',
  green:     '#059669',
  text:      '#e2e8f0',
  muted:     '#64748b',
  danger:    '#dc2626',
};

export { C };

export function HomePage() {
  const { greetings, loading, error, importDatabase, addGreeting, editGreeting, removeGreeting } = useGreetings();
  const [formMode, setFormMode] = useState(null);

  const handleSave = ({ name, message, fecha }) => {
    if (formMode === 'new') addGreeting(name, message, fecha);
    else editGreeting(formMode.id, name, message, fecha);
    setFormMode(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{
        backgroundColor: C.surface,
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.text, letterSpacing: 0.5 }}>
            MiApp
          </Text>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            Gestión de registros SQLite
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ImportButton
            label="↑  Importar BD"
            onImport={importDatabase}
            color={C.accentHov}
          />
          <ImportButton
            label="+  Nuevo registro"
            onImport={() => setFormMode('new')}
            color={C.green}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32 }}>
        {/* Badge de conteo */}
        {!loading && !error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }}>
            <View style={{
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 4,
            }}>
              <Text style={{ color: C.muted, fontSize: 13 }}>
                <Text style={{ color: C.accent, fontWeight: '700' }}>{greetings.length}</Text>
                {'  registros'}
              </Text>
            </View>
          </View>
        )}

        {/* Formulario inline */}
        {formMode !== null && (
          <GreetingForm
            initial={formMode === 'new' ? null : formMode}
            onSave={handleSave}
            onCancel={() => setFormMode(null)}
          />
        )}

        {/* Estados */}
        {loading && (
          <Text style={{ color: C.muted, fontSize: 14, marginTop: 40, textAlign: 'center' }}>
            Cargando...
          </Text>
        )}
        {error && (
          <View style={{
            backgroundColor: '#1c1010',
            borderWidth: 1,
            borderColor: '#7f1d1d',
            padding: 16,
            borderRadius: 4,
            marginTop: 8,
          }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <GreetingsTable
            greetings={greetings}
            onEdit={(g) => setFormMode(g)}
            onDelete={removeGreeting}
          />
        )}
      </ScrollView>
    </View>
  );
}
