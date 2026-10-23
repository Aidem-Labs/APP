import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

export interface Patient {
  id: string;
  name: string;
  email?: string;
  dateOfBirth?: string;
  createdAt: string;
  lastSessionAt?: string;
  therapeuticGoals?: string;
  encryptedData?: string;
}

export interface Session {
  id: string;
  patientId: string;
  sessionDate: string;
  sessionType: 'intake' | 'therapy' | 'assessment' | 'followup';
  notes?: string;
  moodRating?: number;
  encryptedNotes?: string;
}

export interface TherapeuticGoal {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  progress?: number;
}

// Simple UUID generator function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Simple hash function for basic encryption
const simpleHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DATABASE_NAME = 'lmn8_ktc.db';
  private readonly ENCRYPTION_KEY = 'lmn8_ktc_encryption_key';

  async initialize(): Promise<void> {
    try {
      // Open or create the database
      this.db = await SQLite.openDatabaseAsync(this.DATABASE_NAME);
      
      // Create tables if they don't exist
      await this.createTables();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createPatientsTable = `
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        dateOfBirth TEXT,
        createdAt TEXT NOT NULL,
        lastSessionAt TEXT,
        therapeuticGoals TEXT,
        encryptedData TEXT
      );
    `;

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        sessionDate TEXT NOT NULL,
        sessionType TEXT NOT NULL,
        notes TEXT,
        moodRating INTEGER,
        encryptedNotes TEXT,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      );
    `;

    const createGoalsTable = `
      CREATE TABLE IF NOT EXISTS therapeutic_goals (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        targetDate TEXT,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      );
    `;

    try {
      await this.db.execAsync(createPatientsTable);
      await this.db.execAsync(createSessionsTable);
      await this.db.execAsync(createGoalsTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  // Patient operations
  async createPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateUUID();
    const createdAt = new Date().toISOString();
    
    const newPatient: Patient = {
      ...patient,
      id,
      createdAt,
    };

    const query = `
      INSERT INTO patients (id, name, email, dateOfBirth, createdAt, lastSessionAt, therapeuticGoals, encryptedData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      newPatient.id,
      newPatient.name,
      newPatient.email || null,
      newPatient.dateOfBirth || null,
      newPatient.createdAt,
      newPatient.lastSessionAt || null,
      newPatient.therapeuticGoals || null,
      newPatient.encryptedData || null,
    ]);

    return newPatient;
  }

  async getPatient(id: string): Promise<Patient | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Patient>(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );

    return result || null;
  }

  async getAllPatients(): Promise<Patient[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Patient>(
      'SELECT * FROM patients ORDER BY createdAt DESC'
    );

    return result;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof Patient]);
    
    if (fields.length === 0) return;
    
    const query = `UPDATE patients SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    
    // Convert all values to strings to avoid type issues
    const stringValues = values.map(v => v !== null && v !== undefined ? String(v) : null);
    
    await this.db.runAsync(query, [...stringValues, id]);
  }

  // Session operations
  async createSession(session: Omit<Session, 'id'>): Promise<Session> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateUUID();
    const newSession: Session = { ...session, id };

    const query = `
      INSERT INTO sessions (id, patientId, sessionDate, sessionType, notes, moodRating, encryptedNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      newSession.id,
      newSession.patientId,
      newSession.sessionDate,
      newSession.sessionType,
      newSession.notes || null,
      newSession.moodRating || null,
      newSession.encryptedNotes || null,
    ]);

    // Update patient's last session date
    await this.updatePatient(session.patientId, { lastSessionAt: session.sessionDate });

    return newSession;
  }

  async getPatientSessions(patientId: string): Promise<Session[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Session>(
      'SELECT * FROM sessions WHERE patientId = ? ORDER BY sessionDate DESC',
      [patientId]
    );

    return result;
  }

  // Goal operations
  async createGoal(goal: Omit<TherapeuticGoal, 'id' | 'createdAt'>): Promise<TherapeuticGoal> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateUUID();
    const createdAt = new Date().toISOString();
    
    const newGoal: TherapeuticGoal = {
      ...goal,
      id,
      createdAt,
    };

    const query = `
      INSERT INTO therapeutic_goals (id, patientId, title, description, targetDate, status, createdAt, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(query, [
      newGoal.id,
      newGoal.patientId,
      newGoal.title,
      newGoal.description || null,
      newGoal.targetDate || null,
      newGoal.status,
      newGoal.createdAt,
      newGoal.progress || 0,
    ]);

    return newGoal;
  }

  async getPatientGoals(patientId: string): Promise<TherapeuticGoal[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<TherapeuticGoal>(
      'SELECT * FROM therapeutic_goals WHERE patientId = ? ORDER BY createdAt DESC',
      [patientId]
    );

    return result;
  }

  async updateGoal(id: string, updates: Partial<TherapeuticGoal>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof TherapeuticGoal]);
    
    if (fields.length === 0) return;
    
    const query = `UPDATE therapeutic_goals SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    
    // Convert all values to strings to avoid type issues
    const stringValues = values.map(v => v !== null && v !== undefined ? String(v) : null);
    
    await this.db.runAsync(query, [...stringValues, id]);
  }

  // Encryption helper methods
  async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getOrCreateEncryptionKey();
      // Use simple hash as placeholder encryption
      return simpleHash(data + key);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to plain text
    }
  }

  private async getOrCreateEncryptionKey(): Promise<string> {
    try {
      let key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
      if (!key) {
        key = generateUUID();
        await SecureStore.setItemAsync(this.ENCRYPTION_KEY, key);
      }
      return key;
    } catch (error) {
      console.error('Failed to get encryption key:', error);
      return 'fallback-key';
    }
  }

  // Database maintenance
  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  async clearUserData(patientId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Scope local cleanup to the current user. Never erase another device user's records.
    await this.db.runAsync('DELETE FROM sessions WHERE patientId = ?', [patientId]);
    await this.db.runAsync('DELETE FROM therapeutic_goals WHERE patientId = ?', [patientId]);
    await this.db.runAsync('DELETE FROM patients WHERE id = ?', [patientId]);
  }
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM sessions');
    await this.db.runAsync('DELETE FROM therapeutic_goals');
    await this.db.runAsync('DELETE FROM patients');
  }

  // Debug methods for development
  async getDatabaseInfo(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Get table information
      const tablesResult = await this.db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      
      const tableInfo: any = {};
      
      for (const tableRow of tablesResult) {
        const table = tableRow as { name: string };
        const tableName = table.name;
        const schemaResult = await this.db.getAllAsync(
          `PRAGMA table_info(${tableName})`
        );
        const rowCountResult = await this.db.getFirstAsync(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        
        tableInfo[tableName] = {
          schema: schemaResult,
          rowCount: (rowCountResult as any)?.count || 0
        };
      }
      
      return {
        databaseName: this.DATABASE_NAME,
        tables: tableInfo
      };
    } catch (error) {
      console.error('Failed to get database info:', error);
      return { error: (error as Error).message };
    }
  }

  async getAllData(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const patients = await this.getAllPatients();
      const sessions = await this.getAllSessions();
      const goals = await this.getAllGoals();
      
      return {
        patients,
        sessions,
        goals,
        summary: {
          totalPatients: patients.length,
          totalSessions: sessions.length,
          totalGoals: goals.length
        }
      };
    } catch (error) {
      console.error('Failed to get all data:', error);
      return { error: (error as Error).message };
    }
  }

  async getAllSessions(): Promise<Session[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Session>(
      'SELECT * FROM sessions ORDER BY sessionDate DESC'
    );

    return result;
  }

  async getAllGoals(): Promise<TherapeuticGoal[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<TherapeuticGoal>(
      'SELECT * FROM therapeutic_goals ORDER BY createdAt DESC'
    );

    return result;
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
