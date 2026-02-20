import { db } from "./db";
import { users, analyses, type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, passwordHash: string): Promise<void>;
  
  createAnalysis(analysis: InsertAnalysis & { userId: number; score: number; classification: string }): Promise<Analysis>;
  getAnalysesByUserId(userId: number): Promise<Analysis[]>;
  deleteAnalysis(id: number, userId: number): Promise<void>;
  clearAnalyses(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<void> {
    await db.update(users).set({ password: passwordHash }).where(eq(users.id, id));
  }

  async createAnalysis(analysis: InsertAnalysis & { userId: number; score: number; classification: string }): Promise<Analysis> {
    const [created] = await db.insert(analyses).values(analysis).returning();
    return created;
  }

  async getAnalysesByUserId(userId: number): Promise<Analysis[]> {
    return await db.select().from(analyses).where(eq(analyses.userId, userId));
  }

  async deleteAnalysis(id: number, userId: number): Promise<void> {
    await db.delete(analyses).where(eq(analyses.id, id));
  }

  async clearAnalyses(userId: number): Promise<void> {
    await db.delete(analyses).where(eq(analyses.userId, userId));
  }
}

export const storage = new DatabaseStorage();