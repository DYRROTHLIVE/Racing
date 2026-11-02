import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authenticateJwt, requireRoles } from './middlewares/auth.middleware';
import { VideoController } from './controllers/video.controller';
import { SettingsController } from './controllers/settings.controller';
import { RazyAIService } from './services/razy-ai.service';
import { AppBuilderService } from './services/app-builder.service';
import { RoleType } from '@prisma/client';

dotenv.config();

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Branding header
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'RAzy Streaming Core 2026');
  next();
});

// ================= ROUTE DECLARATIONS =================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'RAzy OTT Engine',
    version: '4.2.0',
    timestamp: new Date()
  });
});

// 2. Video Management Routes
app.post(
  '/api/videos',
  authenticateJwt,
  requireRoles([RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PARTNER]),
  VideoController.createVideo
);
app.get('/api/videos', authenticateJwt, VideoController.getVideos);

// 3. RAzy AI Endpoints (Replacing Nexs AI)
app.post(
  '/api/razy-ai/creator-skills',
  authenticateJwt,
  requireRoles([RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.PARTNER]),
  async (req, res) => {
    try {
      const { prompt } = req.body;
      const result