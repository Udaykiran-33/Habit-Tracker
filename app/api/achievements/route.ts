import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

// The exact coin amount awarded per achievement — single source of truth
const COIN_REWARDS: Record<string, number> = {
  streak_8:   1,
  streak_30:  2,
  streak_60:  3,
  streak_100: 5,
  comp_50:    1,
  comp_200:   2,
  comp_500:   3,
};

// POST /api/achievements  →  claim a coin reward for one achievement
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { achievementId } = await req.json();
  if (!achievementId || COIN_REWARDS[achievementId] === undefined) {
    return NextResponse.json({ error: "Invalid achievement" }, { status: 400 });
  }

  await connectDB();

  const coinsToAdd = COIN_REWARDS[achievementId];

  // Atomic update:
  //   • Only matches if achievementId is NOT already in claimedAchievements
  //   • $addToSet prevents duplicates even under concurrent requests
  //   • $inc adds coins in the same atomic operation
  const updated = await User.findOneAndUpdate(
    {
      _id: session.user.id,
      claimedAchievements: { $ne: achievementId }, // guard: only if not yet claimed
    },
    {
      $inc: { coins: coinsToAdd },
      $addToSet: { claimedAchievements: achievementId },
    },
    { new: true, select: "coins claimedAchievements" }
  ).lean() as { coins: number; claimedAchievements: string[] } | null;

  if (!updated) {
    // Document didn't match → already claimed
    const existing = await User.findById(session.user.id).select("coins").lean() as { coins: number } | null;
    return NextResponse.json(
      { error: "Already claimed", coins: existing?.coins ?? 0 },
      { status: 409 }
    );
  }

  return NextResponse.json({ coins: updated.coins, claimed: achievementId });
}

// GET /api/achievements  →  return claimed achievement ids + current coins
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(session.user.id)
    .select("claimedAchievements coins")
    .lean() as { claimedAchievements?: string[]; coins?: number } | null;

  return NextResponse.json({
    claimedAchievements: user?.claimedAchievements ?? [],
    coins: user?.coins ?? 0,
  });
}
