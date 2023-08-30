import React from 'react';
import Image from 'next/image';

const LoaderAnimation = () => {
	const loader = '/assets/images/loader.svg';

	return (
		<div className="flex ">
			<Image src={loader} alt="loader" width={48} height={48} />
			<p className="font-medium py-1"> Loading....</p>
		</div>
	);
};

export default LoaderAnimation;
