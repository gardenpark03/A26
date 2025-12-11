export function MoodLegend() {
  const moods = [
    { label: "😢 매우 안좋음", color: "bg-red-900 dark:bg-red-800" },
    { label: "😟 안좋음", color: "bg-red-500 dark:bg-red-600" },
    { label: "😐 보통", color: "bg-gray-400 dark:bg-gray-500" },
    { label: "😊 좋음", color: "bg-emerald-500 dark:bg-emerald-600" },
    { label: "😄 매우 좋음", color: "bg-emerald-700 dark:bg-emerald-800" },
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">
        Mood Legend
      </h4>
      <div className="flex flex-wrap gap-3">
        {moods.map((mood, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${mood.color}`} />
            <span className="text-xs text-muted-foreground">{mood.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        * 색상 밝기는 로그 개수에 따라 조정됩니다
      </p>
    </div>
  )
}

