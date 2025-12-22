document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const runCodeButton = document.querySelector('.run-code');
    const submitCodeButton = document.querySelector('.submit-code');
    const resultsDiv = document.getElementById('results');

    runCodeButton.addEventListener('click', () => {
        try {
            // Use a Function constructor to execute the code in the global scope
            const code = editor.value;
            const func = new Function(code);
            const result = func(); // Execute the code
            resultsDiv.textContent = JSON.stringify(result, null, 2);
        } catch (error) {
            resultsDiv.textContent = 'Error: ' + error;
        }
    });

    submitCodeButton.addEventListener('click', () => {
        alert('Code submitted!'); // Replace with actual submission logic
    });
});