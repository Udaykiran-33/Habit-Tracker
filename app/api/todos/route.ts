import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Todo } from "@/lib/models";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const todos = await Todo.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { task, time } = await req.json();
    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    await connectDB();
    const todo = await Todo.create({
      userId: session.user.id,
      task,
      time,
    });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
    // This will be used to toggle completion
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const { id, completed } = await req.json();
      await connectDB();
      const todo = await Todo.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { completed },
        { new: true }
      );
  
      if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  
      return NextResponse.json({ todo });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
