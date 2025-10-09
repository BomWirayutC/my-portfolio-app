import React from "react";

const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
    return (
        <>
            {
                isLoading &&
                <div className="fixed inset-0 bg-white opacity-75 flex items-center justify-center z-50">
                    <div
                        className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-primary border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status" />
                </div>
            }
        </>
    )
}

export default LoadingOverlay;