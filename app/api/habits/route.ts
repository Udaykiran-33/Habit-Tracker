import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit, HabitCompletion, User } from "@/lib/models";

// Never cache — always hit MongoDB for fresh streakFrozen / completions state
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const habits = await Habit.find({
    userId: session.user.id,
    isActive: true,
  })
    .sort({ createdAt: 1 })
    .lean();

  // Fetch completions for each habit
  const habitIds = habits.map((h) => h._id.toString());
  const completions = await HabitCompletion.find({
    habitId: { $in: habitIds },
  })
    .sort({ date: -1 })
    .lean();

  // Cast to any to bypass Mongoose TypeScript model cache typing issues.
  // Without this, `h.streakFrozen` resolves to undefined at runtime when the
  // model was cached before the field was added to the schema, even though the
  // raw MongoDB document does contain the value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const habitsWithCompletions = (habits as any[]).map((h) => ({
    id: h._id.toString(),
    name: h.name,
    category: h.category,
    color: h.color,
    icon: h.icon,
    isActive: h.isActive,
    createdAt: h.createdAt ? new Date(h.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: h.updatedAt ? new Date(h.updatedAt).toISOString() : new Date().toISOString(),
    streakFrozen: h.streakFrozen === true,
    frozenStreak: typeof h.frozenStreak === "number" ? h.frozenStreak : 0,
    completions: completions
      .filter((c: any) => c.habitId === h._id.toString())
      .map((c: any) => ({ date: c.date })),
  }));

  return NextResponse.json({ habits: habitsWithCompletions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name: rawName, category, color, icon } = await req.json();

    if (!rawName) {
      return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
    }

    // Capitalize first letter
    const name = rawName.trim().charAt(0).toUpperCase() + rawName.trim().slice(1);

    await connectDB();

    // Check coins
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCoins = user.coins ?? 0;
    if (currentCoins < 1) {
      return NextResponse.json({
        error: "Insufficient U coins. Maintain consistency to earn more!",
      }, { status: 403 });
    }

    const habit = await Habit.create({
      userId: session.user.id,
      name,
      category: category ?? "General",
      color: color ?? "#6b8c3a",
      icon: icon ?? "target",
    });

    // Deduct 1 coin
    user.coins = currentCoins - 1;
    await user.save();

    return NextResponse.json(
      { habit: { ...habit.toObject(), id: habit._id.toString() } },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
