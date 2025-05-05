// index.js
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'unihub-notes';
    
    // Initial Data with 3 Courses
    let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        {
            id: 1,
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
            id: 2,
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
            id: 3,
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

    // First-time initialization
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    const saveNotes = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        if (document.querySelector('.course-notes-page')) renderNotes();
    };

    // ========== Course Notes Page ==========
    if (document.querySelector('.course-notes-page')) {
        const notesContainer = document.querySelector('#notesContainer');
        const searchInput = document.querySelector('#searchInput');
        const uploadForm = document.querySelector('#uploadForm');

        // Initial render
        function renderNotes(notesArray = notes) {
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
                        <a href="Notes-Details.html?id=${note.id}" class="btn btn-success w-100">View</a>
                    </div>
                </article>
            `).join('');
        }

        // First load render
        renderNotes();

        // Event Listeners
        searchInput.addEventListener('input', handleSearch);
        uploadForm.addEventListener('submit', handleUpload);
        
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.addEventListener('click', handleFilterSort);
        });

        function handleSearch(e) {
            const term = e.target.value.toLowerCase();
            const filtered = notes.filter(note =>
                note.title.toLowerCase().includes(term) ||
                note.courseCode.toLowerCase().includes(term)
            );
            renderNotes(filtered);
        }

        function handleFilterSort(e) {
            if (e.target.tagName === 'A') {
                const filterType = e.target.textContent;
                let filtered = [...notes];
                
                if (filterType === 'Newest First') {
                    filtered.sort((a,b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                } else if (filterType === 'Course Code') {
                    filtered.sort((a,b) => a.courseCode.localeCompare(b.courseCode));
                } else {
                    filtered = notes.filter(n => n.courseCode === filterType);
                }
                renderNotes(filtered);
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

            notes.push(newNote);
            saveNotes();
            bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
            e.target.reset();
        }
    }

    // ========== Note Details Page ==========
    if (document.querySelector('.note-details-page')) {
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = parseInt(urlParams.get('id'));
        const note = notes.find(n => n.id === noteId);

        if (!note) window.location.href = 'Course-Notes.html';

        const deleteBtn = document.querySelector('#deleteBtn');
        const editBtn = document.querySelector('#editBtn');
        const commentForm = document.querySelector('#commentForm');

        // Populate Data
        document.querySelector('#noteTitle').textContent = note.title;
        document.querySelector('[data-course]').textContent = note.courseCode;
        document.querySelector('[data-type]').textContent = note.type;
        document.querySelector('[data-date]').textContent = note.uploadDate;
        document.querySelector('[data-downloads]').textContent = note.downloads;
        document.querySelector('[data-size]').textContent = note.fileSize;

        // Content Overview
        document.querySelector('#contentList').innerHTML = note.contentOverview
            .map(item => `<li class="list-group-item">${item}</li>`)
            .join('');

        // Comments
        document.querySelector('#commentsContainer').innerHTML = note.comments
            .map(comment => `
                <div class="comment-box bg-light p-3 mb-3 rounded">
                    <h5>${comment.author}</h5>
                    <p class="text-muted small mb-2">Posted ${comment.date}</p>
                    <p>${comment.text}</p>
                </div>
            `).join('');

        document.querySelector('#commentCount').textContent = note.comments.length;

        // Delete handler
        deleteBtn.addEventListener('click', () => {
            if (confirm('Permanently delete this note?')) {
                notes = notes.filter(n => n.id !== noteId);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
                window.location.href = 'Course-Notes.html';
            }
        });

        // Edit handler
        editBtn.addEventListener('click', () => {
            const newTitle = prompt('Enter new title:', note.title);
            if (newTitle) {
                note.title = newTitle;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
                location.reload();
            }
        });

        // Comment handler
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            note.comments.push({
                author: formData.get('name'),
                text: formData.get('comment'),
                date: new Date().toLocaleDateString()
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
            e.target.reset();
            location.reload();
        });
    }
});