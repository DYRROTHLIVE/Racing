import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class SettingsController {
  /**
   * Get complete RAzy storefront branding & settings
   */
  public static async getSettings(req: AuthRequest, res: Response) {
    try {
      let settings = await prisma.siteSettings.findFirst();
      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: {
            siteName: 'RAzy',
            siteDescription: 'Your Shows Online',
            primaryButtonColor: '#ff0000',
            darkModeBgPrimary: '#1f222a',
            darkModeBgSecondary: '#2d3038'
          }
        });
      }
      return res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update theme color palette, logo, and CDN assets
   */
  public static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const updateData = req.body;
      const settings = await prisma.siteSettings.upsert({
        where: { tenantId: 'razy_default' },
        update: updateData,
        create: { ...updateData, tenantId: 'razy_default' }
      });

      return res.status(200).json({
        success: true,
        message: 'RAzy storefront settings updated successfully.',
        data: settings
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}