"use client"

export function Button({ text, onClick, opaque }: { text: string; onClick: () => void; opaque?: boolean }) {
  return (
    <button
      className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
        opaque
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
      }`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
