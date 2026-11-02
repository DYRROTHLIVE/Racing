import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class VideoController {
  /**
   * Ingest and add new Video asset (Direct upload / M3U8 / MP4)
   */
  public static async createVideo(req: AuthRequest, res: Response) {
    try {
      const {
        title,
        slug,
        shortDescription,
        description,
        sourceType,
        sourceUrl,
        categoryId,
        ageRating,
        classification,
        languages,
        isPPV,
        ppvPrice
      } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Video title is mandatory.' });
      }

      // Generate fallback slug if omitted
      const computedSlug = slug || `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

      const newVideo = await prisma.video.create({
        data: {
          title,
          slug: computedSlug,
          shortDescription,
          description,
          sourceType: sourceType || 'FILE_UPLOAD',
          sourceUrl,
          categoryId,
          ageRating: ageRating || '13+',
          classification,
          languages: languages || ['English'],
          isPPV: Boolean(isPPV),
          ppvPrice: isPPV ? Number(ppvPrice) : null,
          status: sourceType === 'FILE_UPLOAD' ? 'PROCESSING' : 'READY',
          hlsPlaybackUrl: sourceType === 'M3U8_URL' ? sourceUrl : `${process.env.CDN_BASE_URL}/hls/${computedSlug}/master.m3u8`
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Video asset registered successfully in RAzy catalog.',
        data: newVideo
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Retrieve catalog list with search and filtering
   */
  public static async getVideos(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [videos, total] = await Promise.all([
        prisma.video.findMany({
          where: {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' } },
              { slug: { contains: String(search), mode: 'insensitive' } }
            ]
          },
          include: { category: true },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.video.count()
      ]);

      return res.status(200).json({
        success: true,
        data: videos,
        meta: { total, page: Number(page), limit: Number(limit) }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}