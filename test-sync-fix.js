// Test script to verify synchronization fix
console.log("=== Testing Synchronization Fix ===\n");

async function testDownloadSync() {
  try {
    console.log("1. Starting download...");

    const downloadResponse = await fetch("http://localhost:3000/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        format: "best",
        includeSubtitles: false,
        embedThumbnail: false,
      }),
    });

    if (!downloadResponse.ok) {
      console.log("❌ Download API failed:", downloadResponse.status);
      return;
    }

    const downloadResult = await downloadResponse.json();
    console.log("✅ Download started:", downloadResult.downloadId);

    if (downloadResult.success && downloadResult.downloadId) {
      console.log("\n2. Testing immediate progress API access...");

      // Test immediate access (this used to fail)
      const immediateResponse = await fetch(
        `http://localhost:3000/api/progress/${downloadResult.downloadId}`
      );
      console.log("Immediate access status:", immediateResponse.status);

      if (immediateResponse.ok) {
        console.log("✅ Progress API accessible immediately");

        // Read first chunk
        const reader = immediateResponse.body.getReader();
        const decoder = new TextDecoder();

        try {
          const { value } = await reader.read();
          const chunk = decoder.decode(value);
          console.log("First progress chunk:", chunk.trim());

          if (chunk.includes("Download not found")) {
            console.log('❌ Still getting "Download not found" error');
          } else {
            console.log("✅ Progress tracking working correctly");
          }
        } catch (error) {
          console.log("Progress read error:", error.message);
        } finally {
          reader.releaseLock();
        }
      } else {
        console.log("❌ Progress API not accessible");
      }

      console.log("\n3. Testing delayed access...");

      // Wait a moment and try again
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const delayedResponse = await fetch(
        `http://localhost:3000/api/progress/${downloadResult.downloadId}`
      );
      console.log("Delayed access status:", delayedResponse.status);

      if (delayedResponse.ok) {
        console.log("✅ Progress API accessible after delay");
      }
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

console.log("Make sure the Next.js server is running on http://localhost:3000");
console.log("Run: npm run dev\n");

// Only run if we can reach the server
fetch("http://localhost:3000/api/downloads/status")
  .then(() => {
    console.log("✅ Server is running, starting test...\n");
    testDownloadSync();
  })
  .catch(() => {
    console.log("❌ Server not running. Please start with: npm run dev");
  });
