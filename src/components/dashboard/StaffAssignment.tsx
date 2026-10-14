"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor } from "lucide-react"

interface StaffAssignmentProps {
  currentCounter: number
  onCounterChange: (counter: number) => void
}

export function StaffAssignment({
  currentCounter,
  onCounterChange,
}: StaffAssignmentProps) {
  return (
    <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border">
      <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-semibold text-muted-foreground">My Station:</span>
      <select
        value={currentCounter}
        onChange={(e) => onCounterChange(Number(e.target.value))}
        className="bg-transparent text-xs font-bold text-foreground border-none outline-none cursor-pointer pr-2"
      >
        <option value={1}>Counter #1</option>
        <option value={2}>Counter #2</option>
        <option value={3}>Counter #3</option>
        <option value={4}>Counter #4</option>
        <option value={5}>Desk A</option>
        <option value={6}>Desk B</option>
      </select>
    </div>
  )
}
