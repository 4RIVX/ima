import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

function simulateAIAnalysis(filename?: string, fileSize?: string, resolution?: string) {
  let score = Math.floor(Math.random() * 100);
  
  if (filename) {
    if (filename.toLowerCase().includes('ai') || filename.toLowerCase().includes('midjourney')) {
      score = 85 + Math.floor(Math.random() * 15);
    } else if (filename.toLowerCase().includes('photo') || filename.toLowerCase().includes('img')) {
      score = 20 + Math.floor(Math.random() * 20);
    }
  }

  let classification = "Likely Authentic";
  if (score > 75) {
    classification = "Likely AI-Generated";
  } else if (score >= 45) {
    classification = "Possibly AI-Manipulated";
  }

  return { score, classification };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword, comparePasswords } = setupAuth(app);

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const passport = require("passport");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
      req.login(user, (loginErr: any) => {
        if (loginErr) return res.status(500).json({ message: "Login failed" });
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.status(200).json(userWithoutPassword);
  });

  app.post(api.auth.updatePassword.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { currentPassword, newPassword } = api.auth.updatePassword.input.parse(req.body);
      const user = req.user as any;
      
      const dbUser = await storage.getUser(user.id);
      if (!dbUser || !(await comparePasswords(currentPassword, dbUser.password))) {
        return res.status(400).json({ message: "Invalid current password" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.analyses.list.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    const analyses = await storage.getAnalysesByUserId(user.id);
    res.status(200).json(analyses);
  });

  app.post(api.analyses.create.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const input = api.analyses.create.input.parse(req.body);
      const user = req.user as any;
      
      const { score, classification } = simulateAIAnalysis(input.filename, input.fileSize, input.resolution);
      
      const analysis = await storage.createAnalysis({
        userId: user.id,
        filename: input.filename || null,
        imageUrl: input.imageUrl || null,
        fileSize: input.fileSize || null,
        resolution: input.resolution || null,
        score,
        classification
      });
      
      res.status(201).json(analysis);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.analyses.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    await storage.deleteAnalysis(Number(req.params.id), user.id);
    res.status(204).end();
  });

  app.post(api.analyses.clear.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    await storage.clearAnalyses(user.id);
    res.status(200).json({ message: "History cleared" });
  });

  return httpServer;
}