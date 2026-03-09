import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

export function GreetingForm({ initial, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [name,    setName]    = useState(initial?.name    ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [fecha,   setFecha]   = useState(initial?.fecha   ?? today);

  const isEdit = initial !== null && initial !== undefined;

  return (
    <View style={{ borderWidth: 1, borderColor: '#ccc', padding: 16, marginBottom: 16, backgroundColor: '#fafafa' }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
        {isEdit ? `Editando ID ${initial.id}` : 'Agregar registro'}
      </Text>

      <Text>Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        style={inputStyle}
      />

      <Text>Mensaje</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Mensaje"
        style={inputStyle}
      />

      <Text>Fecha (AAAA-MM-DD)</Text>
      <TextInput
        value={fecha}
        onChangeText={setFecha}
        placeholder="2025-01-01"
        style={inputStyle}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={() => onSave({ name, message, fecha })}
          style={{ backgroundColor: '#107c10', paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
        </Pressable>
        <Pressable
          onPress={onCancel}
          style={{ backgroundColor: '#666', paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: '#fff' }}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#aaa',
  padding: 6,
  marginBottom: 8,
  backgroundColor: '#fff',
};
