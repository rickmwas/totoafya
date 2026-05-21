import React from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CalendarDays,
  Home,
  BookOpen,
  MessageCircle,
  User
} from "lucide-react";

export function VaccineSchedule() {
  return (
    <div className="w-[390px] min-h-[844px] bg-[#F7F5F0] overflow-y-auto relative flex flex-col font-sans pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#F7F5F0]/90 backdrop-blur-md z-10 px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Jabari's Vaccines</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white shadow-sm">
          <span className="text-teal-700 font-semibold">J</span>
        </div>
      </div>

      <div className="px-6 space-y-6 flex-1">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Given</p>
              <p className="text-sm font-semibold text-gray-900">6</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Due</p>
              <p className="text-sm font-semibold text-gray-900">1</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center gap-3 opacity-70">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Overdue</p>
              <p className="text-sm font-semibold text-gray-900">0</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Upcoming</p>
              <p className="text-sm font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-medium text-gray-800">Overall Progress</p>
            <p className="text-xs font-semibold text-teal-600">6 of 15</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "40%" }}></div>
          </div>
        </div>

        {/* Due Now */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Due Now</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-l-amber-400 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">BCG Booster</h3>
                <p className="text-xs text-gray-500 mt-0.5">8 months • Due: May 24, 2026</p>
              </div>
              <div className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-md">
                DUE NOW
              </div>
            </div>
            <button className="w-full py-2.5 bg-teal-50 text-teal-700 font-semibold text-sm rounded-xl hover:bg-teal-100 transition-colors">
              Mark as Given
            </button>
          </div>
        </div>

        {/* Completed */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Completed</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
            
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">BCG</h3>
                <p className="text-xs text-gray-500 mt-0.5">At Birth • Given: May 1, 2025</p>
              </div>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">GIVEN</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">OPV0</h3>
                <p className="text-xs text-gray-500 mt-0.5">At Birth • Given: May 1, 2025</p>
              </div>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">GIVEN</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Penta 1</h3>
                <p className="text-xs text-gray-500 mt-0.5">6 weeks • Given: Jun 14, 2025</p>
              </div>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">GIVEN</span>
              </div>
            </div>

          </div>
        </div>

        {/* Upcoming */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Upcoming</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
            
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Penta 2</h3>
                <p className="text-xs text-gray-500 mt-0.5">10 weeks • Scheduled: Jul 5, 2025</p>
              </div>
              <div className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                <span className="text-[10px] font-bold">SCHEDULED</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">MMR</h3>
                <p className="text-xs text-gray-500 mt-0.5">9 months • Scheduled: Feb 1, 2026</p>
              </div>
              <div className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                <span className="text-[10px] font-bold">SCHEDULED</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Yellow Fever</h3>
                <p className="text-xs text-gray-500 mt-0.5">9 months • Scheduled: Feb 1, 2026</p>
              </div>
              <div className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                <span className="text-[10px] font-bold">SCHEDULED</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Floating Bottom Nav */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[342px] bg-white rounded-full shadow-lg shadow-black/5 border border-gray-100 px-6 py-3 flex items-center justify-between z-20">
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600 transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-teal-600">
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium">Schedule</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600 transition-colors">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Learn</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600 transition-colors">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>

    </div>
  );
}
