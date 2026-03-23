// /files/script.js

let currentPath = "";

// Fetch list of files/folders from server
function fetchFiles(path = "", push = true) {
    fetch("/api/list?path=" + encodeURIComponent(path))
        .then((res) => res.json())
        .then((data) => renderList(data, path, push))
        .catch((err) => console.error(err));
}

// Escape HTML for safe display (if needed)
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Render list of files/folders in the sidebar
function renderList(items, path, push = true) {
    currentPath = path;
    const fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    // Update browser history
    if (push) {
        const newUrl = "/" + path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
        history.pushState({ path }, "", newUrl || "/");
    }

    // Render breadcrumbs
    const breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = "";

    const rootCrumb = document.createElement("span");
    rootCrumb.textContent = "/";
    rootCrumb.classList.add("breadcrumb-item");
    rootCrumb.addEventListener("click", () => fetchFiles(""));
    breadcrumb.appendChild(rootCrumb);

    if (path) {
        const parts = path.split("/").filter(Boolean);

        parts.forEach((part, i) => {
            const span = document.createElement("span");
            span.textContent = part;
            span.classList.add("breadcrumb-item");
            span.addEventListener("click", () => fetchFiles(parts.slice(0, i + 1).join("/")));
            breadcrumb.appendChild(span);
        });

        // "Up" folder
        const upDiv = document.createElement("div");
        upDiv.textContent = ".. (up)";
        upDiv.className = "folder";
        upDiv.addEventListener("click", () => {
            parts.pop();
            fetchFiles(parts.join("/"));
        });
        fileList.appendChild(upDiv);
    }

    items.forEach((item) => {
        if (!item) return;
        if (item.name.endsWith(".data")) return;
        const div = document.createElement("div");
        div.className = item.type === "dir" ? "folder" : "file";

        const icon = item.type === "dir" ? "📁" : "📦";
        div.innerHTML = `<span class="icon">${icon}</span>${escapeHTML(item.name)}`;

        div.addEventListener("click", () => {
            if (item.type === "dir") {
                fetchFiles(item.path);
            } else {
                showPreview(item.path);
            }
        });
        fileList.appendChild(div);
    });
}

function showPreview(filePath) {
    const content = document.getElementById("content");

    fetch(`/files/${filePath}.data`)
        .then((res) => {
            if (!res.ok) throw new Error("Failed to load file");
            return res.text(); // or res.blob() if it's binary
        })
        .then((data) => {
            content.innerHTML = `
                <div class="file-preview">
                    <pre>${escapeHTML(data)}</pre>
                    <button id="download-btn">Download</button>
                </div>
            `;

document.getElementById("download-btn").addEventListener("click", () => {
    // Create a direct download link to the original file on the server
    const a = document.createElement("a");
    a.href = `/files/${filePath}`; // <-- the original file, not .data
    a.download = filePath.split("/").pop(); // just the file name
    a.click();
});        })
        .catch((err) => {
            content.innerHTML = `<p style="color:red;">Error loading file: ${err.message}</p>`;
        });
}
// Handle browser back/forward
window.addEventListener("popstate", (event) => {
    fetchFiles(event.state?.path || "", false);
});

// Load initial path from URL
const initialPath = window.location.pathname.slice(1);
fetchFiles(initialPath);
