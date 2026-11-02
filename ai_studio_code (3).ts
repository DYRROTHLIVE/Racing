import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AppBuilderService {
  /**
   * Triggers an automated build via Jenkins for target platform
   */
  public static async triggerBuild(params: {
    platform: string;
    appName: string;
    packageName: string;
    buildFormat: 'APK' | 'AAB' | 'PKG';
    keyAlias?: string;
  }) {
    // 1. Record build request
    const buildRecord = await prisma.appBuild.create({
      data: {
        platform: params.platform,
        appName: params.appName,
        packageName: params.packageName,
        buildFormat: params.buildFormat,
        buildStatus: 'BUILDING'
      }
    });

    try {
      const jenkinsUrl = `${process.env.JENKINS_BASE_URL}/job/RAzy-App-Builder/buildWithParameters`;
      const auth = Buffer.from(`${process.env.JENKINS_USER}:${process.env.JENKINS_API_TOKEN}`).toString('base64');

      // 2. Dispatch payload to CI/CD pipeline
      await axios.post(
        jenkinsUrl,
        null,
        {
          params: {
            RAZY_BUILD_ID: buildRecord.id,
            PLATFORM: params.platform,
            PACKAGE_NAME: params.packageName,
            APP_NAME: params.appName,
            FORMAT: params.buildFormat
          },
          headers: { Authorization: `Basic ${auth}` }
        }
      );

      return {
        success: true,
        message: `Build initiated for ${params.platform} on RAzy CI pipeline.`,
        buildId: buildRecord.id
      };
    } catch (err: any) {
      await prisma.appBuild.update({
        where: { id: buildRecord.id },
        data: { buildStatus: 'FAILED' }
      });
      throw new Error(`Failed to trigger Jenkins worker: ${err.message}`);
    }
  }
}