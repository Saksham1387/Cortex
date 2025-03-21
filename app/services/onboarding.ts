import { PrismaClient, Gender, AgeGroup, SizeCategory, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface SizesData {
  tops?: string[];
  bottoms?: string[];
  shoes?: string[];
  outerwear?: string[];
  dresses?: string[];
}

interface OnboardingData {
  username?: string;
  bio?: string;
  gender?: Gender | null;
  ageGroup?: AgeGroup | null;
  aesthetics?: string[];
  sizes?: SizesData;
}

/**
 * Service class for handling user onboarding functionality
 * Follows a repository pattern for better separation of concerns
 */
export class OnboardingService {
  /**
   * Completes the onboarding process for a user
   * @param userId - The ID of the user
   * @param data - The onboarding data to save
   * @returns The updated user data
   */
  static async completeOnboarding(userId: string, data: OnboardingData) {
    try {
      // Perform all operations in a transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Update user profile data
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            username: data.username,
            bio: data.bio,
            gender: data.gender,
            ageGroup: data.ageGroup,
            hasCompletedOnboarding: true,
          },
        });

        // 2. Save aesthetics preferences
        if (data.aesthetics && data.aesthetics.length > 0) {
          // First remove existing aesthetics
          await tx.userAesthetic.deleteMany({
            where: { userId },
          });

          // Then add new ones
          await Promise.all(
            data.aesthetics.map((aesthetic) =>
              tx.userAesthetic.create({
                data: {
                  userId,
                  aesthetic,
                },
              })
            )
          );
        }

        // 3. Save size preferences
        if (data.sizes) {
          // Delete existing sizes
          await tx.userSize.deleteMany({
            where: { userId },
          });

          // Create a batch of all size entries to insert
          const sizeEntries: Prisma.UserSizeCreateManyInput[] = [];

          // Process each size category
          const categories = [
            { key: 'tops', value: SizeCategory.TOPS },
            { key: 'bottoms', value: SizeCategory.BOTTOMS },
            { key: 'shoes', value: SizeCategory.SHOES },
            { key: 'outerwear', value: SizeCategory.OUTERWEAR },
            { key: 'dresses', value: SizeCategory.DRESSES },
          ];

          for (const { key, value } of categories) {
            const sizes = data.sizes[key as keyof SizesData];
            if (sizes && sizes.length > 0) {
              sizeEntries.push(
                ...sizes.map((size) => ({
                  userId,
                  category: value,
                  size,
                }))
              );
            }
          }

          // Create all size entries at once if there are any
          if (sizeEntries.length > 0) {
            await tx.userSize.createMany({
              data: sizeEntries,
            });
          }
        }

        return user;
      });
    } catch (error) {
      console.error('Error in onboarding service:', error);
      throw error;
    }
  }

  /**
   * Retrieves a user's onboarding data
   * @param userId - The ID of the user
   * @returns The user's onboarding data
   */
  static async getUserOnboardingData(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          bio: true,
          gender: true,
          ageGroup: true,
          hasCompletedOnboarding: true,
          aesthetics: {
            select: {
              aesthetic: true,
            },
          },
          sizes: {
            select: {
              category: true,
              size: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Transform data to match the expected format
      const transformedSizes: SizesData = {
        tops: user.sizes.filter(s => s.category === SizeCategory.TOPS).map(s => s.size),
        bottoms: user.sizes.filter(s => s.category === SizeCategory.BOTTOMS).map(s => s.size),
        shoes: user.sizes.filter(s => s.category === SizeCategory.SHOES).map(s => s.size),
        outerwear: user.sizes.filter(s => s.category === SizeCategory.OUTERWEAR).map(s => s.size),
        dresses: user.sizes.filter(s => s.category === SizeCategory.DRESSES).map(s => s.size),
      };

      return {
        username: user.username,
        bio: user.bio,
        gender: user.gender,
        ageGroup: user.ageGroup,
        aesthetics: user.aesthetics.map(a => a.aesthetic),
        sizes: transformedSizes,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      };
    } catch (error) {
      console.error('Error fetching user onboarding data:', error);
      throw error;
    }
  }

  /**
   * Checks if a user has completed onboarding
   * @param userId - The ID of the user
   * @returns Whether the user has completed onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { hasCompletedOnboarding: true },
      });

      return user?.hasCompletedOnboarding || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Skips the onboarding process for a user
   * Only marks it as completed without saving preferences
   * @param userId - The ID of the user
   * @returns The updated user
   */
  static async skipOnboarding(userId: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { hasCompletedOnboarding: true },
      });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      throw error;
    }
  }
}