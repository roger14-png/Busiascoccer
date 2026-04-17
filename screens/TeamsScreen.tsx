import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  addedAt: number;
}

const TeamsScreen: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');

  const addTeam = () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    const team: Team = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      shortName: newTeamShort.trim() || newTeamName.substring(0, 3).toUpperCase(),
      primaryColor: '#10b981',
      addedAt: Date.now(),
    };

    setTeams(prev => [...prev, team]);
    setNewTeamName('');
    setNewTeamShort('');
  };

  const removeTeam = (id: string) => {
    Alert.alert(
      'Remove Team',
      'Are you sure you want to remove this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setTeams(prev => prev.filter(t => t.id !== id)),
        },
      ]
    );
  };

  const JerseyIcon = ({ color, shortName, size = 48 }: { color: string; shortName: string; size?: number }) => (
    <View style={[styles.jersey, { width: size, height: size, backgroundColor: color }]}>
      <Text style={[styles.jerseyText, { fontSize: size * 0.2 }]}>{shortName}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Club Roster</Text>
        <Text style={styles.subtitle}>Manage registered teams</Text>
        <View style={styles.teamCount}>
          <Text style={styles.countText}>{teams.length} ACTIVE CLUBS</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>New Signing</Text>
          <Text style={styles.formSubtitle}>Add a new club to the database</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Club Name</Text>
          <TextInput
            style={styles.input}
            value={newTeamName}
            onChangeText={setNewTeamName}
            placeholder="e.g. Busia United"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tag (3 chars)</Text>
          <TextInput
            style={styles.input}
            value={newTeamShort}
            onChangeText={setNewTeamShort}
            placeholder="BUS"
            maxLength={3}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.preview}>
          <JerseyIcon color="#10b981" shortName={newTeamShort || '???'} size={60} />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addTeam}>
          <Text style={styles.addButtonText}>Register Club</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.teamsList}>
        {teams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👕</Text>
            <Text style={styles.emptyTitle}>Empty Locker Room</Text>
            <Text style={styles.emptyText}>Register the first club to get started.</Text>
          </View>
        ) : (
          teams.map(team => (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamInfo}>
                <JerseyIcon color={team.primaryColor} shortName={team.shortName} />
                <View style={styles.teamDetails}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <View style={styles.teamMeta}>
                    <Text style={styles.teamId}>ID: {team.id.substring(0, 4)}</Text>
                    <View style={[styles.colorIndicator, { backgroundColor: team.primaryColor }]} />
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeTeam(team.id)}
              >
                <Text style={styles.removeIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  teamCount: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#1e293b',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  preview: {
    alignItems: 'center',
    marginVertical: 20,
  },
  jersey: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  jerseyText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamsList: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamDetails: {
    marginLeft: 16,
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamId: {
    fontSize: 12,
    color: '#10b981',
    marginRight: 8,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  removeButton: {
    padding: 8,
  },
  removeIcon: {
    fontSize: 16,
  },
});

export default TeamsScreen;
