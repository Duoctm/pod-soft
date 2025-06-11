import React from "react";

const AddToCardLoading = () => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="flex flex-col items-center">
				<div className="h-20 w-20 animate-spin  rounded-full border-8 border-solid border-[#8C3859] border-t-transparent"></div>
				<span className="mt-4 text-lg font-medium text-white">Loading...</span>
			</div>
		</div>
	);
};

export default AddToCardLoading;
