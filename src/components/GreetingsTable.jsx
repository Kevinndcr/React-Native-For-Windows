import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C } from '../pages/HomePage';

const COL = { id: 52, name: 160, fecha: 110, actions: 96 };

function HeaderCell({ label, width, flex }) {
  return (
    <Text style={{
      width, flex,
      color: '#94a3b8',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    }}>
      {label}
    </Text>
  );
}

export function GreetingsTable({ greetings, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(null);

  if (!greetings.length)
    return (
      <View style={{
        alignItems: 'center',
        paddingVertical: 60,
        borderWidth: 1,
        borderColor: C.border,
        borderStyle: 'dashed',
        borderRadius: 6,
      }}>
        <Text style={{ color: C.muted, fontSize: 15 }}>Sin registros</Text>
        <Text style={{ color: '#334155', fontSize: 13, marginTop: 6 }}>
          Importá una BD o creá un nuevo registro
        </Text>
      </View>
    );

  return (
    <View style={{
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      {/* Encabezado */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#0d1526',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
      }}>
        <HeaderCell label="ID"      width={COL.id} />
        <HeaderCell label="Nombre"  width={COL.name} />
        <HeaderCell label="Mensaje" flex={1} />
        <HeaderCell label="Fecha"   width={COL.fecha} />
        <View style={{ width: COL.actions }} />
      </View>

      {greetings.map((g, i) => (
        <View
          key={g.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: hovered === g.id
              ? '#162035'
              : i % 2 === 0 ? C.card : C.surface,
            borderBottomWidth: i < greetings.length - 1 ? 1 : 0,
            borderBottomColor: '#1a2d4a',
          }}
          onPointerEnter={() => setHovered(g.id)}
          onPointerLeave={() => setHovered(null)}
        >
          <Text style={{ width: COL.id,   color: C.muted,  fontSize: 13 }}>{g.id}</Text>
          <Text style={{ width: COL.name, color: C.text,   fontSize: 14, fontWeight: '500' }}>{g.name}</Text>
          <Text style={{ flex: 1,         color: '#94a3b8', fontSize: 13 }}>{g.message}</Text>
          <Text style={{ width: COL.fecha,color: C.muted,  fontSize: 12 }}>{g.fecha ?? '—'}</Text>

          <View style={{ width: COL.actions, flexDirection: 'row', gap: 6, justifyContent: 'flex-end' }}>
            <Pressable
              onPress={() => onEdit(g)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1d4ed8' : '#1e3a5f',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#2563eb',
              })}>
              <Text style={{ color: '#93c5fd', fontSize: 12, fontWeight: '600' }}>Editar</Text>
            </Pressable>

            <Pressable
              onPress={() => onDelete(Number(g.id))}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#7f1d1d' : '#1c1010',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#dc2626',
              })}>
              <Text style={{ color: '#fca5a5', fontSize: 12, fontWeight: '600' }}>✕</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}
