import React from "react";

export default function BannerAdPreview({ deal }: { deal: any }) {
    return (
        <div className="bg-yellow-300 text-black p-4 border border-yellow-500 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">{deal.title}</h3>
            <p className="text-sm line-clamp-2">{deal.description}</p>
        </div>
    );
}