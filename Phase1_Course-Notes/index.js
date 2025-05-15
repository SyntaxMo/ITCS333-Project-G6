document.addEventListener('DOMContentLoaded', () => {
   const BASE_URL = window.API_CONFIG?.BASE_URL || './apiCS.php';
    const API_URL = BASE_URL;
    console.log('API_URL:', API_URL);

    // Initial Data with 3 Courses (to be added via API if database is empty)
    const initialNotes = [
        {
            title: "CSS",
            courseCode: "ITCS 333",
            type: "Lecture Notes",
            description: "Mastering selectors, flexbox, grid layout...",
            uploadDate: new Date().toISOString().split('T')[0],
            downloads: 142,
            fileSize: "2.4 MB",
            contentOverview: ["Flexbox", "Grid", "Responsive Design"],
            comments: [
                { author: "Jaber", text: "Great notes!", date: "2 days ago" }
            ]
        },
        {
            title: "HTML Fundamentals",
            courseCode: "ITCS 333",
            type: "HTML Notes",
            description: "HTML5 semantic markup and page structure",
            uploadDate: new Date().toISOString().split('T')[0],
            downloads: 98,
            fileSize: "1.8 MB",
            contentOverview: ["Semantic HTML", "Forms", "Accessibility"],
            comments: []
        },
        {
            title: "JavaScript Basics",
            courseCode: "ITCS 333",
            type: "JavaScript Notes",
            description: "Variables, functions, and DOM manipulation",
            uploadDate: new Date().toISOString().split('T')[0],
            downloads: 203,
            fileSize: "3.1 MB",
            contentOverview: ["Variables", "Functions", "DOM Basics"],
            comments: []
        }
    ];

    // ========== Course Notes Page ==========
    if (document.querySelector('.course-notes-page')) {
        const notesContainer = document.querySelector('#notesContainer');
        const searchInput = document.querySelector('#searchInput');
        const uploadForm = document.querySelector('#uploadForm');

        // Fetch and display notes
        function loadNotes() {
            console.log('Fetching notes from API...');
            fetch(`${API_URL}?action=getNotes`)
                .then(response => {
                    console.log('Initial fetch response status:', response.status);
                    return response.json();
                })
                .then(result => {
                    console.log('Initial fetch result:', result);
                    if (result.success) {
                        let notes = result.data;
                        console.log('Fetched notes:', notes);
                        if (notes.length === 0) {
                            console.log('Database empty, adding initial notes...');
                            Promise.all(initialNotes.map(note =>
                                fetch(`${API_URL}?action=addNote`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(note)
                                })
                                .then(response => {
                                    console.log(`Add note ${note.title} response status:`, response.status);
                                    return response.json();
                                })
                                .then(result => {
                                    console.log(`Add note ${note.title} result:`, result);
                                    return result;
                                })
                            ))
                            .then(() => {
                                console.log('Fetching notes again after adding initial notes...');
                                return fetch(`${API_URL}?action=getNotes`);
                            })
                            .then(response => {
                                console.log('Second fetch response status:', response.status);
                                return response.json();
                            })
                            .then(result => {
                                console.log('Second fetch result:', result);
                                if (result.success) {
                                    notes = result.data;
                                    console.log('Notes after adding initial:', notes);
                                    renderNotes(notes);
                                } else {
                                    notesContainer.innerHTML = '<p>Error loading notes after adding initial notes</p>';
                                    console.error('Error after adding initial notes:', result.message);
                                }
                            });
                        } else {
                            renderNotes(notes);
                        }
                    } else {
                        notesContainer.innerHTML = '<p>Error loading notes</p>';
                        console.error('Error fetching notes:', result.message);
                    }
                })
                .catch(error => {
                    notesContainer.innerHTML = '<p>Error loading notes</p>';
                    console.error('Fetch error:', error);
                });
        }

        // Render notes
        function renderNotes(notesArray) {
            console.log('Rendering notes:', notesArray);
            notesContainer.innerHTML = notesArray.map(note => `
                <article class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${note.title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${note.courseCode}</h6>
                            <p class="card-text">${note.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-warning">${note.type}</span>
                            </div>
                        </div>
                        <a href="Note-Details.php?id=${note.id}" class="btn btn-success w-100">View</a>
                    </div>
                </article>
            `).join('');
        }

        // Event Listeners
        searchInput.addEventListener('input', handleSearch);
        uploadForm.addEventListener('submit', handleUpload);

        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.addEventListener('click', handleFilterSort);
        });

        function handleSearch(e) {
            const term = e.target.value.toLowerCase();
            fetch(`${API_URL}?action=getNotes`)
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const filtered = result.data.filter(note =>
                            note.title.toLowerCase().includes(term) ||
                            note.courseCode.toLowerCase().includes(term)
                        );
                        renderNotes(filtered);
                    }
                });
        }

        function handleFilterSort(e) {
            if (e.target.tagName === 'A') {
                const filterType = e.target.textContent;
                fetch(`${API_URL}?action=getNotes`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            let filtered = [...result.data];
                            if (filterType === 'Newest First') {
                                filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                            } else if (filterType === 'Course Code') {
                                filtered.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
                            } else {
                                filtered = filtered.filter(n => n.courseCode === filterType);
                            }
                            renderNotes(filtered);
                        }
                    });
            }
        }

        function handleUpload(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const fileInput = e.target.querySelector('input[type="file"]');

            const newNote = {
                id: Date.now(),
                title: formData.get('title'),
                courseCode: formData.get('courseCode'),
                type: formData.get('type'),
                description: formData.get('description'),
                uploadDate: new Date().toISOString().split('T')[0],
                downloads: 0,
                fileSize: fileInput.files[0] ?
                    `${(fileInput.files[0].size / 1024 / 1024).toFixed(1)} MB` :
                    "Not uploaded",
                contentOverview: [],
                comments: []
            };

            fetch(`${API_URL}?action=addNote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert(result.message);
                    bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
                    e.target.reset();
                    loadNotes();
                } else {
                    alert(result.message);
                }
            });
        }

        loadNotes();
    }

    // ========== Note Details Page ==========
    if (document.querySelector('.note-details-page')) {
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = urlParams.get('id');

        const noteTitle = document.querySelector('#noteTitle');
        const contentList = document.querySelector('#contentList');
        const commentsContainer = document.querySelector('#commentsContainer');
        const commentCount = document.querySelector('#commentCount');
        const commentForm = document.querySelector('#commentForm');
        const deleteBtn = document.querySelector('#deleteBtn');
        const editBtn = document.querySelector('#editBtn');

        // Fetch and display note details
        fetch(`${API_URL}?action=getNotes&id=${noteId}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const note = result.data;
                    if (!note) {
                        window.location.href = 'Course-Notes.php';
                        return;
                    }
                    noteTitle.textContent = note.title;
                    document.querySelector('[data-course]').textContent = note.courseCode;
                    document.querySelector('[data-type]').textContent = note.type;
                    document.querySelector('[data-date]').textContent = note.uploadDate;
                    document.querySelector('[data-downloads]').textContent = note.downloads;
                    document.querySelector('[data-size]').textContent = note.fileSize;
                    contentList.innerHTML = note.contentOverview
                        .map(item => `<li class="list-group-item">${item}</li>`)
                        .join('');
                    loadComments();
                } else {
                    window.location.href = 'Course-Notes.php';
                }
            });

        // Load comments 
        function loadComments() {
            fetch(`${API_URL}?action=getComments&noteId=${noteId}`)
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        commentsContainer.innerHTML = result.data
                            .map(comment => `
                                <div class="comment-box bg-light p-3 mb-3 rounded">
                                    <h5>${comment.author}</h5>
                                    <p class="text-muted small mb-2">Posted ${comment.date}</p>
                                    <p>${comment.text}</p>
                                </div>
                            `).join('');
                        commentCount.textContent = result.data.length;
                    }
                });
        }

        // Download handler
        const downloadBtn = document.querySelector('.btn-primary');
        downloadBtn.addEventListener('click', () => {
            fetch(`${API_URL}?action=getNotes&id=${noteId}`)
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        const note = result.data;
                        const updatedDownloads = note.downloads + 1;

                        fetch(`${API_URL}?action=updateNote`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: noteId, downloads: updatedDownloads })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                const fileName = `${note.title.replace(/\s+/g, '_')}.pdf`;
                                const fileSize = note.fileSize;
                                const link = document.createElement('a');
                                link.href = '#';
                                link.download = fileName;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                                document.querySelector('[data-downloads]').textContent = updatedDownloads;
                                alert(`Downloading ${fileName} (${fileSize})`);
                            }
                        });
                    }
                });
        });

        // Delete handler
        deleteBtn.addEventListener('click', () => {
            if (confirm('Permanently delete this note?')) {
                fetch(`${API_URL}?action=deleteNote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: noteId })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert(result.message);
                        window.location.href = 'Course-Notes.php';
                    } else {
                        alert(result.message);
                    }
                });
            }
        });

        // Edit handler
        editBtn.addEventListener('click', () => {
            const newTitle = prompt('Enter new title:', noteTitle.textContent);
            if (newTitle) {
                fetch(`${API_URL}?action=updateNote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: noteId, title: newTitle })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert(result.message);
                        location.reload();
                    } else {
                        alert(result.message);
                    }
                });
            }
        });

        // Comment handler
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            fetch(`${API_URL}?action=addComment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noteId: noteId,
                    author: formData.get('name'),
                    text: formData.get('comment'),
             date: new Date().toISOString().split('T')[0]
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert(result.message);
                    e.target.reset();
                    loadComments();
                } else {
                    alert(result.message);
                }
            });
        });
    }
});