import { useState } from "react";

async function getCurrentUrl(): Promise <string | null> {
	const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
	return tab?.url ?? null;
}

function Results()
{
  //   const onclick = async () => {
  //   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
	// 	chrome.scripting.executeScript({
	// 		target: { tabId: tab.id! },
	// 		func: () => {
	// 			alert('hello worl');
	// 			document.body.style.backgroundColor = 'navy';
	// 		}
	// 	});
	// }

	const [Url, setUrl] = useState<string | null>(null)

	const grabUrl = async () => {
		setUrl(await getCurrentUrl());
	}

	return(
	<>
		<h1>Results</h1>
		<button onClick={()=> grabUrl()}>
		Click to grab Url
		</button>
		{
			Url ?
			<p>
				last read url is: {Url}
			</p> 
			:
			<p>
				click the darn button
			</p>
		}
	</>
	)
} export default Results