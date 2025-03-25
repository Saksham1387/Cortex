export const fetchRAG = async (prompt: string) => {
    const response1 = await fetch('http://localhost:5000/echo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: prompt }),
    });
    const data = await response1.json();
    return data;
}