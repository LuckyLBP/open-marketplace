import React from "react";

export default function FloatingAdPreview({ deal }: { deal: any }) {
    return (
        <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 shadow-md">
            <h2 className="text-2xl font-bold">{deal.title}</h2>
            <p className="mt-2 text-sm line-clamp-3">{deal.description}</p>
        </div>
    );
}

