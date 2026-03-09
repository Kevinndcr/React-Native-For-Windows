import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { C } from '../pages/HomePage';

function Field({ label, value, onChangeText, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700',
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#334155"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: '#0d1526',
          borderWidth: 1,
          borderColor: focused ? C.accent : C.border,
          color: C.text,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 14,
          borderRadius: 4,
        }}
      />
    </View>
  );
}

export function GreetingForm({ initial, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [name,    setName]    = useState(initial?.name    ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [fecha,   setFecha]   = useState(initial?.fecha   ?? today);

  const isEdit = initial !== null && initial !== undefined;

  return (
    <View style={{
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 6,
      padding: 24,
      marginBottom: 24,
      // subtle left accent bar
      borderLeftWidth: 3,
      borderLeftColor: isEdit ? '#f59e0b' : C.accent,
    }}>
      <Text style={{ color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 20 }}>
        {isEdit ? `✎  Editando registro #${initial.id}` : '＋  Nuevo registro'}
      </Text>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}>
          <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Juan" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Fecha" value={fecha} onChangeText={setFecha} placeholder="AAAA-MM-DD" />
        </View>
      </View>

      <Field label="Mensaje" value={message} onChangeText={setMessage} placeholder="Ingresá el mensaje..." />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={() => onSave({ name, message, fecha })}
          style={({ pressed }) => ({
            backgroundColor: pressed ? (isEdit ? '#d97706' : C.accentHov) : (isEdit ? '#f59e0b' : C.accent),
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 4,
          })}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Guardar</Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#1e293b' : 'transparent',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: C.border,
          })}>
          <Text style={{ color: C.muted, fontSize: 14 }}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}
