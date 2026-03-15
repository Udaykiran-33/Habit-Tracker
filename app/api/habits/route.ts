import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Habit, HabitCompletion, User } from "@/lib/models";

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

  const habitsWithCompletions = habits.map((h) => ({
    ...h,
    id: h._id.toString(),
    completions: completions
      .filter((c) => c.habitId === h._id.toString())
      .map((c) => ({ date: c.date })),
  }));

  return NextResponse.json({ habits: habitsWithCompletions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, category, frequency, color, icon } =
      await req.json();

    if (!name) {
      return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
    }

    await connectDB();

    // Check coins
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCoins = user.coins ?? 0;
    if (currentCoins < 1) {
      return NextResponse.json({ 
        error: "Insufficient U coins. Maintain consistency to earn more!" 
      }, { status: 403 });
    }

    const habit = await Habit.create({
      userId: session.user.id,
      name,
      category: category ?? "General",
      frequency: frequency ?? "Daily",
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
