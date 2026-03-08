import { View, Text } from 'react-native';

export function GreetingsTable({ greetings }) {
  if (!greetings.length)
    return <Text>Sin datos. Importá una base de datos primero.</Text>;

  return (
    <View>
      {greetings.map((g) => (
        <View key={g.id} style={{ flexDirection: 'row', borderBottomWidth: 1, padding: 8 }}>
          <Text style={{ width: 40 }}>{g.id}</Text>
          <Text style={{ width: 120 }}>{g.name}</Text>
          <Text style={{ flex: 1 }}>{g.message}</Text>
        </View>
      ))}
    </View>
  );
}
