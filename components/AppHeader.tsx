import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const UI = {
  primary: '#16A34A',
  admin: '#2563EB',
  text: '#0F172A',
  surface: '#FFFFFF',
};

interface AppHeaderProps {
  title?: string;
  onMenuPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function AppHeader({ title = "DeliverSure", onMenuPress, showBack, onBackPress }: AppHeaderProps) {
  const { role } = useAuth();
  const activeColor = role === 'admin' ? UI.admin : UI.primary;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity onPress={onBackPress} style={styles.iconBtn}>
              <Feather name="arrow-left" size={24} color={UI.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
              <Feather name="menu" size={24} color={UI.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.center}>
          <Text style={[styles.title, { color: activeColor }]}>{title}</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity style={styles.profileBtn}>
            <View style={[styles.roleDot, { backgroundColor: activeColor }]} />
            <Feather name="bell" size={22} color={UI.text} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: UI.surface,
    boxShadow: '0px 1px 4px rgba(0,0,0,0.05)',
  },
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: { width: 40 },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  profileBtn: {
    padding: 8,
    position: 'relative',
  },
  roleDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: UI.surface,
    zIndex: 1,
  }
});
