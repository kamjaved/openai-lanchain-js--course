export default function extractVideoId(url) {
	const urlParams = new URLSearchParams(new URL(url).search);
	return urlParams.get('v');
}

console.log(extractVideoId('https://www.youtube.com/watch?v=O_9JoimRj8w'));
