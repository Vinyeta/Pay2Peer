export function Button({text, onClick, opaque }) {
    
    return (
        <div className="">
            <button
                className={`px-4 py-2 rounded ${opaque ? 'bg-blue-500 text-white' : 'bg-blue-200  text-blue-700'} hover:bg-blue-600 cursor-pointer`}
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
}