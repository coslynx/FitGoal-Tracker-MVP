import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { User } from './userInterface';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


interface UserDb extends User {
  id: string;
}

class UserModel {
  async createUser(userData: User): Promise<UserDb> {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const {rows} = await pool.query<UserDb>(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [userData.email, hashedPassword, userData.firstName, userData.lastName]
      );
      return rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findUserByEmail(email: string): Promise<UserDb | null> {
    try {
        const { rows } = await pool.query<UserDb>('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw new Error('Failed to find user');
    }
  }

  async findUserById(id: string): Promise<UserDb | null> {
    try {
        const { rows } = await pool.query<UserDb>('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw new Error('Failed to find user');
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<UserDb | null> {
    try {
      const { email, password, firstName, lastName } = updates;
      const updateFields: { [key: string]: any } = {};
      if (email) updateFields.email = email;
      if (password) {
        const saltRounds = 10;
        updateFields.password = await bcrypt.hash(password, saltRounds);
      }
      if (firstName) updateFields.first_name = firstName;
      if (lastName) updateFields.last_name = lastName;

      const { rows } = await pool.query<UserDb>(
        'UPDATE users SET email = COALESCE($1, email), password = COALESCE($2, password), first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name) WHERE id = $5 RETURNING *',
          [updateFields.email, updateFields.password, updateFields.first_name, updateFields.last_name, id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }


  async deleteUser(id: string): Promise<void> {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export const userModel = new UserModel();

```