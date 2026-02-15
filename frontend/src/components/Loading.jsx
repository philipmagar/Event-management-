import React from 'react';

const Loading = () => {
    return (
        <div className="flex flex-col justify-center items-center h-full min-h-[50vh] gap-4 w-full">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted animate-pulse font-medium">Loading...</p>
        </div>
    );
};

export default Loading;
