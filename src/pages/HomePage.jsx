import { View, Text } from 'react-native';
import { useGreetings }   from '../hooks/useGreetings';
import { GreetingsTable } from '../components/GreetingsTable';
import { ImportButton }   from '../components/ImportButton';

export function HomePage() {
  const { greetings, loading, error, importDatabase } = useGreetings();

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
        Hello World 👋
      </Text>

      <ImportButton onImport={importDatabase} />

      {loading && <Text>Cargando...</Text>}
      {error   && <Text style={{ color: 'orange' }}>{error}</Text>}
      {!loading && !error && <GreetingsTable greetings={greetings} />}
    </View>
  );
}
