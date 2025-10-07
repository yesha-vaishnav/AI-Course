import fs from "fs";

// async function generateFreeImage(prompt: string) {

//   const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "google/gemini-2.5-flash-image-preview",
//       messages: [{ role: "user", content: prompt }],
//       modalities: ["image"],
//     }),
//   });

//     const data = await resp.json();
//     const imageUrl = data.choices[0].message.images[0].image_url.url;
//     saveImage(imageUrl, "generated.png");
// }

// async function saveImage(imageUrl: string, filename: string) {
//   const res = await fetch(imageUrl);
//   const arrayBuffer = await res.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   fs.writeFileSync(filename, buffer);
//   console.log(`✅ Image saved as ${filename}`);
// }

async function fetchAndSave(url: string, outPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
  console.log(`✅ Image saved as ${outPath}`);
}

async function generateVariations(
  prompt: string,
  width = 1024,
  height = 1024
) {
  const baseUrl = "https://image.pollinations.ai/prompt/";
  const seeds = [42, 1024, 2025];

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    // Construct URL with prompt and seed
    const url = `${baseUrl}${encodeURIComponent(prompt)}?seed=${seed}&width=${width}&height=${height}`;
    // Save image locally
    const filename = `variation_${seed}.png`;
    await fetchAndSave(url, filename);
  }
}

async function generatePollinationsImage(prompt: string) {
    const filename = 'generated.png';
    const seeds = 3;
    const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    for(let i=0; i < seeds ; i++) {
        const url = `${baseUrl}?seed=${i}`;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filename, buffer);
        console.log(`✅ Image saved as ${filename}`);
    }
    
}


console.log('Welcome to image generator');
process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();
    generateVariations(userInput);
});
