import { View, Text, Pressable } from 'react-native';

export function GreetingsTable({ greetings, onEdit, onDelete }) {
  if (!greetings.length)
    return <Text style={{ color: '#666', marginTop: 8 }}>Sin datos. Importá una base de datos o agregá un registro.</Text>;

  return (
    <View>
      {/* Encabezado */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 8, borderBottomWidth: 2 }}>
        <Text style={{ width: 40, fontWeight: 'bold' }}>ID</Text>
        <Text style={{ width: 120, fontWeight: 'bold' }}>Nombre</Text>
        <Text style={{ flex: 1, fontWeight: 'bold' }}>Mensaje</Text>
        <Text style={{ width: 90, fontWeight: 'bold' }}>Fecha</Text>
        <Text style={{ width: 80 }} />
      </View>

      {greetings.map((g) => (
        <View key={g.id} style={{ flexDirection: 'row', borderBottomWidth: 1, padding: 8, alignItems: 'center' }}>
          <Text style={{ width: 40 }}>{g.id}</Text>
          <Text style={{ width: 120 }}>{g.name}</Text>
          <Text style={{ flex: 1 }}>{g.message}</Text>
          <Text style={{ width: 90 }}>{g.fecha ?? ''}</Text>
          <View style={{ width: 80, flexDirection: 'row', gap: 4 }}>
            <Pressable
              onPress={() => onEdit(g)}
              style={{ backgroundColor: '#0078d4', paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>Editar</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete(Number(g.id))}
              style={{ backgroundColor: '#c00', paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>X</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}
