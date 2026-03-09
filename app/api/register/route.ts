import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("[Register] Connected to DB, checking for existing user...");

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });

    console.log("[Register] User created:", user._id, normalizedEmail);

    return NextResponse.json(
      { user: { id: user._id.toString(), name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Register] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
