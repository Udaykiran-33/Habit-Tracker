"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

interface Todo {
  _id: string;
  task: string;
  time?: string;
  completed: boolean;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, time }),
    });

    if (res.ok) {
      setTask("");
      setTime("");
      fetchTodos();
      toast.success("Task added!");
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    const res = await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });

    if (res.ok) {
      fetchTodos();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchTodos();
      toast.success("Task deleted");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Todo List</h1>
        <p className="text-muted text-sm mt-1">Manage your daily tasks and remain productive.</p>
      </div>

      <form onSubmit={handleAddTodo} className="bg-surface border border-border rounded-2xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="What needs to be done?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full"
          />
          <div className="flex gap-2">
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" loading={loading} className="px-6">
              <Plus size={18} className="mr-2" />
              Add
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-12 bg-surface/50 border border-border border-dashed rounded-2xl">
            <CheckCircle2 size={40} className="mx-auto text-disabled mb-3" />
            <p className="text-muted">No tasks for now. Add some to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className={`flex items-center justify-between p-4 bg-surface border border-border rounded-xl transition-all ${
                todo.completed ? "opacity-60 grayscale-[0.5]" : "shadow-sm border-l-4 border-l-olive"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(todo._id, todo.completed)}
                  className={`flex-shrink-0 transition-colors ${
                    todo.completed ? "text-olive" : "text-muted hover:text-olive"
                  }`}
                >
                  {todo.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div className="min-w-0">
                  <p className={`text-sm sm:text-base font-medium truncate ${todo.completed ? "line-through text-muted" : "text-foreground"}`}>
                    {todo.task}
                  </p>
                  {todo.time && (
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                      <Clock size={12} />
                      {todo.time}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(todo._id)}
                className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all ml-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
