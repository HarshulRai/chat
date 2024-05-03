const socket = io.connect('http://localhost:3000');

// Function to display chat messages
function displayMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    document.getElementById('chatMessages').appendChild(div);
}

// Listen for incoming messages
socket.on('message', (data) => {
    displayMessage(`${data.sender}: ${data.message}`);
});

// Send message when form is submitted
document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('messageInput').value;
    const receiverUsername = document.getElementById('receiverInput').value; // Get receiver's username
    socket.emit('sendMessage', { receiverUsername, message }); // Include receiver's username
    document.getElementById('messageInput').value = ''; // Clear input field
});


// Function to display received messages
function displayReceivedMessages(messages) {
    const messageList = document.getElementById('receivedMessages');
    messageList.innerHTML = ''; // Clear previous messages

    messages.forEach(message => {
        const listItem = document.createElement('li');
        listItem.textContent = `${message.sender_id}: ${message.message}`;
        messageList.appendChild(listItem);
    });
}

// Fetch and display received messages for the logged-in user
async function fetchReceivedMessages(username) {
    try {
        const response = await fetch(`http://localhost:3000/api/chats/messages/${username}`);
        const messages = await response.json();
        displayReceivedMessages(messages);
    } catch (error) {
        console.error('Error fetching received messages:', error);
    }
}

// Get username from token after login
function getUsernameFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decodedToken = jwt.decode(token);
        return decodedToken.username;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Call fetchReceivedMessages function after login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = 'chat.html'; // Redirect to chat page after successful login

            const loggedInUsername = getUsernameFromToken();
            if (loggedInUsername) {
                fetchReceivedMessages(loggedInUsername); // Fetch and display received messages
            } else {
                console.error('Failed to get username from token.');
            }
        } else {
            alert(data.message); // Display error message
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});
