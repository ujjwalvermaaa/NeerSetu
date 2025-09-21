import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('neersetu.db');

export const setupDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          village TEXT,
          state TEXT,
          district TEXT,
          phone TEXT,
          profile_picture TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Create health_reports table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS health_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          village TEXT NOT NULL,
          symptoms TEXT NOT NULL,
          severity TEXT NOT NULL,
          duration INTEGER NOT NULL,
          voice_report_url TEXT,
          image_report_url TEXT,
          location TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      // Create water_reports table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS water_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          village TEXT NOT NULL,
          ph REAL NOT NULL,
          turbidity REAL NOT NULL,
          bacteria_level REAL NOT NULL,
          rainfall REAL NOT NULL,
          timestamp DATETIME NOT NULL,
          location TEXT,
          image_report_url TEXT,
          contamination_level TEXT,
          is_potable INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      // Create alerts table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          village TEXT NOT NULL,
          risk_index INTEGER,
          status TEXT DEFAULT 'unread',
          escalation_level INTEGER DEFAULT 0,
          acknowledged_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (acknowledged_by) REFERENCES users (id)
        );`
      );

      // Create offline_actions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS offline_actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action_type TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0
        );`
      );

      // Create settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );
    }, 
    (error) => {
      console.error('Database setup error:', error);
      reject(error);
    },
    () => {
      console.log('Database setup completed');
      resolve();
    });
  });
};

export const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const insertData = (table, data) => {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  
  return executeQuery(query, values);
};

export const updateData = (table, data, where, whereParams = []) => {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), ...whereParams];
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
  
  return executeQuery(query, values);
};

export const deleteData = (table, where, whereParams = []) => {
  const query = `DELETE FROM ${table} WHERE ${where}`;
  
  return executeQuery(query, whereParams);
};

export const selectData = (table, columns = '*', where = '', whereParams = []) => {
  let query = `SELECT ${columns} FROM ${table}`;
  
  if (where) {
    query += ` WHERE ${where}`;
  }
  
  return executeQuery(query, whereParams);
};

export default db;
