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

  const [initialLoading, setInitialLoading] = useState(true);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
    }
    setInitialLoading(false);
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

  if (initialLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="w-48 h-8 bg-surface border border-border rounded-lg mb-2" />
          <div className="w-64 h-4 bg-surface border border-border rounded-lg" />
        </div>

        {/* Input Form Skeleton */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 mb-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-surface border border-border rounded-lg" />
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-surface border border-border rounded-lg" />
              <div className="w-24 h-10 bg-olive/20 border border-border rounded-lg" />
            </div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-surface border border-border rounded-xl" />
          <div className="h-20 bg-surface border border-border rounded-xl" />
          <div className="h-20 bg-surface border border-border rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto anime-enter">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Todo List</h1>
        <p className="text-muted text-sm mt-1">Manage your daily tasks and remain productive.</p>
      </div>

      <form onSubmit={handleAddTodo} className="bg-surface border border-border rounded-2xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="What needs to be done?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-3">
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-[130px] sm:w-[150px]"
            />
            <Button type="submit" loading={loading} className="px-5 sm:px-6 whitespace-nowrap h-10">
              <Plus size={18} className="mr-1.5 sm:mr-2" />
              Add
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-16 bg-surface/30 border border-border border-dashed rounded-2xl">
            <CheckCircle2 size={48} className="mx-auto text-disabled mb-4" />
            <p className="text-muted text-lg font-medium">No tasks for now</p>
            <p className="text-dim text-sm mt-1">Add some above to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className={`group flex items-center justify-between p-4 sm:p-5 border rounded-2xl transition-all duration-300 hover:shadow-md ${
                todo.completed 
                  ? "bg-surface-2 border-border/50 opacity-75" 
                  : "bg-surface border-border shadow-sm hover:border-olive/30 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(todo._id, todo.completed)}
                  className={`flex-shrink-0 transition-all duration-200 mt-0.5 ${
                    todo.completed 
                      ? "text-olive scale-110" 
                      : "text-muted hover:text-olive hover:scale-110"
                  }`}
                >
                  {todo.completed ? <CheckCircle2 size={26} strokeWidth={2.5} /> : <Circle size={26} strokeWidth={2} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-base sm:text-lg font-medium transition-all duration-200 truncate ${
                    todo.completed 
                      ? "line-through text-dim" 
                      : "text-foreground"
                  }`}>
                    {todo.task}
                  </p>
                  {todo.time && (
                    <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium mt-1 transition-colors ${
                      todo.completed ? "text-dim/80" : "text-olive-light"
                    }`}>
                      <Clock size={14} />
                      {todo.time}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(todo._id)}
                className="p-2.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all sm:-mr-2"
                title="Delete task"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
