'use client'

import { IKEMEN_TYPES } from '@/lib/utils/ikemen-types'

type Props = {
  selectedTypeId: number | null
  onSelect: (typeId: number | null) => void
  disabled?: boolean
}

export default function IkemenTypeFilter({ selectedTypeId, onSelect, disabled }: Props) {
  return (
    <div className={`mb-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-none">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-20 h-24 shrink-0 flex-col items-center justify-center rounded-xl border-2 text-xs font-medium transition-colors ${
            selectedTypeId === null
              ? 'border-primary-500 bg-primary-50 text-primary-500'
              : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          すべて
        </button>

        {IKEMEN_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(selectedTypeId === type.id ? null : type.id)}
            className={`flex w-20 shrink-0 flex-col items-center gap-1 rounded-xl border-2 overflow-hidden transition-colors ${
              selectedTypeId === type.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <img
              src={type.image}
              alt={type.name}
              className="aspect-square w-full object-cover object-top"
            />
            <span className={`pb-1 text-center text-xs font-medium leading-tight px-1 ${
              selectedTypeId === type.id ? 'text-primary-500' : 'text-gray-600'
            }`}>
              {type.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
