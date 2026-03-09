import { Pressable, Text } from 'react-native';

export function ImportButton({ onImport, label = 'Importar base de datos...', color = '#0078d4' }) {
  return (
    <Pressable
      onPress={onImport}
      style={{ padding: 10, backgroundColor: color, alignSelf: 'flex-start' }}>
      <Text style={{ color: '#fff' }}>{label}</Text>
    </Pressable>
  );
}
