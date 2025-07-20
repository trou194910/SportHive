import React from 'react';

export default function TypeSelector({ options, value, onChange }) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {options.map((option) => {
                const isSelected = option === value;
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`
                            p-2 w-full text-sm rounded-md border transition-colors duration-150
                            ${isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                            }
                        `}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}