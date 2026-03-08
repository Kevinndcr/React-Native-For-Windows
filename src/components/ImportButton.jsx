import { Pressable, Text } from 'react-native';

export function ImportButton({ onImport }) {
  return (
    <Pressable
      onPress={onImport}
      style={{ padding: 10, marginBottom: 12, backgroundColor: '#0078d4', alignSelf: 'flex-start' }}>
      <Text style={{ color: '#fff' }}>Importar base de datos...</Text>
    </Pressable>
  );
}
