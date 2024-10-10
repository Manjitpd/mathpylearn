let editor;
let pyodide;

async function initPyodide() {
    try {
        pyodide = await loadPyodide();
        console.log("Pyodide loaded successfully");
    } catch (error) {
        console.error("Failed to load Pyodide:", error);
    }
}

// Call this function when the page loads
initPyodide();

// Show editor as soon as the page loads
function showEditor(lesson) {
    document.getElementById('editor-container').style.display = 'flex';
    if (!editor) {
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/twilight");
        editor.session.setMode("ace/mode/python");
        editor.setOptions({
            fontSize: "18px"  // Increased from 16px
        });
    }
    editor.setValue(`# ${lesson} lesson\n# Start coding here`);
}

async function runCode() {
    const terminal = document.getElementById('terminal');
    
    // Clear the terminal before each run
    terminal.innerHTML = '';  // This will clear the terminal content
    
    terminal.innerHTML += '> Running code...<br>';

    if (!pyodide) {
        terminal.innerHTML += 'Error: Pyodide is not loaded. Please refresh the page and try again.<br>';
        return;
    }

    const code = editor.getValue();

    try {
        // Redirect stdout to capture print statements
        pyodide.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
        `);

        // Run the user's code
        await pyodide.runPythonAsync(code);

        // Get the captured output
        const output = pyodide.runPython("sys.stdout.getvalue()");

        // Use <br> to replace newlines in the output
        terminal.innerHTML += output.replace(/\n/g, '<br>');

        // Reset stdout
        pyodide.runPython("sys.stdout = sys.__stdout__");
    } catch (error) {
        terminal.innerHTML += `Error: ${error.message}<br>`;
    }

    terminal.innerHTML += '> Code execution completed.<br><br>';
    terminal.scrollTop = terminal.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
    // Show the editor only on the page where it is needed
    const editorPage = "learn-page";  // Change this to the correct page where the editor should show
    if (document.body.id === editorPage) {
        showEditor();  // Show the editor only on the specific page
    }

    // Highlight the active navbar item based on the current page URL
    const currentPage = window.location.pathname.split("/").pop();  // Get the current page filename

    // Loop through all the navbar links
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        // Check if the href of the link matches the current page
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');  // Remove active class from non-matching links
        }
    });
});
