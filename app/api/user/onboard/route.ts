import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { PrismaClient, Gender, AgeGroup, SizeCategory } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Input validation schema
const OnboardingSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
  ageGroup: z.enum([
    'UNDER_18', 
    'AGE_18_24', 
    'AGE_25_34', 
    'AGE_35_44', 
    'AGE_45_54', 
    'AGE_55_PLUS', 
    'PREFER_NOT_TO_SAY'
  ]).optional(),
  aesthetics: z.array(z.string()).optional(),
  sizes: z.object({
    tops: z.array(z.string()).optional(),
    bottoms: z.array(z.string()).optional(),
    shoes: z.array(z.string()).optional(),
    outerwear: z.array(z.string()).optional(),
    dresses: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = OnboardingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data', 
          errors: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Start a transaction to ensure all database operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the user
      const user = await tx.user.findUnique({
        where: { email: session.user!.email! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Update user profile information
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          username: data.username,
          bio: data.bio,
          gender: data.gender as Gender | null,
          ageGroup: data.ageGroup as AgeGroup | null,
          hasCompletedOnboarding: true,
        },
      });

      // 3. Handle aesthetics preferences
      if (data.aesthetics && data.aesthetics.length > 0) {
        // Delete existing aesthetics
        await tx.userAesthetic.deleteMany({
          where: { userId: user.id },
        });

        // Add new aesthetics
        await Promise.all(
          data.aesthetics.map((aesthetic) =>
            tx.userAesthetic.create({
              data: {
                userId: user.id,
                aesthetic,
              },
            })
          )
        );
      }

      // 4. Handle size preferences
      if (data.sizes) {
        // Delete existing size preferences
        await tx.userSize.deleteMany({
          where: { userId: user.id },
        });

        // Process each size category
        const sizeCategories = [
          { key: 'tops', value: SizeCategory.TOPS },
          { key: 'bottoms', value: SizeCategory.BOTTOMS },
          { key: 'shoes', value: SizeCategory.SHOES },
          { key: 'outerwear', value: SizeCategory.OUTERWEAR },
          { key: 'dresses', value: SizeCategory.DRESSES },
        ];

        for (const { key, value } of sizeCategories) {
          const sizes = data.sizes[key as keyof typeof data.sizes];
          if (sizes && sizes.length > 0) {
            await Promise.all(
              sizes.map((size) =>
                tx.userSize.create({
                  data: {
                    userId: user.id,
                    category: value,
                    size,
                  },
                })
              )
            );
          }
        }
      }

      return { success: true, userId: user.id };
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Onboarding completed successfully',
        userId: result.userId
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in onboarding API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save onboarding data',
        error: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's onboarding data
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch the user with their profile data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
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
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Transform data to match the expected frontend format
    const transformedSizes = {
      tops: user.sizes.filter(s => s.category === SizeCategory.TOPS).map(s => s.size),
      bottoms: user.sizes.filter(s => s.category === SizeCategory.BOTTOMS).map(s => s.size),
      shoes: user.sizes.filter(s => s.category === SizeCategory.SHOES).map(s => s.size),
      outerwear: user.sizes.filter(s => s.category === SizeCategory.OUTERWEAR).map(s => s.size),
      dresses: user.sizes.filter(s => s.category === SizeCategory.DRESSES).map(s => s.size),
    };

    return NextResponse.json({
      success: true,
      data: {
        username: user.username,
        bio: user.bio,
        gender: user.gender,
        ageGroup: user.ageGroup,
        aesthetics: user.aesthetics.map(a => a.aesthetic),
        sizes: transformedSizes,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      }
    });
  } catch (error: any) {
    console.error('Error fetching onboarding data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve onboarding data',
        error: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}