const testUrl = async (url) => {
  try {
    console.log(`Testing URL: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language: "js",
        version: "18.15.0",
        files: [
          {
            name: "main.js",
            content: "console.log('hello');"
          }
        ]
      })
    });
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`Output:`, data.run);
      return true;
    }
  } catch (error) {
    console.error(`Error for ${url}:`, error.message);
  }
  return false;
};

const run = async () => {
  const urls = [
    "https://emkc.org/api/v2/piston/execute",
    "https://piston.codechef.com/api/v2/piston/execute",
    "https://piston.codechef.com/execute",
    "https://api.piston.dev/api/v2/piston/execute"
  ];
  for (const url of urls) {
    const ok = await testUrl(url);
    if (ok) {
      console.log(`SUCCESS! Found working URL: ${url}`);
      break;
    }
  }
  process.exit(0);
};

run();
