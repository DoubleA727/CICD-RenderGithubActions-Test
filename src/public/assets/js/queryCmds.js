function fetchMethod(url, callback, method = "GET", data = null, token = null) {
  const headers = {};

  if (data) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;

  const options = { method: method.toUpperCase(), headers };
  if (options.method !== "GET" && data !== null) options.body = JSON.stringify(data);

  fetch(url, options)
    .then(async (response) => {
      // Try to parse JSON safely; if it fails, fall back to text.
      let payload = null;
      const ct = response.headers.get("content-type") || "";
      try {
        if (response.status === 204) {
          payload = {};
        } else if (ct.includes("application/json")) {
          payload = await response.json();
        } else {
          const text = await response.text();
          payload = text ? { message: text } : {};
        }
      } catch (e) {
        // JSON parse failed — still call the callback with a fallback body
        payload = { message: "Unexpected response." };
      }

      callback(response.status, payload);
    })
    .catch((error) => {
      console.error(`Error from ${method} ${url}:`, error);
      // Ensure the UI can react even on network errors
      callback(0, { message: error?.message || "Network error" });
    });
}
