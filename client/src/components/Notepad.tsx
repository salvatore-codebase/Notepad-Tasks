import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Timer, Trash2, Pencil, X, Save } from "lucide-react";
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useAppState, useUpdateAppState, useResetAppState } from "@/hooks/use-todos";
import { useSoundEffects } from "./AudioEffects";
import { TrophyModal } from "./TrophyModal";
import { Button } from "@/components/ui/button";

export function Notepad() {
  const { data: todos = [] } = useTodos();
  const { data: appState } = useAppState();
  
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const updateAppState = useUpdateAppState();
  const resetAppState = useResetAppState();

  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showTrophy, setShowTrophy] = useState(false);
  const { playTick } = useSoundEffects();
  const inputRef = useRef<HTMLInputElement>(null);

  const isPlanning = appState?.status === "planning";
  const isRunning = appState?.status === "running";
  const isFinished = appState?.status === "finished";

  const paperColors = [
    { name: "Cream", color: "#fefcf5" },
    { name: "Soft Blue", color: "#e3f2fd" },
    { name: "Soft Green", color: "#e8f5e9" },
    { name: "Soft Pink", color: "#fce4ec" },
    { name: "Soft Yellow", color: "#fff9c4" },
  ];

  const backgroundColors = [
    { name: "Charcoal", color: "#171717" },
    { name: "Dark Slate", color: "#1e293b" },
    { name: "Night Blue", color: "#0C1445" },
    { name: "Hunter Green", color: "#355E3B" },
    { name: "Coffee Brown", color: "#4B3621" },
  ];

  const handleStartOrComplete = () => {
    if (isPlanning || isFinished) {
      if (todos.length === 0) return;
      updateAppState.mutate({ 
        status: "running", 
        startTime: new Date() 
      });
    } else if (isRunning) {
      const completedCount = todos.filter(t => t.completed).length;
      if (completedCount > 0) {
        updateAppState.mutate({ status: "finished" });
        setShowTrophy(true);
      }
    }
  };

  const handleReset = () => {
    setShowTrophy(false);
    resetAppState.mutate();
    // Force a small delay to ensure state is cleared before interaction
    setTimeout(() => {
      setNewTask("");
      setEditingId(null);
      setEditContent("");
    }, 100);
  };

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTask.trim()) return;
    const maxOrder = Math.max(0, ...todos.map(t => t.order));
    createTodo.mutate({ 
      content: newTask,
      completed: false,
      order: maxOrder + 1
    });
    setNewTask("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleCheck = (id: number, completed: boolean) => {
    if (!isRunning) return; 
    playTick();
    updateTodo.mutate({ id, completed });
  };

  const startEditing = (todo: any) => {
    setEditingId(todo.id);
    setEditContent(todo.content);
  };

  const saveEdit = (id: number) => {
    if (!editContent.trim()) return;
    updateTodo.mutate({ id, content: editContent });
    setEditingId(null);
  };

  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);

  return (
    <div 
      className="min-h-screen py-8 px-4 flex justify-center items-start overflow-x-hidden transition-colors duration-500"
      style={{ backgroundColor: appState?.backgroundColor || "#f1f5f9" }}
    >
      {/* Settings Side Panel */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-stone-200 z-50">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-stone-400 text-center">Paper</span>
          <div className="flex flex-col gap-2">
            {paperColors.map((pc) => (
              <button
                key={pc.color}
                onClick={() => updateAppState.mutate({ paperColor: pc.color })}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${appState?.paperColor === pc.color ? 'border-slate-800 scale-110' : 'border-stone-200'}`}
                style={{ backgroundColor: pc.color }}
                title={pc.name}
              />
            ))}
          </div>
        </div>
        <div className="w-full h-px bg-stone-200" />
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-stone-400 text-center">Desk</span>
          <div className="flex flex-col gap-2">
            {backgroundColors.map((bc) => (
              <button
                key={bc.color}
                onClick={() => updateAppState.mutate({ backgroundColor: bc.color })}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${appState?.backgroundColor === bc.color ? 'border-slate-800 scale-110' : 'border-stone-200'}`}
                style={{ backgroundColor: bc.color }}
                title={bc.name}
              />
            ))}
          </div>
        </div>
      </div>

      <div 
        className="relative w-full max-w-2xl notepad-paper paper-shadow rounded-sm min-h-[800px] flex flex-col pb-20 transform transition-all duration-500 hover:rotate-0 sm:-rotate-1"
        style={{ backgroundColor: appState?.paperColor || "#fefcf5" }}
      >
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/5 to-transparent rounded-t-sm pointer-events-none" />
        <div className="absolute -top-3 left-0 right-0 h-6 flex justify-evenly">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-stone-800 shadow-inner ring-1 ring-white/20" />
            ))}
        </div>

        <div className="pt-12 pb-4 px-8 sm:px-16 flex flex-col gap-2 relative z-10">
          <div className="flex justify-between items-end pb-2">
            <div className="font-hand text-xl text-slate-500">
               {format(new Date(), "MMMM do")}
            </div>
            {appState?.startTime && isRunning && (
                <div className="flex items-center text-slate-400 text-sm font-sans animate-pulse">
                    <Timer className="w-4 h-4 mr-1" />
                    Timer Active
                </div>
            )}
          </div>
          
          <input
            className="w-full bg-transparent border-none text-4xl sm:text-5xl font-hand text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 p-0 mt-4"
            value={appState?.title || "My To-Do List"}
            onChange={(e) => updateAppState.mutate({ title: e.target.value })}
            placeholder="Title..."
            disabled={!isPlanning}
          />
        </div>

        <div className="flex-1 px-4 sm:px-0 relative z-10 mt-2">
          <div className="flex flex-col w-full">
            <AnimatePresence>
              {sortedTodos.map((todo, index) => (
                <motion.div 
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex items-center h-[40px] hover:bg-blue-50/30 transition-colors px-2 sm:px-0"
                >
                  <div className="hidden sm:flex w-[60px] justify-end pr-3 text-slate-400 font-hand text-lg select-none">
                    {index + 1}.
                  </div>
                  
                  <div className="sm:hidden w-8 text-slate-400 font-hand text-lg select-none">
                    {index + 1}.
                  </div>

                  <div className="flex-1 pl-4 sm:pl-6 pr-4 flex items-center">
                    {editingId === todo.id ? (
                      <input
                        autoFocus
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onBlur={() => saveEdit(todo.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                        className="w-full bg-transparent border-none font-hand text-xl sm:text-2xl text-slate-800 focus:outline-none focus:ring-0 p-0"
                      />
                    ) : (
                      <span 
                        className={`
                          font-hand text-xl sm:text-2xl transition-all duration-300 w-full truncate
                          ${todo.completed ? "text-slate-400 line-through decoration-slate-400/50 decoration-2" : "text-slate-800"}
                        `}
                      >
                        {todo.content}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 pr-2">
                    {editingId === todo.id ? (
                      <button onClick={() => saveEdit(todo.id)} className="text-green-600 p-1">
                        <Save className="w-5 h-5" />
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(todo)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity p-1"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTodo.mutate(todo.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="w-[60px] flex justify-center">
                    <button
                      onClick={() => handleCheck(todo.id, !todo.completed)}
                      disabled={!isRunning}
                      className={`
                        w-8 h-8 border-2 rounded-md transition-all duration-200 flex items-center justify-center
                        ${!isRunning 
                           ? "border-slate-300 opacity-50 cursor-not-allowed bg-slate-100" 
                           : "border-slate-800 hover:border-blue-600 cursor-pointer bg-white hover:shadow-md active:scale-95"
                        }
                        ${todo.completed ? "border-green-600 bg-green-50" : ""}
                      `}
                    >
                      {todo.completed && (
                        <Check className="w-6 h-6 text-green-600 animate-check" strokeWidth={3} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="h-[40px] flex items-center group px-2 sm:px-0 mt-1">
               <div className="hidden sm:flex w-[60px] justify-end pr-3 text-slate-300 font-hand text-lg select-none">
                  {sortedTodos.length + 1}.
               </div>
               <div className="sm:hidden w-8 text-slate-300 font-hand text-lg select-none">
                  {sortedTodos.length + 1}.
               </div>
               <form onSubmit={handleAddTask} className="flex-1 pl-4 sm:pl-6 pr-4">
                 <input
                   ref={inputRef}
                   value={newTask}
                   onChange={(e) => setNewTask(e.target.value)}
                   placeholder="Write a task here..."
                   className="w-full bg-transparent border-none text-xl sm:text-2xl font-hand text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 p-0"
                 />
               </form>
               <div className="w-[60px] flex justify-center">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => handleAddTask()}
                   disabled={!newTask.trim()}
                   className="opacity-20 hover:opacity-100 transition-opacity"
                 >
                   <Plus className="w-6 h-6" />
                 </Button>
               </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center px-8 z-20">
            {(isPlanning || isFinished) ? (
                todos.length > 0 && (
                    <Button 
                        onClick={handleStartOrComplete}
                        className="
                            bg-slate-900 text-white font-hand text-xl px-12 py-6 rounded-full shadow-xl 
                            hover:bg-slate-800 hover:scale-105 transition-all duration-300
                            hover:shadow-2xl hover:shadow-slate-900/20
                        "
                    >
                        Start My Day
                    </Button>
                )
            ) : isRunning ? (
                <Button 
                    onClick={handleStartOrComplete}
                    className="
                      bg-transparent border-none text-green-800 font-hand text-xl px-12 py-6 rounded-full 
                      hover:bg-green-50/50 transition-all duration-300
                    "
                >
                    Complete
                </Button>
            ) : null}
        </div>
        
        {!isPlanning && !isFinished && (
           <div className="absolute top-4 right-4">
               <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-300 hover:text-red-400">
                   Reset
               </Button>
           </div>
        )}
      </div>

      <TrophyModal 
        isOpen={showTrophy} 
        onClose={() => setShowTrophy(false)} 
        onReset={handleReset}
        startTime={appState?.startTime || null}
        endTime={new Date()}
        taskCount={todos.filter(t => t.completed).length}
        totalTaskCount={todos.length}
      />
    </div>
  );
}
