// Using let/const, not global scope unless necessary
let x = 0; // x is still declared, but its usage is removed from the interval
const userData = []; // Renamed and made const

// Helper function to display messages
function displayMessage(message, type = 'success') {
    const msgElement = document.getElementById('msg');
    msgElement.textContent = message;
    msgElement.style.color = type === 'success' ? 'green' : 'red';
}

// Clear input fields
function clearInputs() {
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    document.getElementById('phoneInput').value = '';
}

function handleSubmit() {
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    // Input validation
    if (name === '') {
        displayMessage('Please enter your name.', 'error');
        return;
    }

    if (email === '') {
        displayMessage('Please enter your email.', 'error');
        return;
    }
    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        displayMessage('Please enter a valid email address.', 'error');
        return;
    }

    if (phone === '') {
        displayMessage('Please enter your phone number.', 'error');
        return;
    }
    // Basic phone number validation (digits only)
    if (!/^\\d+$/.test(phone)) {
        displayMessage('Please enter a valid phone number (digits only).', 'error');
        return;
    }

    const newUser = { name, email, phone };
    userData.push(newUser);

    displayMessage('User added successfully!');
    clearInputs(); // Clear inputs after successful submission
    renderUsers(); // Renamed to better reflect its purpose
}

function renderUsers() {
    const userListElement = document.getElementById('userlist');
    userListElement.innerHTML = ''; // Clear previous list

    if (userData.length === 0) {
        userListElement.textContent = 'No users added yet.';
        return;
    }

    // Using template literals and forEach for cleaner rendering
    userData.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-card'); // Use a more specific class name
        userDiv.innerHTML = `
            <div><strong>Name:</strong> ${escapeHTML(user.name)}</div>
            <div><strong>Email:</strong> ${escapeHTML(user.email)}</div>
            <div><strong>Phone:</strong> ${escapeHTML(user.phone)}</div>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        userListElement.appendChild(userDiv);
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const indexToDelete = parseInt(event.target.dataset.index);
            handleDelete(indexToDelete);
        });
    });
}

function handleDelete(index) {
    if (confirm('Are you sure you want to delete this user?')) { // Confirmation dialog
        userData.splice(index, 1);
        displayMessage('User deleted successfully!');
        renderUsers();
    }
}

// Basic HTML escaping function to prevent XSS when using innerHTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Attach event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    // Attach event listeners for navigation (using data attributes for flexibility)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (event) => {
            const page = event.target.dataset.page;
            if (page) {
                handleNavigation(page);
            }
        });
    });

    // Initial render of users when the page loads
    renderUsers();
});

// Better navigation handler
function handleNavigation(page) {
    // For a simple example, still using window.location.href
    // In a larger app, you'd use a routing library or SPA approach
    const pageMap = {
        'home': 'home.html',
        'about': 'about.html',
        'contact': 'contact.html'
    };
    if (pageMap[page]) {
        window.location.href = pageMap[page];
    } else {
        console.warn('Unknown page:', page);
    }
}
// Removed the setInterval as it seemed like a placeholder and was unrelated to the app's functionality.
// Removed the blocking for loop and the unremoved scroll event listener.
// Removed unused functions calc and test.
