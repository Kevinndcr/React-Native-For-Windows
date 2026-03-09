import { Pressable, Text } from 'react-native';

export function ImportButton({ onImport, label = 'Importar BD', color = '#2563eb' }) {
  return (
    <Pressable
      onPress={onImport}
      style={({ pressed }) => ({
        backgroundColor: pressed ? darken(color) : color,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 4,
        alignSelf: 'flex-start',
      })}>
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

// Oscurece un color hex ~15%
function darken(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - 30);
  const g = Math.max(0, ((n >> 8) & 0xff) - 30);
  const b = Math.max(0, (n & 0xff) - 30);
  return `rgb(${r},${g},${b})`;
}
