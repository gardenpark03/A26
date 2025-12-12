"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { upsertCalendarMarkAction, updateCalendarPrefsAction } from "@/app/(app)/calendar/actions";
import type { CalendarMark } from "@/lib/calendar/types";

interface CalendarCustomizeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  currentMark?: CalendarMark | null;
  currentPrefs: {
    calendar_theme: string;
    calendar_accent: string;
  };
  onSuccess: () => void;
}

export function CalendarCustomizeDrawer({
  open,
  onOpenChange,
  selectedDate,
  currentMark,
  currentPrefs,
  onSuccess,
}: CalendarCustomizeDrawerProps) {
  const [theme, setTheme] = useState(currentPrefs.calendar_theme);
  const [accent, setAccent] = useState(currentPrefs.calendar_accent);
  const [emoji, setEmoji] = useState(currentMark?.emoji || "");
  const [note, setNote] = useState(currentMark?.note || "");
  const [markType, setMarkType] = useState(currentMark?.type || "highlight");
  const [saving, setSaving] = useState(false);

  const handleSaveTheme = async () => {
    setSaving(true);
    const result = await updateCalendarPrefsAction({
      calendar_theme: theme,
      calendar_accent: accent,
    });
    setSaving(false);

    if (result.success) {
      onSuccess();
    }
  };

  const handleSaveMark = async () => {
    if (!selectedDate) return;

    setSaving(true);
    const result = await upsertCalendarMarkAction({
      date: selectedDate,
      emoji: emoji || null,
      note: note || null,
      type: markType,
    });
    setSaving(false);

    if (result.success) {
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Calendar Settings</SheetTitle>
          <SheetDescription>
            캘린더 테마를 변경하거나 날짜를 꾸밀 수 있습니다.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="theme" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="date" disabled={!selectedDate}>
              Date Mark
            </TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="theme">Calendar Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="pastel">Pastel</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  placeholder="#6C63FF"
                  className="flex-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveTheme}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Theme"}
            </Button>
          </TabsContent>

          {/* Date Mark Tab */}
          <TabsContent value="date" className="space-y-4 mt-4">
            {selectedDate && (
              <>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm font-medium">
                    {new Date(selectedDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="😊"
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    이모지를 입력하거나 비워두세요
                  </p>
                </div>

                <div>
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="이 날의 메모를 작성하세요..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="markType">Mark Type</Label>
                  <Select value={markType} onValueChange={setMarkType}>
                    <SelectTrigger id="markType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highlight">Highlight</SelectItem>
                      <SelectItem value="memo">Memo</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSaveMark}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Mark"}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

