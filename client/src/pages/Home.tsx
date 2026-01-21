import { Notepad } from "@/components/Notepad";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#f0f0f0] overflow-y-auto">
      {/* Wooden Desk Texture / Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Notepad />
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-400 font-sans z-0 pointer-events-none">
         Use the list to plan, then hit Start to execute.
      </div>
    </div>
  );
}
