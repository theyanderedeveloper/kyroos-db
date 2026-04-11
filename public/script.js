let currentPath = "";

function fetchFiles(path = "", push = true) {
    fetch("/api/list?path=" + encodeURIComponent(path))
        .then((res) => res.json())
        .then((data) => renderList(data, path, push))
        .catch((err) => console.error(err));
}

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderList(items, path, push = true) {
    currentPath = path;
    const fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    if (push) {
        const newUrl = "/" + path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
        history.pushState({ path }, "", newUrl || "/");
    }

    const breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = "";

    const rootCrumb = document.createElement("span");
    rootCrumb.textContent = "📁/";
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

        const upDiv = document.createElement("div");
        upDiv.textContent = "..";
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
            return res.text();
        })
        .then((data) => {
            content.innerHTML = `
                <div class="file-preview">
                    <pre>${escapeHTML(data)}</pre>
                    <button id="download-btn">Download</button>
                </div>
            `;

document.getElementById("download-btn").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = `/files/${filePath}`;
    a.download = filePath.split("/").pop();
    a.click();
});        })
        .catch((err) => {
            content.innerHTML = `<p style="color:red;">Error loading file: ${err.message}</p>`;
        });
}
window.addEventListener("popstate", (event) => {
    fetchFiles(event.state?.path || "", false);
});

const initialPath = window.location.pathname.slice(1);
fetchFiles(initialPath);


document.querySelector("#switch").addEventListener("click", () => {
    document.querySelector("#socialsMenu").classList.toggle("active");
});